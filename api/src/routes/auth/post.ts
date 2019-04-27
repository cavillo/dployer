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

  public async callback(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (_.isEmpty(token) || _.isNil(token)) {
        throw Error('Missing "token"');
      }

      const auths: Authentication[] = await this.resources.services.authentication.getAll();
      if (!auths || _.isEmpty(auths)) {
        throw Error('Invalid token');
      }

      const storedToken = _.find(auths, a => (a.token === token));
      if (_.isNil(storedToken)) {
        throw Error('Invalid token');
      }

      res.json({ token });
    } catch (ex) {
      return this.detectKnownErrors(ex, res);
    }
  }
}
