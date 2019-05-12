import * as _ from 'lodash';
import {
  Request,
  Response,
  Route,
  RouteResources,
} from '../../API';

import { IContainerStats } from '../../services/Docker';

export default class RouteImpl extends Route {
  public url: string;

  constructor(resources: RouteResources) {
    super(resources);
    this.url = '/containers/:id/stats';
  }

  public async callback(req: Request, res: Response): Promise<any> {
    await this.requireAuthentication(req);

    const { id } = req.params;

    if (_.isNil(id)) {
      throw Error('Wrong "id"');
    }

    const stats: IContainerStats = await this.resources.services.container.stats(id);

    res.json({ stats });
  }
}