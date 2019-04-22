import { Request, Response } from 'express';
import * as _ from 'lodash';

// internal dependencies
import { Route, IAppResource } from '../../lib/Route';
import { Application } from '../../model';

export default class RouteHandlerApplicationsPost extends Route {
  constructor(options: IAppResource) {
    super(options);

    this.url = '/applications';
  }

  public async callback(req: Request, res: Response): Promise<any> {
    try {
      await this.requireAuthentication(req);
      this.resources.logger.log('Getting containers!', req.body);

      const { application } = req.body;

      if (_.isEmpty(application) || _.isNil(application)) {
        throw Error('Missing "application"');
      }

      // if (!_.isString(application)) {
      //   throw Error('Invalid "application"');
      // }

      await this.resources.services.application.upsert(application);

      res.json({ application });
    } catch (ex) {
      return this.detectKnownErrors(ex, res);
    }
  }
}
