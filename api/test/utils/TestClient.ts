import * as _ from 'lodash';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as CryptoJS from 'crypto-js';

export default class TestClient {
  private baseURL: string;
  private token?: string;

  constructor(
    host: string = 'localhost',
    port: string = '8002',
    token?: string,
  ) {
    this.baseURL = `http://${host}:${port}/api`;
    if (token) {
      this.token = token;
    }
  }

  public async post(endpoint: string, payload: any): Promise<any> {
    // Send a POST request
    const instance = this.getInstance();
    try {
      const config: AxiosRequestConfig = {
        url: endpoint,
        method: 'post',
        data: payload,
      };
      const response = await instance(config);
      return response;
    } catch (err) {
      return err.response;
    }
  }

  public async put(endpoint: string, payload: any): Promise<any> {
    // Send a put request
    const instance = this.getInstance();
    try {
      const config: AxiosRequestConfig = {
        url: endpoint,
        method: 'put',
        data: payload,
      };
      const response = await instance(config);
      return response;
    } catch (err) {
      return err.response;
    }
  }

  public async get(endpoint: string): Promise<any> {
    // Send a get request
    const instance = this.getInstance();
    try {
      const config: AxiosRequestConfig = {
        url: endpoint,
        method: 'get',
      };
      const response = await instance(config);
      return response;
    } catch (err) {
      return err.response;
    }
  }

  public async delete(endpoint: string): Promise<any> {
    // Send a delete request
    const instance = this.getInstance();
    try {
      const config: AxiosRequestConfig = {
        url: endpoint,
        method: 'delete',
      };
      const response = await instance(config);
      return response;
    } catch (err) {
      return err.response;
    }
  }

  public setToken(token: string) {
    this.token = token;
  }

  public clearToken() {
    this.token = undefined;
  }

  private getInstance(): AxiosInstance {
    let headers = {
    };
    if (this.token) {
      headers = {
        ...headers,
        authorization: `Bearer ${this.token}`,
      };
    }
    const instance = axios.create({
      headers,
      baseURL: this.baseURL,
      // transformResponse: Api.transformData,
    });
    return instance;
  }
}