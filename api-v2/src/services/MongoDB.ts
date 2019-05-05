import mongodb from 'mongodb';
import * as _ from 'lodash';

import { MongoConfiguration } from '../conf';
import Logger from '../utils/Logger';

export default class MongoDB {
  private logger: Logger;
  private conf: MongoConfiguration;

  private client?: mongodb.MongoClient;
  private db?: mongodb.Db;

  constructor(conf: MongoConfiguration, logger: Logger) {
    this.logger = logger;
    this.conf = conf;
  }

  public async init() {
    try {
      const mongoOpts: mongodb.MongoClientOptions = {
        auth: this.conf.auth,
        // authSource: 'admin',
        keepAlive: true,
        useNewUrlParser: true,
      };
      const url = `${this.conf.url}:${this.conf.port}`;

      this.client = await mongodb.MongoClient.connect(url, mongoOpts);
      this.db = this.client.db(this.conf.dbName);

      this.logger.ok('MongoDB connection initialized...');
    } catch (error) {
      this.logger.error('MongoDB connection fail: ', error.message);
    }
  }

  private async getDBInstance(): Promise<mongodb.Db> {
    if (this.db) {
      return this.db;
    }
    await this.init();
    return this.getDBInstance();
  }

  private async getClientInstance(): Promise<mongodb.MongoClient> {
    if (this.client) {
      return this.client;
    }
    await this.init();
    return this.getClientInstance();
  }

  public async isConnected() {
    const client: mongodb.MongoClient = await this.getClientInstance();
    return client.isConnected();
  }

  public async findDocumentById(collection: string, id: string | number): Promise<any | null> {
    const db: mongodb.Db = await this.getDBInstance();

    const coll = db.collection(collection);
    // Find some documents
    const docs = await coll.find({ _id: id }).toArray();

    return _.get(docs, '[0]', null);
  }

  public async findAllDocuments(collection: string): Promise<any[]> {
    const db: mongodb.Db = await this.getDBInstance();

    const coll = db.collection(collection);
    // Find some documents
    const docs = await coll.find({}).toArray();

    return docs || [];
  }

  public async findAllDocumentsByQuery(collection: string, query: any): Promise<any[]> {
    const db: mongodb.Db = await this.getDBInstance();

    const coll = db.collection(collection);
    // Find some documents
    const docs = await coll.find(query).toArray();

    return docs || [];
  }

  public async updateDocument(collection: string, query: any, data: any): Promise<any[]> {
    const db: mongodb.Db = await this.getDBInstance();

    const coll = db.collection(collection);

    await coll.updateOne(query, { $set: data });

    return await this.findAllDocumentsByQuery(collection, query);
  }

  public async insertDocument(collection: string, data: any) {
    const db: mongodb.Db = await this.getDBInstance();

    const coll = db.collection(collection);

    const result = await coll.insertOne(data);

    return result.ops[0];
  }

  public async insertDocuments(collection: string, data: any[]) {
    const db: mongodb.Db = await this.getDBInstance();

    const coll = db.collection(collection);

    const result = await coll.insertMany(data);

    return result.ops;
  }

  public async deleteDocument(collection: string, query: any): Promise<void> {
    const db: mongodb.Db = await this.getDBInstance();

    const coll = db.collection(collection);

    await coll.deleteOne(query);

    return;
  }

  public async deleteDocuments(collection: string, query: any): Promise<void> {
    const db: mongodb.Db = await this.getDBInstance();

    const coll = db.collection(collection);

    await coll.deleteMany(query);

    return;
  }
}
