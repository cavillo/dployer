import * as _ from 'lodash';
import { config as configureEnvironmentVariables } from 'dotenv';
// require our environment variables
configureEnvironmentVariables();

const conf = {
  port: process.env.PORT,
  redis: {
    port: _.get(process.env, 'REDIS_PORT', 6379),
    host: _.get(process.env, 'REDIS_HOST', 'localhost'),
  },
};
export default conf;
