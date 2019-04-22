import { Request, Response } from 'express';

// internal dependencies
import { Route, IAppResource } from '../../lib/Route';
import { Application } from '../../model';

export default class RouteHandlerApplicationsGetAll extends Route {
  constructor(options: IAppResource) {
    super(options);

    this.url = '/applications';
  }

  public async callback(req: Request, res: Response): Promise<any> {
    try {
      await this.requireAuthentication(req);
      this.resources.logger.log('Getting applications!');

      const applications: Application[] = await this.resources.services.application.getAll();

      res.json({ applications });
    } catch (ex) {
      return this.detectKnownErrors(ex, res);
    }
  }
}
