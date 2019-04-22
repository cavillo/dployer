import * as _ from 'lodash';
import ServiceBase from './ServiceBase';
import { Authentication, AuthenticationDB } from '../model';

export default class AuthenticationService extends ServiceBase {
  dbKey = 'Authentications';
  idField = 'token';
  idDBField = 't';

  constructor() {
    super();
  }

  isValid(obj: Authentication): boolean {
    if (!_.has(obj, 'token') || !_.isString(obj.token)) {
      return false;
    }

    return true;
  }

  castToDB(obj: Authentication): AuthenticationDB {
    return {
      t            : obj.token,
    } as AuthenticationDB;
  }

  castFromDB(obj: AuthenticationDB): Authentication {
    return {
      token        : obj.t,
    } as Authentication;
  }
}