import dockerode, {
  ContainerInfo,
  Container,
} from 'dockerode';
import * as _ from 'lodash';
import Logger from '../utils/Logger';
import { application } from 'express';

export const BASE_LABEL = 'io.dployer';

export {
  ContainerInfo,
  Container,
} from 'dockerode';

export interface DFilters {
  id?: string;
  name?: string;
  portBindings?: any[];
  applications?: string[];
  namespaces?: string[];
  deployments?: string[];
}
export default class DockerAgent {
  private docker: dockerode;

  constructor() {
    this.docker = new dockerode({
      // socketPath: '/var/run/docker.sock',
      // host: 'http://172.17.0.1',
      // port: 3000,
      // protocol:'http',
    });
  }

  async getContainers(args: DFilters = {}) {
    try {
      let labels = [
        `${BASE_LABEL}=${BASE_LABEL}`,
      ];

      if (args.applications && _.isArray(args.applications)) {
        labels = labels.concat(_.remove(args.applications, n => !_.isNil(n)).map(value => `${BASE_LABEL}.application=${value}`));
      }

      if (args.namespaces && _.isArray(args.namespaces)) {
        labels = labels.concat(_.remove(args.namespaces, n => !_.isNil(n)).map(value => `${BASE_LABEL}.namespace=${value}`));
      }

      if (args.deployments && _.isArray(args.deployments)) {
        labels = labels.concat(_.remove(args.deployments, n => !_.isNil(n)).map(value => `${BASE_LABEL}.deployment=${value}`));
      }

      const filters: any = {
        label: labels,
      };

      if (args.id && _.isString(args.id)) {
        filters.id = [args.id];
      }

      if (args.name && _.isString(args.name)) {
        filters.name = [args.name];
      }

      const data: ContainerInfo[] = await this.docker.listContainers({
        filters,
        all: true,
        limit: 10,
        size: true,
      });

      return data;
    } catch (error) {
      Logger.error(error);
    }
  }

  async runContainer(image: string, cmd: string[], args: DFilters = {}) {
    try {
      const createOptions: any = {
        Image: image,
        Cmd: cmd ? cmd : [],
        AttachStdin: false,
        AttachStdout: false,
        AttachStderr: false,
        Tty: false,
        OpenStdin: false,
        StdinOnce: false,
        Labels: {
        },
        HostConfig: {
          PortBindings: {},
        },
      };
      createOptions.Labels[`${BASE_LABEL}`] = BASE_LABEL;

      let defaultName = 'dployer';

      if (args.applications && _.isArray(args.applications)) {
        defaultName = `${defaultName}-${args.applications[0]}`;
        createOptions.Labels[`${BASE_LABEL}.application`] = args.applications[0];
      }

      if (args.namespaces && _.isArray(args.namespaces)) {
        defaultName = `${defaultName}-${args.namespaces[0]}`;
        createOptions.Labels[`${BASE_LABEL}.namespace`] = args.namespaces[0];
      }

      if (args.deployments && _.isArray(args.deployments)) {
        defaultName = `${defaultName}-${args.deployments[0]}`;
        createOptions.Labels[`${BASE_LABEL}.deployment`] = args.deployments[0];
      }

      if (args.name && _.isString(args.name)) {
        createOptions.name = args.name;
      } else {
        createOptions.name = defaultName;
      }

      // [{'7002': ['127.0.0.1',7002']}]
      if (args.portBindings && _.isArray(args.portBindings)) {
        createOptions.HostConfig.PortBindings = args.portBindings.reduce(
          (obj: any, portBinding: any[]) => {
            const port: string = Object.keys(portBinding)[0];
            const hostBinding: string[] = Object.values(portBinding)[0];
            obj[port] = [
              {
                HostIp: hostBinding[0],
                HostPort: hostBinding[1],
              },
            ];
            return obj;
          },
          {},
        );
      }

      // Getting conflicting containers
      const filters: any = {
        applications: args.applications,
        namespaces: args.namespaces,
        deployments: args.deployments,
        name: createOptions.name,
      };
      const containers: ContainerInfo[] = await this.getContainers(filters) || [];
      for (const containerInfo of containers) {
        Logger.log('Stopping container...', containerInfo.Id, containerInfo.Names, containerInfo.Labels);
        const container = await this.docker.getContainer(containerInfo.Id);
        try {
          await container.stop();
          Logger.ok('Stopped...');
        } catch (error) {
          Logger.error(error.message);
        }

        Logger.log('Removing container...', containerInfo.Id, containerInfo.Names, containerInfo.Labels);
        try {
          await container.remove();
          Logger.ok('Removed...');
        } catch (error) {
          Logger.error(error.message);
        }
      }
      // removing conflicting containers

      let container: Container = await this.docker.createContainer(createOptions);

      container = await container.start();

      return await this.getContainers({ id: container.id });
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  async stopContainer(id: string) {
    try {

      // Getting conflicting containers
      const filters: any = {
        id,
      };
      const containersInfo: ContainerInfo[] = await this.getContainers(filters) || [];

      if (_.isEmpty(containersInfo)) {
        throw Error('No container found');
      }
      const container = await this.docker.getContainer(_.get(containersInfo, '[0].Id'));
      try {
        await container.stop();
        Logger.ok('Stopped...');
      } catch (error) {
        Logger.error(error.message);
      }

      return await this.getContainers({ id: container.id });
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  async killContainer(id: string) {
    try {

      // Getting conflicting containers
      const filters: any = {
        id,
      };
      const containersInfo: ContainerInfo[] = await this.getContainers(filters) || [];

      if (_.isEmpty(containersInfo)) {
        throw Error('No container found');
      }
      const container = await this.docker.getContainer(_.get(containersInfo, '[0].Id'));
      try {
        await container.kill();
        Logger.ok('Killed...');
      } catch (error) {
        Logger.error(error.message);
      }

      return await this.getContainers({ id: container.id });
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  async removeContainer(id: string) {
    try {

      // Getting conflicting containers
      const filters: any = {
        id,
      };
      const containersInfo: ContainerInfo[] = await this.getContainers(filters) || [];

      if (_.isEmpty(containersInfo)) {
        throw Error('No container found');
      }
      const container = await this.docker.getContainer(_.get(containersInfo, '[0].Id'));
      try {
        await container.remove();
        Logger.ok('Removed...');
      } catch (error) {
        Logger.error(error.message);
      }

      return await this.getContainers({ id: container.id });
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  async restartContainer(id: string) {
    try {

      // Getting conflicting containers
      const filters: any = {
        id,
      };
      const containersInfo: ContainerInfo[] = await this.getContainers(filters) || [];

      if (_.isEmpty(containersInfo)) {
        throw Error('No container found');
      }
      const container = await this.docker.getContainer(_.get(containersInfo, '[0].Id'));
      try {
        await container.restart();
        Logger.ok('Restarted...');
      } catch (error) {
        Logger.error(error.message);
      }

      return await this.getContainers({ id: container.id });
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }
}
