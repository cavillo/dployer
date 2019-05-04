import {
  Route,
  Request,
  Response,
  RouteResources,
} from '../../API';

export default class RouteImpl extends Route {
  public url: string;

  constructor(resources: RouteResources) {
    super(resources);
    this.url = '/containers';
  }

  public async callback(req: Request, res: Response): Promise<any> {
    this.resources.logger.warn('Container endpoint ok!');
    res.send('Container endpoint ok!');
  }
}