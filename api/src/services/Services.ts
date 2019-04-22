import ApplicationService from './ApplicationService';
import AuthenticationService from './AuthenticationService';
import ContainerService from './ContainerService';

export default class Services {
  public application: ApplicationService;
  public authentication: AuthenticationService;
  public container: ContainerService;

  constructor() {
    this.application = new ApplicationService();
    this.authentication = new AuthenticationService();
    this.container = new ContainerService();
  }
}
