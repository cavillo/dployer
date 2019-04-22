import ClientUser from '../lib/ClientUser';
import Api from '../lib/Api';

export default abstract class ServiceBase {
  public clientUser: ClientUser;

  public api: Api;

  constructor(clientUser: ClientUser) {
    this.clientUser = clientUser;

    this.api = new Api(this.clientUser);
  }
}
