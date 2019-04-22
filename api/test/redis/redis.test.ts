import * as assert from 'assert';
import * as _ from 'lodash';
import RedisService from '../../src/lib/RedisService';

let redis: any;

const testKey = 'test';
const testChannel = 'test-channel';
const testChannel2 = 'test-channel-2';

before(async () => {
  redis = new RedisService();
});

describe('Testing Redis Client...', async () => {
  it('Redis connection', async () => {
    const connected = await redis.connected();
    assert.ok(connected);
  });

  it('Get-Set', async () => {
    const name = 'carlos';
    await redis.set(testKey, name);

    const value = await redis.get(testKey);

    assert.equal(name, value);
  });

  it('HGet-HSet', async () => {
    const person = { name: 'carlos' };
    await redis.set(testKey, person);

    const retPerson = await redis.get(testKey);

    assert.equal(_.get(person, 'name', 'person'), _.get(retPerson, 'name', 'retPerson'));
  });

  it('Pub-Sub', async () => {
    const callback = (data: any) => {
      console.log('Message to Callback 1 --->', JSON.stringify(data));
    };

    const callback2 = (data: any) => {
      console.log('Message to Callback 2 --->', JSON.stringify(data));
    };

    redis.subscribe(testChannel, callback);
    redis.subscribe(testChannel2, callback2);

    redis.publish(testChannel, { message: 'hello there callback 1' });
    redis.publish(testChannel2, { message: 'hello there callback 2' });

    assert.ok(true);
  });

  afterEach(() => {
    redis.del(testKey);
    redis.unsubscribe(testChannel);
    redis.unsubscribe(testChannel2);
  });

  after(() => {
    redis.quit();
  });
});
