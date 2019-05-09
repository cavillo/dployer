import dockerode, {
  ContainerInfo,
  Container,
  DockerOptions,
} from 'dockerode';
import * as _ from 'lodash';
import stream from 'stream';
import Logger from '../utils/Logger';
import { IContainerStats, IContainer } from './Container';

export const BASE_LABEL = 'io.dployer';

export {
  ContainerInfo,
  Container,
  DockerOptions,
  IContainerStats,
  IContainer,
};

export interface IFilters {
  id?: string;
  name?: string;
  portBindings?: any[];
  applications?: string[];
  namespaces?: string[];
  deployments?: string[];
}

export default class Docker {
  private logger: Logger;
  private docker: dockerode;

  constructor(logger: Logger, opts?: DockerOptions) {
    this.logger = logger;
    if (opts) {
      this.docker = new dockerode(opts);
    } else {
      this.docker = new dockerode({
        // socketPath: '/var/run/docker.sock',
        // host: 'http://172.17.0.1',
        // port: 3000,
        // protocol:'http',
      });
    }
  }

  async getContainers(args: IFilters = {}): Promise<ContainerInfo[]> {
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

      const containers: ContainerInfo[] = await this.docker.listContainers({
        filters,
        all: true,
        limit: 10,
        size: true,
      });
      return containers || [];
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }

  async getContainerLogs(id: string, tail: number = 100): Promise<string[]> {
    const container: Container = await this.docker.getContainer(id);
    const logStream = new stream.PassThrough();
    const logOpts: dockerode.ContainerLogsOptions = {
      tail,
      stdout: true,
      stderr: true,
      follow: true,
    };

    const streamLogs = await container.logs(logOpts);

    return new Promise((resolve, reject) => {
      try {
        container.modem.demuxStream(streamLogs, logStream, logStream);
        const logs: string[] = [];
        streamLogs.on('error', (err) => {
          logStream.destroy();
          reject(err);
        });

        streamLogs.on('end', () => {
          logStream.destroy();
          resolve(logs);
        });

        logStream.on('data', (chunk: any) => {
          logs.push(chunk.toString('utf8'));
        });

        setTimeout(
          () => {
            logStream.destroy();
            resolve(logs);
          },
          2000,
        );
      } catch (error) {
        logStream.destroy();
        reject(error);
      }
    });
  }

  async pullImage(image: string) {
    const logStream = new stream.PassThrough();
    const streamLogs = await this.docker.pull(image, {});

    return new Promise((resolve, reject) => {
      try {
        this.docker.modem.demuxStream(streamLogs, logStream, logStream);
        streamLogs.on('error', (err: any) => {
          this.logger.error('Pulling Image', err);
          logStream.destroy();
          reject(err);
        });

        streamLogs.on('end', () => {
          this.logger.log('Pulling Image', 'ended....');
          logStream.destroy();
          resolve();
        });

        logStream.on('data', (chunk: any) => {
          this.logger.log('Pulling Image', chunk.toString('utf8'));
        });

        // setTimeout(
        //   () => {
        //     logStream.destroy();
        //     resolve(logs);
        //   },
        //   2000,
        // );
      } catch (error) {
        this.logger.error('Pulling Image', error);
        logStream.destroy();
        reject(error);
      }
    });
  }

  async runContainer(image: string, cmd: string[], args: IFilters = {}) {
    // validating image
    if (!image) {
      throw new Error('No image provided...');
    }
    if (!_.isString(image)) {
      throw new Error('Invalid image...');
    }
    // Pulling the immage
    try {
      await this.pullImage(image);
    } catch (error) {
      console.log(error.toString());
      throw new Error('Error pulling image...');
    }

    // Docker API create container options
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
    // - Adding "Made in Dployer" label ;)
    // - Here we could add another label for
    //   separating multiple instances of dployer
    createOptions.Labels[`${BASE_LABEL}`] = BASE_LABEL;

    // Building args
    let defaultName = BASE_LABEL;
    if (args.applications && _.isArray(args.applications)) {
      defaultName = `${defaultName}-${args.applications[0]}`;
      createOptions.Labels[`${BASE_LABEL}.application`] = args.applications[0];
    } else {
      throw new Error('Missing application...');
    }
    if (args.namespaces && _.isArray(args.namespaces)) {
      defaultName = `${defaultName}-${args.namespaces[0]}`;
      createOptions.Labels[`${BASE_LABEL}.namespace`] = args.namespaces[0];
    } else {
      throw new Error('Missing namespace...');
    }
    if (args.deployments && _.isArray(args.deployments)) {
      defaultName = `${defaultName}-${args.deployments[0]}`;
      createOptions.Labels[`${BASE_LABEL}.deployment`] = args.deployments[0];
    } else {
      throw new Error('Missing deployment...');
    }
    if (args.name && _.isString(args.name)) {
      createOptions.name = args.name;
    } else {
      createOptions.name = defaultName;
    }

    // WIP
    // Port bindings come in the following format
    // []
    // and they are converted into this.
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

    // removing conflicting containers
    for (const containerInfo of containers) {
      this.logger.log('Stopping existing container...', containerInfo.Id, containerInfo.Names, containerInfo.Labels);
      const container = await this.docker.getContainer(containerInfo.Id);
      try {
        await container.stop();
        this.logger.ok('Stopped...');
      } catch (error) {
        this.logger.error(error.message);
      }

      this.logger.log('Removing existing container...', containerInfo.Id, containerInfo.Names, containerInfo.Labels);
      try {
        await container.remove();
        this.logger.ok('Removed...');
      } catch (error) {
        this.logger.error(error.message);
      }
    }

    // creating container
    try {
      let container: Container = await this.docker.createContainer(createOptions);

      container = await container.start();
      const retval = await this.getContainers({ id: container.id });
      if (!retval[0]) throw new Error('Error running contiaer');
      return retval[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new Error(error);
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
      await container.stop();
      this.logger.ok('Stopped...');

      return await this.getContainers({ id: container.id });
    } catch (error) {
      if (error.reason === 'container already stopped') {
        return await this.getContainers({ id });
      }
      this.logger.error(JSON.stringify(error));
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
        this.logger.ok('Killed...');
      } catch (error) {
        this.logger.error(error.message);
      }

      return await this.getContainers({ id: container.id });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getContainerStats(id: string): Promise<IContainerStats> {
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
      const stats = await container.stats({ stream: false });

      const memoryUsage = _.get(stats, 'memory_stats.usage', 0);
      const memoryLimit = _.get(stats, 'memory_stats.limit', 0);
      let memoryPct = _.divide(memoryUsage, memoryLimit).toFixed(2);
      if (memoryPct === '0.00') {
        memoryPct = '0.01%';
      } else {
        memoryPct = `${memoryPct}%`;
      }

      const currentPids = _.get(stats, 'pids_stats.current', 0);
      let cpuCurrentUsage = this.calculateCPUPercentUnix(stats);
      cpuCurrentUsage = `${cpuCurrentUsage}%`;

      const retval: IContainerStats = {
        stats,
        formattedStats: {
          cpuCurrentUsage,
          memoryPct,
          currentPids,
          memoryUsage: this.formatBytes(memoryUsage),
          memoryLimit: this.formatBytes(memoryLimit),
        },
      };

      return retval;
    } catch (error) {
      this.logger.error(error);
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
        this.logger.ok('Removed...');
      } catch (error) {
        this.logger.error(error.message);
      }

      return await this.getContainers({ id: container.id });
    } catch (error) {
      this.logger.error(error);
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
        this.logger.ok('Restarted...');
      } catch (error) {
        this.logger.error(error.message);
      }

      return await this.getContainers({ id: container.id });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private formatBytes(bytesData: string, decimals = 2) {
    const bytes = _.isNumber(bytesData) ? bytesData : _.toNumber(bytesData);
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(dm)} ${sizes[i]}`;
  }

  private calculateCPUPercentUnix = (stats: any) => {
    let cpuPercent = 0.0;
    const cpuDelta = _.get(stats, 'cpu_stats.cpu_usage.total_usage', 0) - _.get(stats, 'precpu_stats.cpu_usage.total_usage', 0);
    const systemDelta = _.get(stats, 'cpu_stats.system_cpu_usage', 0) - _.get(stats, 'precpu_stats.system_cpu_usage', 0);
    const nCPU = _.get(stats, 'cpu_stats.online_cpus', 1);

    if (systemDelta > 0 && cpuDelta > 0) {
      cpuPercent = ((cpuDelta / systemDelta) * nCPU) * 100;
    }

    return cpuPercent.toFixed(2);
  }

}