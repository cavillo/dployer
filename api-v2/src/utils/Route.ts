import { NextFunction, Request, Response } from 'express';
import * as _ from 'lodash';

// internal dependencies
import { Configuration } from '../conf';
import Logger from './Logger';
import KnownErrors from './KnownErrors';

export interface RouteResources {
  conf: Configuration;
  logger: Logger;
}

export default abstract class Route {
  public resources: RouteResources;
  public url: string;

  constructor(resources: RouteResources) {
    // extend this object with everything passed in as options
    this.resources = resources;
    this.url = '';
  }

  public async routeCallback(req: Request, res: Response): Promise<any> {
    try {
      return await this.callback(req, res);
    } catch (error) {
      await this.detectKnownErrors(error, res);
    }
  }

  protected abstract async callback(req: Request, res: Response): Promise<any>;

  protected async requireAuthentication(req: Request) {
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

  private async detectKnownErrors(thrownError: Error, httpResponse: any) {
    let message = _.get(thrownError, 'message', 'Unknown error');
    let statusCode = _.get(thrownError, 'statusCode', 500);

    const error = KnownErrors.lookupError(thrownError);
    if (error) {
      message = error.message;
      statusCode = error.code;
    }

    this.resources.logger.error(statusCode, message, JSON.stringify(thrownError));
    httpResponse.status(statusCode).send(message);
    return;
  }
}