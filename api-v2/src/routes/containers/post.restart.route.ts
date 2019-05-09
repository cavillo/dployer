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
    this.url = '/containers/:id/restart';
  }

  public async callback(req: Request, res: Response): Promise<any> {
    await this.requireAuthentication(req);

    const { id } = req.params;

    const container: IContainer = await this.resources.services.container.restart(id);

    res.json({ container });
  }
}