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
    this.url = '/containers/:id/run';
  }

  public async callback(req: Request, res: Response): Promise<any> {
    await this.requireAuthentication(req);

    const { image, cmd, application, namespace, deployment, name, portBindings } = req.body;

    if (_.isEmpty(image) || _.isNil(image)) {
      throw Error('Missing "image"');
    }

    if (_.isEmpty(application) || _.isNil(application)) {
      throw Error('Missing "application"');
    }

    if (_.isEmpty(deployment) || _.isNil(deployment)) {
      throw Error('Missing "deployment"');
    }

    if (_.isEmpty(namespace) || _.isNil(namespace)) {
      throw Error('Missing "namespace"');
    }

    const filters: any = {
      name,
      portBindings,
      applications: [application],
      namespaces: [namespace],
      deployments: [deployment],
    };

    const container: IContainer = await this.resources.services.container.run(image, cmd, filters);

    res.json({ container });
  }
}