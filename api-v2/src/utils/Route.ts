import { NextFunction, Request, Response } from 'express';

// internal dependencies
import { Configuration } from '../conf';
import Logger from './Logger';

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

  public abstract async callback(req: Request, res: Response): Promise<any>;

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
}