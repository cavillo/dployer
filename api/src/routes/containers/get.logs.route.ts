import * as _ from 'lodash';
import {
  Request,
  Response,
  Route,
  RouteResources,
} from '../../API';

import { IContainer } from '../../services/Docker';

export default class RouteImpl extends Route {
  public url: string;

  constructor(resources: RouteResources) {
    super(resources);
    this.url = '/containers/:id/logs';
  }

  public async callback(req: Request, res: Response): Promise<any> {
    await this.requireAuthentication(req);

    const { id } = req.params;
    let { tail } = req.body;

    if (_.isNil(id)) {
      throw Error('Wrong "id"');
    }
    if (_.isNil(tail)) {
      tail = 100;
    }

    const logs: string[] = await this.resources.services.container.logs(id);

    res.json({ logs });
  }
}