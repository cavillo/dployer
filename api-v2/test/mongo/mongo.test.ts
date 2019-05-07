import * as assert from 'assert';
import * as _ from 'lodash';
import { expect } from 'chai';
import MongoDB from '../../src/services/MongoDB';
import conf from '../../src/conf';
import Logger from '../../src/utils/Logger';

let mongo: MongoDB;
let logger: Logger;
const collectionName: string = 'tests';

before(async () => {
  logger = new Logger('Connectiong to MongoDB...');
  const testConf = {
    ...conf.mongo,
    dbName: 'test',
  };
  mongo = new MongoDB(testConf, logger);
  await mongo.init();
  await mongo.deleteDocuments('tests', {});
  return;
});

describe('MongoDB Client...', async () => {
  it('Is connected', async () => {
    const connected = await mongo.isConnected();
    assert.ok(connected);
    return;
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

    expect(data1)
      .to.have.property('_id');
    expect(data2)
      .to.have.property('_id');

    expect(data1)
      .to.have.property('name')
      .that.equals(test1.name);
    expect(data2)
      .to.have.property('name')
      .that.equals(test2.name);

    const data = await mongo.findDocumentById(collectionName, data1._id);

    expect(data)
      .to.have.property('name')
      .that.equals(test1.name);

    expect(data)
      .to.have.property('_id')
      .that.equals(data1._id);

    const allData = await mongo.findAllDocuments(collectionName);

    expect(allData.length)
      .to.be.equals(2);
  });

  after(async () => {
    logger = new Logger('Closing MongoDB connection...');
    await mongo.close();
    return;
  });
});
