import { Request, Response } from 'express';
import * as _ from 'lodash';

// internal dependencies
import { Authentication } from '../../model';
import { Route, IAppResource } from '../../lib/Route';

export default class RouteHandlerHealthGet extends Route {
  constructor(options: IAppResource) {
    super(options);

    this.url = '/authenticate';
  }

  public async callback(req: Request, res: Response): Promise<any> {
    try {
      const { token } = req.body;

      if (_.isEmpty(token) || _.isNil(token)) {
        throw Error('Missing "token"');
      }

      const auths: Authentication[] = await this.resources.services.authentication.getAll();
      if (!auths || _.isEmpty(auths)) {
        throw Error('Invalid token');
      }

      for (const auth of auths) {
        if (auth.token === token) {
          res.json({ token });
        }
      }

      throw Error('Invalid token');
    } catch (ex) {
      return this.detectKnownErrors(ex, res);
    }
  }
}
