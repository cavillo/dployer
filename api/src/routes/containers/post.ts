import { Request, Response } from 'express';
import * as _ from 'lodash';

// internal dependencies
import { Route, IAppResource } from '../../lib/Route';
import { Container } from '../../model';

export default class RouteHandlerHealthGet extends Route {
  constructor(options: IAppResource) {
    super(options);

    this.url = '/containers';
  }

  public async callback(req: Request, res: Response): Promise<any> {
    try {
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
        deployments:  [deployment],
      };

      let dockerContainers = await this.resources.agent.runContainer(image, cmd, filters);
      dockerContainers = dockerContainers || [];
      const container: Container = _.get(dockerContainers.map(this.resources.services.container.castFromDockerContainer), '[0]', null);

      if (container) {
        res.json({ container });
      } else {
        res.json({ container: null });
      }
    } catch (ex) {
      return this.detectKnownErrors(ex, res);
    }
  }
}
