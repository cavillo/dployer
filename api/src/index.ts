import Api from './Api';
import Logger from './utils/Logger';

const init = async () => {
  Logger.log('Initializing D-ployer...');
  const api = new Api();

  await api.init();

  return true;
};

init()
  .then(() => {
    // heartbeath
    setInterval(
      () => {
        Logger.log('.');
      },
      30000,
    );
  }).catch((ex) => {
    Logger.error(`ERROR: ${JSON.stringify(ex)}`);
  });
