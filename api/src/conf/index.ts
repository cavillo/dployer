import * as _ from 'lodash';
import { config as configureEnvironmentVariables } from 'dotenv';
// require our environment variables
configureEnvironmentVariables();

export interface MongoConfiguration {
  auth: {
    user: string;
    password: string;
  };
  url: string;
  port: number;
  dbName: string;
}
export interface Configuration {
  environment: string;
  service: string;
  port: number;
  mongo: MongoConfiguration;
}

const conf: Configuration = {
  environment: _.get(process.env, 'ENVIRONMENT', 'local'),
  service: _.get(process.env, 'SERVICE', 'dployer-api'),
  port: _.toNumber(_.get(process.env, 'PORT', 8002)),
  mongo: {
    auth: {
      user: _.get(process.env, 'MONGO_AUTH_USER', 'root'),
      password: _.get(process.env, 'MONGO_AUTH_PASSWORD', 'example'),
    },
    url: _.get(process.env, 'MONGO_URL', 'mongodb://localhost'),
    port: _.toNumber(_.get(process.env, 'MONGO_PORT', 27017)),
    dbName: _.get(process.env, 'MONGO_DBNAME', 'dployer'),
  },
};
export default conf;
