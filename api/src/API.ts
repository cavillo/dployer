import express, { Express, NextFunction, Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import * as glob from 'glob';
import * as path from 'path';
import * as _ from 'lodash';

// internal dependencies
import { Configuration } from './conf';
import Logger from './utils/Logger';
import Route, { RouteResources } from './utils/Route';
import MongoDB from './services/MongoDB';
import Docker from './services/Docker';
import Services from './services';

export {
  Request,
  Response,
  Route,
  RouteResources,
};

/*
Class in charge of building an ExpressJS API.
All endpoints should be placed in the ./routes directory
and API will go one by one dynamically adding each route.
*/
export default class API {
  private app: Express;
  private conf: Configuration;
  private logger: Logger;
  private mongo: MongoDB;
  private docker: Docker;
  private services: Services;

  constructor(conf: Configuration, logger: Logger) {
    this.app = express();
    this.conf = conf;
    this.logger = logger;
    this.mongo = new MongoDB(conf.mongo, this.logger);
    this.docker = new Docker(this.logger);
    this.services = new Services(this.docker, this.mongo);
  }

  private async config() {
    // Log entry route
    this.app.use(this.logRoute.bind(this));
    // support application/json type post data
    this.app.use(bodyParser.json());
    // support application/x-www-form-urlencoded post data
    this.app.use(bodyParser.urlencoded({ extended: false }));
    // support cors
    this.app.use(cors());

    await this.mongo.init();
  }

  private async loadRoutes() {
    const trustedEndpoints = ['get', 'delete', 'put', 'post'];

    const resources: RouteResources = {
      conf: this.conf,
      logger: this.logger,
      mongo: this.mongo,
      docker: this.docker,
      services: this.services,
    };

    const routeFiles = glob.sync('./routes/**/*.route.ts', { cwd: __dirname });
    for (const routeFile of routeFiles) {
      const basename = _.toLower(path.basename(routeFile));
      const method = _.toLower(basename.split('.')[0]);

      // skip non route ts files
      // all routes should end in route.ts
      // all routes should start with the HTTP method to implement followed by a dot
      // in trustedEndpoints list
      // eg: post.route.ts
      // eg: get.allByBusiness.route.ts
      if (
           !_.endsWith(basename, '.route.ts')
        || !_.includes(trustedEndpoints, method)
      ) {
        continue;
      }

      const routeClass = require(routeFile).default;
      const routeInstance: Route = new routeClass(resources);

      const apiPrefix = '/api';
      const routeURL = `${apiPrefix}${routeInstance.url}`;

      switch (method) {
        case 'get':
          this.app.get(routeURL, routeInstance.routeCallback.bind(routeInstance));
          break;
        case 'post':
          this.app.post(routeURL, routeInstance.routeCallback.bind(routeInstance));
          break;
        case 'put':
          this.app.put(routeURL, routeInstance.routeCallback.bind(routeInstance));
          break;
        case 'delete':
          this.app.delete(routeURL, routeInstance.routeCallback.bind(routeInstance));
          break;
      }
      this.logger.log('  Loaded route: ', routeInstance.url);
    }
  }

  private async issueInitialToken() {
    const token: string = await this.services.auth.getToken();
    this.logger.warn('');
    this.logger.warn('==============');
    this.logger.warn('Authentication token');
    this.logger.warn('For api calls, set header Authorization: Bearer #AUTH_TOKEN#');
    this.logger.newLine();
    this.logger.clean(token);
    this.logger.newLine();
  }

  private async listen() {
    this.app.listen(
      this.conf.port,
      () => this.logger.ok(`Ready and listening on port ${this.conf.port}!`),
    );
  }

  public async init() {
    await this.config();
    await this.loadRoutes();
    await this.issueInitialToken();
    await this.listen();
  }

  private logRoute = (req: Request, res: Response, next: NextFunction) => {
    this.logger.log(req.method, req.originalUrl);

    const cleanup = () => {
      res.removeListener('finish', logFinish);
    };

    const logFinish = () => {
      cleanup();

      if (res.statusCode >= 500) {
        this.logger.error(req.method, req.originalUrl, res.statusCode);
      } else if (res.statusCode >= 400) {
        this.logger.error(req.method, req.originalUrl, res.statusCode);
      } else if (res.statusCode < 300 && res.statusCode >= 200) {
        this.logger.log(req.method, req.originalUrl, res.statusCode);
      } else {
        this.logger.log(req.method, req.originalUrl, res.statusCode);
      }
    };

    res.on('finish', logFinish);

    next();
  }

}
