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
    this.url = '/containers';
  }

  public async callback(req: Request, res: Response): Promise<any> {
    await this.requireAuthentication(req);

    const { application, namespace, deployment } = req.query;

    const filters: any = {
      applications: [application],
      namespaces: [namespace],
      deployments: [deployment],
    };

    const containers: IContainer[] = await this.resources.services.container.getAllByFilter(filters);

    if (containers) {
      res.json({ containers });
    } else {
      res.json({ containers: [] });
    }

  }
}