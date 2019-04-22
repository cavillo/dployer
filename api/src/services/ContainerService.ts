import * as _ from 'lodash';
import ServiceBase from './ServiceBase';
import { Container, ContainerDB } from '../model';
import { ContainerInfo } from '../lib/DockerAgent';

export default class ContainerService extends ServiceBase {
  dbKey = 'containers';
  idField = 'id';
  idDBField = 'i';

  constructor() {
    super();
  }

  isValid(obj: Container): boolean {
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

  castToDB(obj: Container): ContainerDB {
    return {
      i           : obj.id,
      n           : obj.name,
      d           : obj.deployment,
      ns          : obj.namespace,
      a           : obj.application,
      im          : obj.image,
      imi         : obj.imageId,
      c           : obj.command,
      ls          : obj.labels,
      s           : obj.state,
      st          : obj.status,
      ca          : obj.createdAt,
    } as ContainerDB;
  }

  castFromDB(obj: ContainerDB): Container {
    return {
      id          : obj.i,
      name        : obj.n,
      deployment  : obj.d,
      namespace   : obj.ns,
      application : obj.a,
      image       : obj.im,
      imageId     : obj.imi,
      command     : obj.c,
      labels      : obj.ls,
      state       : obj.s,
      status      : obj.st,
      createdAt   : obj.ca,
    } as Container;
  }

  castFromDockerContainer(dockerContainer: ContainerInfo): Container {
    return {
      id          : _.get(dockerContainer, 'Id', null),
      name        : _.get(dockerContainer, 'Names[0]', null),
      deployment  : _.get(dockerContainer, 'Labels["io.dployer.deployment"]', null),
      namespace   : _.get(dockerContainer, 'Labels["io.dployer.namespace"]', null),
      application : _.get(dockerContainer, 'Labels["io.dployer.application"]', null),
      image       : _.get(dockerContainer, 'Image', null),
      imageId     : _.get(dockerContainer, 'ImageID', null),
      command     : _.get(dockerContainer, 'Command', null),
      labels      : _.get(dockerContainer, 'Labels', {}),
      state       : _.get(dockerContainer, 'State', null),
      status      : _.get(dockerContainer, 'Status', null),
      createdAt   : _.get(dockerContainer, 'Created', null),
    } as Container;

  }
}