import * as _ from 'lodash';
import Docker, { ContainerInfo, IFilters } from './Docker';

export interface IContainer {
  id: string;
  name: string;
  deployment: string;
  namespace: string;
  application: string;
  image: string;
  imageId: string;
  command: string;
  labels: { [label: string]: string };
  state: string;
  status: string;
  createdAt: number;
}

export interface IContainerStats {
  formattedStats: {
    cpuCurrentUsage: string;
    memoryUsage: string;
    memoryLimit: string;
    memoryPct: string;
    currentPids: string;
  };
  stats: any;
}

export default class ContainerService {
  docker: Docker;

  constructor(docker: Docker) {
    this.docker = docker;
  }

  isValid(obj: IContainer): boolean {
    if (!_.has(obj, 'id') || !_.isString(obj.id)) {
      return false;
    }
    if (!_.has(obj, 'name') || !_.isString(obj.name)) {
      return false;
    }
    if (!_.has(obj, 'application') || !_.isArray(obj.application)) {
      return false;
    }
    if (!_.has(obj, 'namespace') || !_.isArray(obj.namespace)) {
      return false;
    }
    if (!_.has(obj, 'deployment') || !_.isArray(obj.deployment)) {
      return false;
    }
    if (!_.has(obj, 'state') || !_.isArray(obj.state)) {
      return false;
    }
    if (!_.has(obj, 'status') || !_.isArray(obj.status)) {
      return false;
    }
    if (!_.has(obj, 'createdAt') || !_.isString(obj.createdAt)) {
      return false;
    }

    return true;
  }

  castFromDockerContainer(dockerContainer: ContainerInfo): IContainer {
    return {
      id: _.get(dockerContainer, 'Id', null),
      name: _.get(dockerContainer, 'Names[0]', null),
      deployment: _.get(dockerContainer, 'Labels["io.dployer.deployment"]', null),
      namespace: _.get(dockerContainer, 'Labels["io.dployer.namespace"]', null),
      application: _.get(dockerContainer, 'Labels["io.dployer.application"]', null),
      image: _.get(dockerContainer, 'Image', null),
      imageId: _.get(dockerContainer, 'ImageID', null),
      command: _.get(dockerContainer, 'Command', null),
      labels: _.get(dockerContainer, 'Labels', {}),
      state: _.get(dockerContainer, 'State', null),
      status: _.get(dockerContainer, 'Status', null),
      createdAt: _.get(dockerContainer, 'Created', null),
    } as IContainer;
  }

  async logs(id: string, tail: number = 100): Promise<string[]> {
    return await this.docker.getContainerLogs(id, tail);
  }

  async stats(id: string): Promise<IContainerStats> {
    return await this.docker.getContainerStats(id);
  }

  async getById(id: string): Promise<IContainer | null> {
    const dockerContainer: ContainerInfo = await this.docker.getContainerInfoById(id);
    return this.castFromDockerContainer(dockerContainer);
  }

  async getAll(): Promise<IContainer[]> {
    let dockerContainers: ContainerInfo[] | undefined = await this.docker.getContainersInfo();
    dockerContainers = dockerContainers || [];
    const containers: IContainer[] = dockerContainers.map(this.castFromDockerContainer);
    return containers;
  }

  async getAllByFilter(filter: IFilters): Promise<IContainer[]> {
    let dockerContainers: ContainerInfo[] | undefined = await this.docker.getContainersInfo(filter);
    dockerContainers = dockerContainers || [];
    const containers: IContainer[] = dockerContainers.map(this.castFromDockerContainer);
    return containers || [];
  }

  async run(image: string, cmd: string[], filters: IFilters): Promise<IContainer> {
    const response = await this.docker.runContainer(image, cmd, filters);
    return this.castFromDockerContainer(response);
  }

  async create(image: string, cmd: string[], filters: IFilters): Promise<IContainer> {
    const response = await this.docker.runContainer(image, cmd, filters);
    return this.castFromDockerContainer(response);
  }

  async deploy(image: string, cmd: string[], filters: IFilters): Promise<IContainer> {
    const response = await this.docker.runContainer(image, cmd, filters);
    return this.castFromDockerContainer(response);
  }

  async stop(id: string): Promise<IContainer> {
    const dockerContainer = await this.docker.stopContainer(id);
    return this.castFromDockerContainer(dockerContainer);
  }

  async kill(id: string): Promise<IContainer> {
    const dockerContainer = await this.docker.killContainer(id);
    return this.castFromDockerContainer(dockerContainer);
  }

  async remove(id: string): Promise<void> {
    await this.docker.removeContainer(id);
    return;
  }

  async restart(id: string): Promise<IContainer> {
    const dockerContainer = await this.docker.restartContainer(id);
    return this.castFromDockerContainer(dockerContainer);
  }

  async start(id: string): Promise<IContainer> {
    const dockerContainer = await this.docker.startContainer(id);
    return this.castFromDockerContainer(dockerContainer);
  }

}