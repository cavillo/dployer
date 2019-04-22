import { Request, Response } from 'express';

// internal dependencies
import { Route, IAppResource } from '../../lib/Route';
import { ContainerInfo } from '../../lib/DockerAgent';
import { Container } from '../../model';

export default class RouteHandlerHealthGet extends Route {
  constructor(options: IAppResource) {
    super(options);

    this.url = '/containers';
  }

  public async callback(req: Request, res: Response): Promise<any> {
    try {
      await this.requireAuthentication(req);
      const { application, namespace, deployment } = req.query;

      const filters: any = {
        applications: [application],
        namespaces: [namespace],
        deployments:  [deployment],
      };

      let dockerContainers: ContainerInfo[] | undefined = await this.resources.agent.getContainers(filters);
      dockerContainers = dockerContainers || [];
      const containers: Container[] = dockerContainers.map(this.resources.services.container.castFromDockerContainer);

      if (containers) {
        res.json({ containers });
      } else {
        res.json({ containers: [] });
      }
    } catch (ex) {
      return this.detectKnownErrors(ex, res);
    }
  }
}
