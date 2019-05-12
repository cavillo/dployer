import * as _ from 'lodash';
import ServiceBase from './ServiceBase';
import { IContainer, IContainerStats } from '../model/Container';

export default class ContainersService extends ServiceBase {
  public async getAll(): Promise<IContainer[]> {
    try {
      const response = await this.api.get('/containers');
      const retval: IContainer[] = _.get(response, 'containers', []);
      return retval;
    } catch (err) {
      throw err;
    }
  }

  public async getOne(id: string): Promise<IContainer> {
    try {
      const response = await this.api.get(`/containers/${id}`);
      const retval: IContainer = _.get(response, 'container', null);

      if (!retval) throw new Error('No container found');

      return retval;
    } catch (err) {
      throw err;
    }
  }

  public async stop(id: string): Promise<IContainer> {
    try {
      const response = await this.api.post(`/containers/${id}/stop`, {});
      const retval: IContainer = _.get(response, 'container');
      return retval;
    } catch (err) {
      throw err;
    }
  }

  public async restart(id: string): Promise<IContainer> {
    try {
      const response = await this.api.post(`/containers/${id}/restart`, {});
      const retval: IContainer = _.get(response, 'container');
      return retval;
    } catch (err) {
      throw err;
    }
  }

  public async start(id: string): Promise<IContainer> {
    try {
      const response = await this.api.post(`/containers/${id}/start`, {});
      const retval: IContainer = _.get(response, 'container');
      return retval;
    } catch (err) {
      throw err;
    }
  }

  public async kill(id: string): Promise<IContainer> {
    try {
      const response = await this.api.post(`/containers/${id}/kill`, {});
      const retval: IContainer = _.get(response, 'container');
      return retval;
    } catch (err) {
      throw err;
    }
  }

  public async remove(id: string): Promise<void> {
    try {
      await this.api.post(`/containers/${id}/remove`, {});
    } catch (err) {
      throw err;
    }
  }

  public async logs(id: string): Promise<string[]> {
    try {
      const response = await this.api.get(`/containers/${id}/logs`);
      const retval: string[] = _.get(response, 'logs', []);
      return retval;
    } catch (err) {
      throw err;
    }
  }

  public async stats(id: string): Promise<IContainerStats> {
    try {
      const response = await this.api.get(`/containers/${id}/stats`);
      const retval: IContainerStats = _.get(response, 'stats', null);

      if (_.isNil(retval)) throw new Error('No stats');

      return retval;
    } catch (err) {
      throw err;
    }
  }
}
