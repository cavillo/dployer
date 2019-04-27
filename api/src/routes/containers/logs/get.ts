import { Request, Response } from 'express';
import * as _ from 'lodash';

// internal dependencies
import { Route, IAppResource } from '../../../lib/Route';

export default class RouteHandlerHealthGet extends Route {
  constructor(options: IAppResource) {
    super(options);

    this.url = '/containers/:id/logs';
  }

  public async callback(req: Request, res: Response): Promise<any> {
    try {
      await this.requireAuthentication(req);
      const { id } = req.params;
      let { tail } = req.body;

      if (_.isNil(id)) {
        throw Error('Wrong "id"');
      }
      if (_.isNil(tail)) {
        tail = 100;
      }

      const logs: string[] = await this.resources.agent.getContainerLogs(id, tail);

      res.json({ logs });
    } catch (ex) {
      return this.detectKnownErrors(ex, res);
    }
  }
}
