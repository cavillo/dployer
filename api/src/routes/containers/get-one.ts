import { Request, Response } from 'express';
import * as _ from 'lodash';

// internal dependencies
import { Route, IAppResource } from '../../lib/Route';
import { ContainerInfo } from '../../lib/DockerAgent';
import { Container } from '../../model';

export default class RouteHandlerHealthGet extends Route {
  constructor(options: IAppResource) {
    super(options);

    this.url = '/containers/:id';
  }

  public async callback(req: Request, res: Response): Promise<any> {
    try {
      await this.requireAuthentication(req);
      const { id } = req.params;

      let dockerContainers: ContainerInfo[] | undefined = await this.resources.agent.getContainers({ id });
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
