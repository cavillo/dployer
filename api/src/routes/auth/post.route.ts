import * as _ from 'lodash';
import {
  Request,
  Response,
  Route,
  RouteResources,
} from '../../API';

export default class RouteImpl extends Route {
  public url: string;

  constructor(resources: RouteResources) {
    super(resources);
    this.url = '/authenticate';
  }

  public async callback(req: Request, res: Response): Promise<any> {

    const { token } = req.body;

    if (_.isEmpty(token) || _.isNil(token)) {
      throw Error('Missing "token"');
    }

    await this.resources.services.auth.validateToken(token);

    res.json({ token });
  }
}