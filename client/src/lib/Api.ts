import * as _ from 'lodash';
import axios from 'axios';

import ClientUser from './ClientUser';
import Conf from '../conf';

export default class Api {

  private clientUser: ClientUser;

  private static handleError(error: any): Error {
    // error
    if (error.response) {
      if (error.response.data) {
        return Error(error.response.data);
      }
      return Error(error.response.statusText);
    }
    if (error.request) {
      return Error('The request was made but no response was received');
    }
    return Error('Something happened in setting up the request that triggered an Error');
  }

  // Static Methods

  constructor(clientUser: ClientUser) {
    this.clientUser = clientUser;
  }

  public async post(url: string, payload: any): Promise<any> {
    // Send a POST request
    const instance = await this.getInstance();
    try {
      const response = await instance({
        url,
        method: 'post',
        data: payload,
      });
      response.data = Api.transformData(response.data);
      return response.data;
    } catch (err) {
      throw Api.handleError(err);
    }
  }

  public async put(url: string, payload: any): Promise<any> {
    // Send a PUT request
    const instance = await this.getInstance();
    try {
      const response = await instance({
        url,
        method: 'put',
        data: payload,
      });
      response.data = Api.transformData(response.data);
      return response.data;
    } catch (err) {
      throw Api.handleError(err);
    }
  }

  public async get(url: string): Promise<any> {
    // Send a GET request
    const instance = await this.getInstance();
    try {
      const response = await instance({
        url,
        method: 'get',
      });
      response.data = Api.transformData(response.data);
      return response.data;
    } catch (err) {
      return Api.handleError(err);
    }
  }

  public async delete(url: string): Promise<any> {
    // Send a DELETE request
    const instance = await this.getInstance();
    try {
      const response = await instance({
        url,
        method: 'delete',
      });
      response.data = Api.transformData(response.data);
      return response.data;
    } catch (err) {
      return Api.handleError(err);
    }
  }

  private async getInstance() {
    let headers = {
    };
    const token: string | null = await this.clientUser.getCurrentToken();
    if (token) {
      headers = {
        ...headers,
        authorization: `Bearer ${token}`,
      };
    }
    const instance = axios.create({
      headers,
      baseURL: Conf.apiUrl,
      // transformResponse: Api.transformData,
    });
    return instance;
  }

  private static transformData(object: any): any {
    if (!_.isArray(object) && !_.isObject(object)) {
      return object;
    }

    if (_.isArray(object)) {
      return object.map(element => this.transformData(element));
    }

    const objectClone = {};
    if (_.isObject(object)) {
      for (const key in object) {
        _.set(objectClone, _.camelCase(key), this.transformData(_.get(object, key)));
      }
      return objectClone;
    }
  }
}
