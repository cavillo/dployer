import express, { Express, NextFunction, Request, Response } from 'express';
import * as CryptoJS from 'crypto-js';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import * as glob from 'glob';
import * as path from 'path';
import * as _ from 'lodash';

import Logger from './utils/Logger';
import RedisService from './lib/RedisService';
import Services from './services/Services';
import DockerAgent from './lib/DockerAgent';
import { Route, IAppResource } from './lib/Route';
import { Authentication } from './model';
import conf from './conf';

// constants/variables
const trustedEndpoints = ['get', 'delete', 'put', 'patch', 'post', 'ws'];

export default class Api {

  private app: Express;
  private agent: DockerAgent;
  private redis: RedisService;
  private services: Services;

  constructor() {
    this.app = express();
    this.agent = new DockerAgent();
    this.redis = new RedisService();
    this.services = new Services();
  }

  private logRoute = (req: Request, res: Response, next: NextFunction) => {
    Logger.log(`${req.method} ${req.originalUrl}`);

    const cleanup = () => {
      res.removeListener('finish', logFinish);
    };

    const logFinish = () => {
      cleanup();

      let log = Logger.log;
      if (res.statusCode >= 500) {
        log = Logger.error;
      } else if (res.statusCode >= 400) {
        log = Logger.error;
      } else if (res.statusCode < 300 && res.statusCode >= 200) {
        log = Logger.ok;
      }
      log(`${req.method} ${req.originalUrl} ${res.statusCode}`);
    };

    res.on('finish', logFinish);

    next();
  }

  private async config() {
    // Log entry route
    this.app.use(this.logRoute);
    // support application/json type post data
    this.app.use(bodyParser.json());
    // support application/x-www-form-urlencoded post data
    this.app.use(bodyParser.urlencoded({ extended: false }));
    // support cors
    this.app.use(cors());
  }

  public async init() {
    const routes = [];
    let extension;
    let basename;
    let route;
    let method;
    let isEndpointMethodSafe: boolean;
    let isRouteUrlPresent: boolean;

    await this.config();

    const files = glob.sync('./routes/**/*.ts', { cwd: __dirname });
    for (const file of files) {
      extension = path.extname(file);
      basename = path.basename(file);

      // skip non-ts files
      if (_.toLower(extension) !== '.ts') {
        return;
      }

      // skip index.ts
      if (basename === 'index.ts') {
        return;
      }

      // put this file at the front of the stack of routes that we'll attempt
      // to load; we put it at the front because we'd want the more explicit
      // routes to always load first... ie:
      // load /loads/statuses before /loads/:id
      // If we had loaded /loads/:id first, the user would hit the wrong
      // endpoint when requesting /loads/statuses
      routes.unshift(file);
    }

    for (const routePath of routes) {
      Logger.log(`Loading route ${routePath}`);
      extension = path.extname(routePath);
      basename = path.basename(routePath);

      // load the route into place and pass it the things it needs
      const routeSpec = require(routePath).default;
      route = new routeSpec({
        conf,
        app: this.app,
        agent: this.agent,
        logger: Logger,
        redis: this.redis,
        services: this.services,
      } as IAppResource);

      // check to see if the file is an instance of our Route object
      if (route instanceof Route) {
        method = basename.replace(extension, '');

        if (['get-all', 'get-one'].indexOf(_.toLower(method)) > -1) {
          method = 'get';
        }

        isEndpointMethodSafe = (trustedEndpoints.indexOf(method) > -1);
        isRouteUrlPresent = (_.has(route, 'url'));

        // ensure this is a trusted method
        if (isEndpointMethodSafe && isRouteUrlPresent) {

          const apiPath = '/api';
          const routePath = `${apiPath}${route.url}`;

          switch (method) {
            case 'get':
              this.app.get(routePath, route.callback.bind(route));
              break;
            case 'post':
              this.app.post(routePath, route.callback.bind(route));
              break;
            case 'put':
              this.app.put(routePath, route.callback.bind(route));
              break;
            case 'delete':
              this.app.delete(routePath, route.callback.bind(route));
              break;
          }
        } else {
          Logger.error(`!!! not loading route: ${route.url}`);
        }
      }
    }

    Logger.log('Authentication token');
    Logger.log('For api calls, set header Authorization: Bearer #AUTH_TOKEN#');
    const auths: Authentication[] = await this.services.authentication.getAll();
    let auth: Authentication;
    if (!auths || _.isEmpty(auths)) {
      auth = {
        token: CryptoJS.SHA512(`${Math.random()}-${new Date().toISOString()}`).toString(),
      } as Authentication;
      await this.services.authentication.upsert(auth);
    } else {
      auth = auths[0];
    }
    Logger.ok(`AUTH_TOKEN=[ ${auth.token} ]`);
    const port = conf.port;
    this.app.listen(port, () => Logger.ok(`Listening on port ${port}!`));
  }
}
