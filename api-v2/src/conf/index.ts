import * as _ from 'lodash';
import { config as configureEnvironmentVariables } from 'dotenv';
// require our environment variables
configureEnvironmentVariables();

export interface Configuration {
  environment: string;
  service: string;
  port: number;
  redis: {
    port: number;
    host: string;
  };
  mongo_uri: string;
}

const conf: Configuration = {
  environment: _.get(process.env, 'ENVIRONMENT', 'local'),
  service: _.get(process.env, 'SERVICE', 'dployer-api'),
  port: _.toNumber(_.get(process.env, 'PORT', 8002)),
  redis: {
    port: _.toNumber(_.get(process.env, 'REDIS_PORT', 6379)),
    host: _.get(process.env, 'REDIS_HOST', 'localhost'),
  },
  mongo_uri: _.get(process.env, 'MONGO_URI', 'mongodb://localhost/dployer'),
};
export default conf;
