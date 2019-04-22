import ClientUser from '../lib/ClientUser';
import ContainersService from './ContainersService';
import AuthenticationService from './AuthenticationService';

export default class ClientServices {

  public clientUser: ClientUser;
  public services: {
    containers: ContainersService;
    authentication: AuthenticationService;
  };

  constructor() {
    this.clientUser = new ClientUser();
    this.services = {
      containers: new ContainersService(this.clientUser),
      authentication: new AuthenticationService(this.clientUser),
    };
  }
}
