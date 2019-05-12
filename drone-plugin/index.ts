#!/usr/bin/env ts-node
import * as _ from 'lodash';
import axios from 'axios';
import { config as configureEnvironmentVariables } from 'dotenv';
// require our environment variables
configureEnvironmentVariables();

const PLUGIN_API_HOST       = _.get(process.env, 'PLUGIN_API_HOST'    , 'localhost');
const PLUGIN_API_PORT       = _.get(process.env, 'PLUGIN_API_PORT'    , '8002');
const PLUGIN_API_TOKEN      = _.get(process.env, 'PLUGIN_API_TOKEN'   , '');
const PLUGIN_APPLICATION    = _.get(process.env, 'PLUGIN_APPLICATION' , 'my-cool-app');
const PLUGIN_NAMESPACE      = _.get(process.env, 'PLUGIN_NAMESPACE'   , 'production');
const PLUGIN_DEPLOYMENT     = _.get(process.env, 'PLUGIN_DEPLOYMENT'  , 'greetings');
const PLUGIN_IMAGE          = _.get(process.env, 'PLUGIN_IMAGE'       , 'hello-world');
const PLUGIN_PORT_BINDINGS  = _.get(process.env, 'PORT_BINDINGS'      , '');

interface PluginParameters {
  host: string;
  port: string;
  token: string;
  application: string;
  namespace: string;
  deployment: string;
  image: string;
  portBindings: string[];
}

class DployerDronePlugin {
  parameters: PluginParameters;

  constructor() {
    this.parameters = this.parseParameters();
  }

  private parseParameters(): PluginParameters {
    const retval: PluginParameters = {
      host: ((url) => {
        return url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
      })(PLUGIN_API_HOST),
      port: PLUGIN_API_PORT,
      token: PLUGIN_API_TOKEN,
      application: PLUGIN_APPLICATION,
      namespace: PLUGIN_NAMESPACE,
      deployment: PLUGIN_DEPLOYMENT,
      image: PLUGIN_IMAGE,
      portBindings: [],
    };
    // Port Bindings:
    const portBindings = PLUGIN_PORT_BINDINGS.split(',');
    for (const pb of portBindings) {
      const ports: string[] = pb.split(':');

      if (ports.length !== 2) {
        continue;
      }

      const portBinding: any = {};
      portBinding[ports[0]] = ['127.0.0.1', ports[1]];
      retval.portBindings.push(portBinding);
    }

    // Printing
    const printParameter = (param: any): string => {
      if (_.isObject(param)) return JSON.stringify(param);
      if (_.isArray(param)) return _.map(param, printParameter).toString();
      return param.toString();
    };

    console.log('Parameters');
    _.keys(retval).map((key: string) => {
      console.log(`--- PLUGIN_${_.toUpper(_.snakeCase(key))} = ${printParameter(_.get(retval, key))}`);
    });

    return retval;
  }

  private validateParameters() {
    if (!this.parameters) {
      console.log('Error', 'Missing PARAMETERS ...');
      return process.exit(1);
    }
    if (_.isNil(this.parameters.host) || this.parameters.host === '') {
      console.log('Error', 'Missing PLUGIN_API_HOST ...');
      process.exit(1);
    }
    if (_.isNil(this.parameters.port) || this.parameters.port === '') {
      console.log('Error', 'Missing PLUGIN_API_PORT ...');
      process.exit(1);
    }
    if (_.isNil(this.parameters.token) || this.parameters.token === '') {
      console.log('Error', 'Missing PLUGIN_API_TOKEN ...');
      process.exit(1);
    }
    if (_.isNil(this.parameters.application) || this.parameters.application === '') {
      console.log('Error', 'Missing PLUGIN_APPLICATION ...');
      process.exit(1);
    }
    if (_.isNil(this.parameters.namespace) || this.parameters.namespace === '') {
      console.log('Error', 'Missing PLUGIN_NAMESPACE ...');
      process.exit(1);
    }
    if (_.isNil(this.parameters.deployment) || this.parameters.deployment === '') {
      console.log('Error', 'Missing PLUGIN_DEPLOYMENT ...');
      process.exit(1);
    }
    if (_.isNil(this.parameters.image) || this.parameters.image === '') {
      console.log('Error', 'Missing PLUGIN_IMAGE ...');
      process.exit(1);
    }
  }

  private async callAPI(): Promise<any> {
    const headers = { Authorization: `Bearer ${this.parameters.token}` };
    const baseURL = `http://${this.parameters.host}:${this.parameters.port}/`;
    const requestBody = {
      application: this.parameters.application,
      namespace: this.parameters.namespace,
      deployment: this.parameters.deployment,
      image: this.parameters.image,
      portBindings: this.parameters.portBindings,
    };

    const axiosInstance = axios.create({
      headers,
      baseURL,
    });

    try {
      const response = await axiosInstance.post(
        '/api/containers',
        requestBody,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async run() {
    console.log('--------- DPLOYER DRONE PLUGIN ---------');
    this.validateParameters();
    return await this.callAPI();
  }
}

/*
  Running the plugin...
*/
const plugin = new DployerDronePlugin();
plugin
  .run()
  .then(
    (response) => {
      console.log(
        `Response ${response.status} ${response.statusText}`,
        response.data,
      );
      process.exit(0);
    })
  .catch(
    (error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(
          'Error on response',
          error.response.data,
          error.response.headers,
          error.response.status,
        );
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(
          'Error on request',
          error.message,
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
      process.exit(1);
    },
  );
