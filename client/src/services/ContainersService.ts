import * as _ from 'lodash';
import ClientUserBase from '../lib/ClientUser';
import ServiceBase from './ServiceBase';
import { Container } from '../model/Container';

export default class ContainersService extends ServiceBase {
  constructor(clientUser: ClientUserBase) {
    super(clientUser);
  }

  public async getAll(): Promise<Container[]> {
    try {
      const response = await this.api.get('/containers');
      const retval: Container[] = _.get(response, 'containers', []);
      return retval;
    } catch (err) {
      throw err;
    }
  }

  public async stop(id: string): Promise<Container> {
    try {
      const response = await this.api.post(`/containers/${id}/stop`, {});
      const retval: Container = _.get(response, 'container');
      return retval;
    } catch (err) {
      throw err;
    }
  }

  public async restart(id: string): Promise<Container> {
    try {
      const response = await this.api.post(`/containers/${id}/restart`, {});
      const retval: Container = _.get(response, 'container');
      return retval;
    } catch (err) {
      throw err;
    }
  }

  public async kill(id: string): Promise<Container> {
    try {
      const response = await this.api.post(`/containers/${id}/kill`, {});
      const retval: Container = _.get(response, 'container');
      return retval;
    } catch (err) {
      throw err;
    }
  }

  public async remove(id: string): Promise<Container> {
    try {
      const response = await this.api.post(`/containers/${id}/remove`, {});
      const retval: Container = _.get(response, 'container');
      return retval;
    } catch (err) {
      throw err;
    }
  }
}
