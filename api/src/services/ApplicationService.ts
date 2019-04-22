import * as _ from 'lodash';
import ServiceBase from './ServiceBase';
import { Application, ApplicationDB } from '../model';

export default class ApplicationService extends ServiceBase {
  dbKey = 'applications';
  idField = 'name';
  idDBField = 'n';

  constructor() {
    super();
  }

  isValid(obj: Application): boolean {
    if (!_.has(obj, 'name') || !_.isString(obj.name)) {
      return false;
    }
    if (!_.has(obj, 'namespaces') || !_.isArray(obj.namespaces)) {
      return false;
    }
    if (!_.has(obj, 'createdAt') || !_.isString(obj.createdAt)) {
      return false;
    }
    if (!_.has(obj, 'updatedAt') || !_.isString(obj.updatedAt)) {
      return false;
    }

    return true;
  }

  castToDB(obj: Application): ApplicationDB {
    return {
      n   : obj.name,
      ns  : obj.namespaces,
      ca  : obj.createdAt,
      ua  : obj.updatedAt,
    } as ApplicationDB;
  }

  castFromDB(obj: ApplicationDB): Application {
    return {
      name        : obj.n,
      namespaces  : obj.ns,
      createdAt   : obj.ca,
      updatedAt   : obj.ua,
    } as Application;
  }
}