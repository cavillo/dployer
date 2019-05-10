import * as _ from 'lodash';
import { expect } from 'chai';

import TestClient from '../../utils/TestClient';

let client: TestClient;
let token: string;

before(async () => {
  client = new TestClient();
});

beforeEach(async () => {
  client.clearToken();

  // get new token logic here
  token = '123';
  client.setToken(token);
});

describe('GET /containers/:id/stats', () => {
  it('Ping...', async () => {
    const response = await client.get('/containers/1/stats');

    // ping to the service
    // the service is online
    expect(response)
      .to.have.property('status');
    expect(response)
      .to.not.be.equal(500);
    // expect(_.has(response, 'data.stats'))
    //   .to.be.equal(true);
  });
});
