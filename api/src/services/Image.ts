import * as _ from 'lodash';
import Docker, { ImageInfo } from './Docker';

export interface IImage {
  id: string;
  name: string;
}

export default class ImagesService {
  docker: Docker;

  constructor(docker: Docker) {
    this.docker = docker;
  }

  isValid(obj: IImage): boolean {
    if (!_.has(obj, 'id') || !_.isString(obj.id)) {
      return false;
    }
    if (!_.has(obj, 'name') || !_.isString(obj.name)) {
      return false;
    }

    return true;
  }

  castFromDockerImage(dockerContainer: ImageInfo): IImage {
    return {
      id: _.get(dockerContainer, 'Id', null),
      name: _.get(dockerContainer, 'Name', null),
    } as IImage;
  }

  async logs(id: string, tail: number = 100): Promise<string[]> {
    try {
      return await this.docker.getContainerLogs(id, tail);
    } catch (error) {
      return [];
    }
  }

  async getAll(): Promise<IImage[]> {
    try {
      const images: ImageInfo[] = await this.docker.getImagesInfo();
      return images.map(this.castFromDockerImage);
    } catch (error) {
      return [];
    }
  }

  async getById(id: string): Promise<IImage | null> {
    try {
      const dockerImage: ImageInfo = await this.docker.getImageInfoById(id);
      return this.castFromDockerImage(dockerImage);
    } catch (error) {
      return null;
    }
  }

}