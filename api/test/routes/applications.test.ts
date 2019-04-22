import * as _ from 'lodash';
import * as assert from 'assert';
import axios from 'axios';
import * as CryptoJS from 'crypto-js';

import AuthenticationService from '../../src/services/AuthenticationService';
import { Authentication } from '../../src/model';

const protocol = 'http';
const host = 'localhost';
const port = '8002';
const route = 'applications';

const url = `${protocol}://${host}:${port}/api`;
let serviceAuthentication: any;
let client: any;
let token: string;

before(async () => {
  serviceAuthentication = new AuthenticationService();
  const auths: Authentication[] = await serviceAuthentication.getAll();
  let auth: Authentication;
  if (!auths || _.isEmpty(auths)) {
    auth = {
      token: CryptoJS.SHA512(`${Math.random()}-${new Date().toISOString()}`).toString(),
    } as Authentication;
    await serviceAuthentication.upsert(auth);
  } else {
    auth = auths[0];
  }
  token = auth.token;
});

beforeEach(async () => {
  const headers = {
    authorization: `Bearer ${token}`,
  };

  client = axios.create({
    headers,
    baseURL: url,
  });
});

describe('Applications...', () => {
  it('Get All...', async () => {
    try {
      const response = await client({
        url: `${url}/${route}`,
        method: 'get',
      });
      assert.equal(response.status, 200);
      assert.ok(_.has(response, 'data.applications'));
      assert.ok(_.isArray(_.get(response, 'data.applications')));
    } catch (error) {
      throw Error(error.message);
    }
  });

  it('Post...Post...Get...Delete...', async () => {
    try {
      let data = {
        application: {
          name: 'app1',
          namespaces: [],
          createdAt: '2013-04-21T04:44:57.636Z',
          updatedAt: '2019-04-21T04:44:57.636Z',
        },
      };

      // Post to create
      let response = await client({
        data,
        url: `${url}/${route}`,
        method: 'post',
      });
      assert.equal(response.status, 200);
      assert.ok(_.has(response, 'data.application'));
      assert.ok(_.isObject(_.get(response, 'data.application')));

      data = {
        application: {
          name: 'app1',
          namespaces: [],
          createdAt: '2019-04-21T04:44:57.636Z',
          updatedAt: '2019-04-21T04:44:57.636Z',
        },
      };
      // Post to edit
      response = await client({
        data,
        url: `${url}/${route}`,
        method: 'post',
      });
      assert.equal(response.status, 200);
      assert.equal(response.status, 200);
      assert.ok(_.has(response, 'data.application'));
      assert.ok(_.isObject(_.get(response, 'data.application')));
      assert.equal(_.get(response, 'data.application.createdAt'), '2019-04-21T04:44:57.636Z');

      // Get One
      response = await client({
        url: `${url}/${route}/${data.application.name}`,
        method: 'get',
      });
      assert.equal(response.status, 200);
      assert.ok(_.has(response, 'data.application'));

      // Delete
      response = await client({
        url: `${url}/${route}/${data.application.name}`,
        method: 'delete',
      });
      assert.equal(response.status, 200);
      assert.equal(_.get(response, 'data', false), true);
    } catch (error) {
      throw Error(error.message);
    }
  });
});
