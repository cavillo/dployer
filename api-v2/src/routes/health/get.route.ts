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
    this.url = '/health';
  }

  public async callback(req: Request, res: Response): Promise<any> {
    this.resources.logger.error('Health endpoint ok!');
    res.send('Health endpoint ok!');
  }
}