import mongoose from 'mongoose';

import conf, { Configuration } from '../conf';

export default class MongoDB {

  public mongoConnect(conf: Configuration) {
    mongoose
      .connect(conf.mongo_uri, {
        useNewUrlParser: true,
        useCreateIndex: true,
      })
      .then(bd => console.log('DB is conected'))
      .catch(err => console.log(err));
  }
}
