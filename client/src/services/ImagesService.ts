import * as _ from 'lodash';
import ServiceBase from './ServiceBase';
import { IImage } from '../model/Image';

export default class ContainersService extends ServiceBase {
  public async getAll(): Promise<IImage[]> {
    try {
      const response = await this.api.get('/images');
      const retval: IImage[] = _.get(response, 'images', []);
      return retval;
    } catch (err) {
      throw err;
    }
  }

  public async getOne(id: string): Promise<IImage> {
    try {
      const response = await this.api.get(`/images/${id}`);
      const retval: IImage = _.get(response, 'image', null);

      if (!retval) throw new Error('No image found');

      return retval;
    } catch (err) {
      throw err;
    }
  }
}
