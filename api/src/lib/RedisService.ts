import * as _ from 'lodash';
import redis, { RedisClient } from 'redis';
import Logger from '../utils/Logger';
import conf from '../conf';

export default class RedisService {
  private client: redis.RedisClient;
  private publisher: redis.RedisClient;
  private subscriber: redis.RedisClient;

  constructor() {
    const host: string = _.get(conf, 'redis.host', 'localhost');
    const port: number = _.get(conf, 'redis.post', 6379);

    this.client = redis.createClient({
      host,
      port,
      retry_strategy: () => 1000,
    });

    this.publisher = this.client.duplicate();
    this.subscriber = this.client.duplicate();

    this.subscriber.on('subscribe', (channel: string, count: any) => {
      Logger.log(`subscribing [${channel}] --> ${count}`);
    });
  }

  public async get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(JSON.parse(data));
      });
    });
  }

  public async set(key: string, value: any): Promise<any> {
    await this.client.set(key, JSON.stringify(value));
  }

  public async del(key: string): Promise<any> {
    await this.client.del(key);
  }
  /*
    PUB-SUB
  */
  public publish(channel: string, value: any) {
    Logger.log(`publishing [${channel}] --> ${value}`);
    this.publisher.publish(channel, JSON.stringify(value));
  }

  public subscribe(channel: string, callback: (data: any) => void): void {
    this.subscriber.on('message', (subChannel: string, message: any) => {
      if (channel === subChannel) {
        Logger.log(`receiving [${channel}] --> ${message}`);
        callback(JSON.parse(message));
      }
    });
    this.subscriber.subscribe(channel);
  }

  public unsubscribe(channel: string): void {
    this.subscriber.unsubscribe(channel);
  }

  public async connected(): Promise<boolean> {
    return await this.client.connected;
  }

  public quit() {
    this.client.quit();
    this.subscriber.quit();
    this.publisher.quit();
  }
}
