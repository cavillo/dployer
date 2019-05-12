import ServiceBase from './ServiceBase';

export default class AuthenticationService extends ServiceBase {
  public async authenticate(token: string) {
    try {
      const response = await this.api.post('/authenticate', { token });
      return response;
    } catch (err) {
      throw err;
    }
  }
}
