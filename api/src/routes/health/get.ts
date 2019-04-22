// external dependencies
// import * as _ from 'lodash';
// import * as moment from 'moment';
// import * as admin from 'firebase-admin';
import { Request, Response } from 'express';

// internal dependencies
import { Route, IAppResource } from '../../lib/Route';

export default class RouteHandlerHealthGet extends Route {
  constructor(options: IAppResource) {
    super(options);

    this.url = '/health';
  }

  public async callback(req: Request, res: Response): Promise<any> {
    try {
      this.resources.logger.log('Getting health!');
      res.send('Health: OK!');
    } catch (ex) {
      return this.detectKnownErrors(ex, res);
    }
  }
}
