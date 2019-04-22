import * as _ from 'lodash';
import { Request, Response } from 'express';

// internal dependencies
import { Route, IAppResource } from '../../lib/Route';
import { Application } from '../../model';

export default class RouteHandlerApplicationsGetAll extends Route {
  constructor(options: IAppResource) {
    super(options);

    this.url = '/applications/:id';
  }

  public async callback(req: Request, res: Response): Promise<any> {
    try {
      await this.requireAuthentication(req);
      const { id } = req.params;

      if (!_.isString(id) || _.isEmpty(id)) {
        throw Error('Missing "id"');
      }

      await this.resources.services.application.delete(id);

      res.json(true);
    } catch (ex) {
      return this.detectKnownErrors(ex, res);
    }
  }
}
