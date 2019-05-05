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

  constructor(conf: Configuration, logger: Logger) {
    this.app = express();
    this.conf = conf;
    this.logger = logger;
    this.mongo = new MongoDB(conf.mongo, this.logger);
  }

  private async config() {
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

      switch (method) {
        case 'get':
          this.app.get(routeInstance.url, routeInstance.routeCallback.bind(routeInstance));
          break;
        case 'post':
          this.app.post(routeInstance.url, routeInstance.routeCallback.bind(routeInstance));
          break;
        case 'put':
          this.app.put(routeInstance.url, routeInstance.routeCallback.bind(routeInstance));
          break;
        case 'delete':
          this.app.delete(routeInstance.url, routeInstance.routeCallback.bind(routeInstance));
          break;
      }
      this.logger.log(_.upperCase(method), routeInstance.url);
    }
  }

  private async listen() {
    this.app.listen(
      this.conf.port,
      () => this.logger.ok(`${this.conf.environment}.${this.conf.service} listening on port ${this.conf.port}!`),
    );
  }

  public async init() {
    await this.config();
    await this.loadRoutes();
    await this.listen();
  }
}
