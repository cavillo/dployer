import express, { Express, NextFunction, Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import * as glob from 'glob';
import * as path from 'path';
import * as _ from 'lodash';

// internal dependencies
import { Configuration } from './conf';
import Logger from './utils/Logger';

export {
  Request,
  Response,
};

export default class API {
  private app: Express;
  private conf: Configuration;
  private logger: Logger;

  constructor(conf: Configuration, logger: Logger) {
    this.app = express();
    this.conf = conf;
    this.logger = logger;
  }

  private async config() {
    // support application/json type post data
    this.app.use(bodyParser.json());
    // support application/x-www-form-urlencoded post data
    this.app.use(bodyParser.urlencoded({ extended: false }));
    // support cors
    this.app.use(cors());
  }

  private async loadRoutes() {
    const trustedEndpoints = ['get', 'delete', 'put', 'post'];

    const resources: RouteResources = {
      conf: this.conf,
      logger: this.logger,
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
      // eg: get.route.ts
      // eg: get.all.route.ts
      // eg: get.allByBusiness.route.ts
      // eg: put.route.ts
      // eg: del.route.ts
      if (
           !_.endsWith(basename, '.route.ts')
        || !_.includes(trustedEndpoints, method)
      ) {
        continue;
      }

      const routeClass = require(routeFile).default;
      const routeInstance: Route = new routeClass(resources);

      // routeInstance.callback();

      switch (method) {
        case 'get':
          this.app.get(routeInstance.url, routeInstance.callback.bind(routeInstance));
          break;
        case 'post':
          this.app.post(routeInstance.url, routeInstance.callback.bind(routeInstance));
          break;
        case 'put':
          this.app.put(routeInstance.url, routeInstance.callback.bind(routeInstance));
          break;
        case 'delete':
          this.app.delete(routeInstance.url, routeInstance.callback.bind(routeInstance));
          break;
      }
    }
  }

  private async listen() {
    this.app.listen(
      this.conf.port,
      () => this.logger.ok(`Example app listening on port ${this.conf.port}!`),
    );
  }

  public async init() {
    await this.config();
    await this.loadRoutes();
    await this.listen();
  }
}

export interface RouteResources {
  conf: Configuration;
  logger: Logger;
}

export abstract class Route {
  public resources: RouteResources;
  public url: string;

  constructor(resources: RouteResources) {
    // extend this object with everything passed in as options
    this.resources = resources;
    this.url = '';
  }

  public abstract async callback(req: Request, res: Response): Promise<any>;

  private async requireAuthentication(req: Request) {
    // Requiring token in Authorization header in the format
    // Bearer #accessToken#
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw Error('No authorization header provided');
    }

    const authSplit = authHeader.split(' ');

    if (authSplit.length !== 2) {
      throw Error('Malformed authentication header. \'Bearer accessToken\' syntax expected');
    } else if (authSplit[0].toLowerCase() !== 'bearer') {
      throw Error('\'Bearer\' keyword missing from front of authorization header');
    }

    const token = authSplit[1];
    return;
  }
}