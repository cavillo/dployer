import dockerode, {
  ContainerInfo,
  Container,
} from 'dockerode';
import * as _ from 'lodash';
import stream from 'stream';
import Logger from '../utils/Logger';
import { ContainerStats } from '../model';
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
    return new Promise((resolve, reject) => {
      this.docker.pull(image, (err: any, stream: stream) => {
        if (err) reject();
        const onFinished = (err: Error, output: any) => {
          resolve();
        };
        const onProgress = (event: any) => {
          // Logger.log(`${_.get(event, 'status', '')} ${_.get(event, 'progress', '')}`);
        };
        this.docker.modem.followProgress(stream, onFinished, onProgress);
      });
    });
  }

  async runContainer(image: string, cmd: string[], args: DFilters = {}) {
    try {

      await this.pullImage(image);

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

      // removing conflicting containers
      for (const containerInfo of containers) {
        // Logger.log('Stopping existing container...', containerInfo.Id, containerInfo.Names, containerInfo.Labels);
        const container = await this.docker.getContainer(containerInfo.Id);
        try {
          await container.stop();
          Logger.ok('Stopped...');
        } catch (error) {
          Logger.error(error.message);
        }

        // Logger.log('Removing existing container...', containerInfo.Id, containerInfo.Names, containerInfo.Labels);
        try {
          await container.remove();
          // Logger.ok('Removed...');
        } catch (error) {
          Logger.error(error.message);
        }
      }

      // creating container
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

  async getContainerStats(id: string): Promise<ContainerStats> {
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
      let memoryPct   = _.divide(memoryUsage, memoryLimit).toFixed(2);
      if (memoryPct === '0.00') {
        memoryPct = '0.01%';
      } else {
        memoryPct = `${memoryPct}%`;
      }

      const currentPids = _.get(stats, 'pids_stats.current', 0);
      let cpuCurrentUsage = this.calculateCPUPercentUnix(stats);
      cpuCurrentUsage = `${cpuCurrentUsage}%`;

      const retval: ContainerStats = {
        stats,
        formattedStats: {
          cpuCurrentUsage,
          memoryPct,
          currentPids,
          memoryUsage: this.formatBytes(memoryUsage),
          memoryLimit: this.formatBytes(memoryLimit),
        }
      };

      return retval;
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
