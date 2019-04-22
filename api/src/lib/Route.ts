// external dependencies
import * as _ from 'lodash';
// import * as moment from 'moment';
// import * as admin from 'firebase-admin';
import { NextFunction, Request, Response } from 'express';

// internal dependencies
import DockerAgent from '../lib/DockerAgent';
import { ErrorService } from '../lib/ErrorService';
import RedisService from '../lib/RedisService';
import Services from '../services/Services';
import { Authentication } from '../model';

export interface IAppResource {
  app: any;
  logger: any;
  agent: DockerAgent;
  redis: RedisService;
  services: Services;
}

export abstract class Route {

  public url: string;
  public resources: IAppResource;

  constructor(options: IAppResource) {
    // extend this object with everything passed in as options
    this.url = '';
    this.resources = options;
  }

  protected async detectKnownErrors(thrownError: Error, httpResponse: any) {
    this.resources.logger.error(thrownError.message, JSON.stringify(thrownError));

    if (_.get(thrownError, 'statusCode', false) && _.get(thrownError, 'json.message', false)) {
      httpResponse.status(_.get(thrownError, 'statusCode', 500)).send(_.get(thrownError, 'json.message', false));
      return;
    }

    const error = ErrorService.lookupError(thrownError);

    if (error) {
      httpResponse.status(error.code).send(error.message);
      return;
    }

    if (!_.isEmpty(httpResponse)) {
      httpResponse.status(500).end();
      return;
    }

    httpResponse.status(500).send('Unknown error');
    return;
  }

  protected async requireAuthentication(req: Request) {
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
    try {
      const auths: Authentication[] = await this.resources.services.authentication.getAll();
      if (!auths || _.isEmpty(auths)) {
        throw Error('Invalid token');
      }

      for (const auth of auths) {
        if (auth.token === token) {
          return true;
        }
      }

      throw Error('Invalid token');
    } catch (error) {
      if (error.code === 'auth/id-token-revoked') {
        throw Error('Token has been revoked. User must reauthenticate or signOut');
      }
      throw Error('Invalid token');
    }
  }

  public abstract async callback(req: Request, res: Response, next: NextFunction): Promise<any>;
}
