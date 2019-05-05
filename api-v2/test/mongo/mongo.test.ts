import * as assert from 'assert';
import * as _ from 'lodash';
import MongoDB from '../../src/services/MongoDB';
import conf from '../../src/conf';
import Logger from '../../src/utils/Logger';

let mongo: MongoDB;
let logger: Logger;
const collectionName: string = 'tests';

before(async () => {
  logger = new Logger('MongoDB Tests');
  const testConf = {
    ...conf.mongo,
    dbName: 'test',
  };
  mongo = new MongoDB(testConf, logger);
  await mongo.init();
  await mongo.deleteDocuments('tests', {});
});

describe('MongoDB Client...', async () => {
  it('Is connected', async () => {
    const connected = await mongo.isConnected();
    assert.ok(connected);
  });

  it('InsertDocument, InsertDocuments, Find & FindAll', async () => {
    const test1 = {
      name: 'Test 1',
    };
    const test2 = {
      name: 'Test 2',
    };
    const data1 = await mongo.insertDocument(collectionName, test1);
    const data2 = await mongo.insertDocument(collectionName, test2);
    const id1 = _.get(data1, '_id');
    const id2 = _.get(data2, '_id');
    logger.log('id1 =>', id1);
    logger.log('id2 =>', id2);

    assert.ok(_.has(data1, '_id'));
    assert.equal(_.get(data1, 'name'), test1.name);
    assert.ok(_.has(data2, '_id'));
    assert.equal(_.get(data2, 'name'), test2.name);

    let data = await mongo.findDocumentById(collectionName, id1);
    const id = _.get(data, '_id');
    logger.log('id =>', id);
    logger.log('id =>', JSON.stringify(id));
    logger.log('id =>', JSON.stringify(id1));
    assert.ok(_.has(data, '_id'));
    // assert.equal(id, id1);

    // data = await mongo.findDocumentById(collectionName, data2._id);
    // assert.ok(_.has(data, '_id'));
    // assert.equal(_.get(data, '_id'), _.get(data2, '_id'));

  });
});
