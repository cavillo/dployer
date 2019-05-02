import { Request, Response } from 'express';
import * as _ from 'lodash';

// internal dependencies
import { Route, IAppResource } from '../../../lib/Route';

export default class RouteHandlerContainersStatsGet extends Route {
  constructor(options: IAppResource) {
    super(options);

    this.url = '/containers/:id/stats';
  }

  public async callback(req: Request, res: Response): Promise<any> {
    try {
      await this.requireAuthentication(req);
      const { id } = req.params;

      if (_.isNil(id)) {
        throw Error('Wrong "id"');
      }

      const stats: any = await this.resources.agent.getContainerStats(id);

      // const stats: any = {};

      res.json({ stats });
    } catch (ex) {
      return this.detectKnownErrors(ex, res);
    }
  }
}
