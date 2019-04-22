import * as _ from 'lodash';
import ClientUserBase from '../lib/ClientUser';
import ServiceBase from './ServiceBase';

export default class AuthenticationService extends ServiceBase {
  constructor(clientUser: ClientUserBase) {
    super(clientUser);
  }

  public async authenticate(token: string) {
    try {
      const response = await this.api.post('/authenticate', { token });
      return response;
    } catch (err) {
      throw err;
    }
  }
}
