import Logger from './utils/Logger';
import conf from './conf';
import API from './API';

const logger = new Logger(conf.service);

const init = async () => {
  logger.log('Initializing...');

  // Initialize API
  const api = new API(conf, logger);
  return await api.init();
};

init()
  .then(
    () => {
      // heartbeath
      setInterval(
        () => logger.log('.'),
        (30 * 1000), // print heartbeath each 30 seconds
      );
    })
  .catch((error) => {
    logger.error('Error', JSON.stringify(error));
    process.kill(1);
  });
