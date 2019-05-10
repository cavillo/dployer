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
  token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJpby5kcGxveWVyIiwic3ViIjoicmFuZG9tIHVzZXIiLCJhdWQiOiJyYW5kb20gYXVkaWVuY2UiLCJleHAiOjE1NTc1NzIxNjIsIm5iZiI6MTU1NzQ4NTc2MiwiaWF0IjoxNTU3NDg1NzYyLCJqaXQiOiIwLjkwNDU0OTA2ODIwMTY5MDYtMTU1NzQ4NTc2MiJ9.eowUafuNclpe5dkneG3VX_A64VzHDLAxhW_PfhF2dFt7CnQ94KknKp8QiLLz1AHhmvEzPIMhNMdGJWxbEvjGCA';
  client.setToken(token);
});

describe('GET /containers', () => {
  it('Ping...', async () => {
    const response = await client.get('/containers');

    // ping to the service
    // the service is online
    expect(response)
      .to.have.property('status');
    expect(response)
      .to.not.be.equal(200);
    expect(_.has(response, 'data.containers'))
      .to.be.equal(true);
  });
});
