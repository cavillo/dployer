import * as _ from 'lodash';
import RedisService from '../lib/RedisService';

export default abstract class ServiceBase {
  public redis: RedisService;
  abstract dbKey: string;
  abstract idField: string;
  abstract idDBField: string;

  constructor() {
    this.redis = new RedisService();
  }

  abstract isValid(obj: any): boolean;
  abstract castFromDB(obj: any): any;
  abstract castToDB(obj: any): any;

  async getOne(id: string): Promise<any | null> {
    const list: any[] = await this.redis.get(this.dbKey);

    const instance = _.find(
      list,
      (a: any) => (_.get(a, this.idDBField, null) === id),
    );

    if (!instance) {
      return null;
    }

    return this.castFromDB(instance);
  }

  async getAll(): Promise<any[]> {
    const list: any[] = await this.redis.get(this.dbKey);

    if (!_.isArray(list)) {
      return [];
    }

    return list.map(this.castFromDB);
  }

  async upsert(obj: any): Promise<void> {
    const id = _.get(obj, this.idField);

    if (!this.isValid(obj)) {
      return;
    }

    let list: any[] = await this.redis.get(this.dbKey);

    if (!_.isArray(list)) {
      list = [];
    }

    const instance = _.find(
      list,
      (a: any) => (_.get(a, this.idDBField, null) === id),
    );

    _.set(instance, 'updatedAt', new Date().toISOString());
    if (instance) {
      _.remove(
        list,
        (a: any) => (_.get(a, this.idDBField, null) === id),
      );
    } else {
      _.set(instance, 'createdAt', new Date().toISOString());
    }

    list.push(this.castToDB(obj));

    this.redis.set(this.dbKey, list);
  }

  async delete(id: string): Promise<void> {
    const list: any[] = await this.redis.get(this.dbKey);

    const instance = _.find(
      list,
      (a: any) => (_.get(a, this.idDBField, null) === id),
    );

    if (instance) {
      _.remove(
        list,
        (a: any) => (_.get(a, this.idDBField, null) === id),
      );
    }
    this.redis.set(this.dbKey, list);
  }
}