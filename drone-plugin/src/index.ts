import * as _ from 'lodash';
import axios from 'axios';
import { config as configureEnvironmentVariables } from 'dotenv';
// require our environment variables
configureEnvironmentVariables();

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

  constructor(){
    this.parameters = this.parseParameters();
  }

  private parseParameters(): PluginParameters {
    const retval: PluginParameters = {
      host: ((url) => {
          var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
          if (match !== null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
          return match[2];
          }
          else {
              return 'localhost';
          }
        })(_.get(process.env, 'PLUGIN_API_HOST', 'localhsot')),
      port: _.get(process.env, 'PLUGIN_API_PORT', '8002'),
      token: _.get(process.env, 'PLUGIN_API_TOKEN', null),
      application: _.get(process.env, 'PLUGIN_APPLICATION', null),
      namespace: _.get(process.env, 'PLUGIN_NAMESPACE', null),
      deployment: _.get(process.env, 'PLUGIN_DEPLOYMENT', null),
      image: _.get(process.env, 'PLUGIN_IMAGE', null),
      portBindings: [],
    };
    // Port Bindings:
    const PLUGIN_PORT_BINDINGS = _.get(process.env, 'PLUGIN_PORT_BINDINGS', '').split(',');
    for (const pluginPortBinding of PLUGIN_PORT_BINDINGS) {
      const ports: string[] = pluginPortBinding.split(':');

      if (ports.length !== 2) {
        continue;
      }

      const portBinding: any = {};
      portBinding[ports[0]] = ["127.0.0.1",ports[1]];
      retval.portBindings.push(portBinding);
    }

    console.log(`Parameters:`);
    _.keys(retval).map( (key: string) => {
      console.log(`--- PLUGIN_${_.toUpper(_.snakeCase(key))} = ${retval[key]}`);
    });

    return retval;
  }

  private validateParameters(parameters: PluginParameters) {
    if (parameters.host) {
      console.log('Error', 'Missing PLUGIN_API_HOST ...');
      process.exit(1);
    }
    if (parameters.port) {
      console.log('Error', 'Missing PLUGIN_API_PORT ...');
      process.exit(1);
    }
    if (parameters.token) {
      console.log('Error', 'Missing PLUGIN_API_TOKEN ...');
      process.exit(1);
    }
    if (parameters.application) {
      console.log('Error', 'Missing PLUGIN_APPLICATION ...');
      process.exit(1);
    }
    if (parameters.namespace) {
      console.log('Error', 'Missing PLUGIN_NAMESPACE ...');
      process.exit(1);
    }
    if (parameters.deployment) {
      console.log('Error', 'Missing PLUGIN_DEPLOYMENT ...');
      process.exit(1);
    }
    if (parameters.image) {
      console.log('Error', 'Missing PLUGIN_IMAGE ...');
      process.exit(1);
    }
  }

  private async callAPI(parameters: PluginParameters): Promise<any> {
    const headers = { authorization: `Bearer ${parameters.token}` };
    const baseURL = `http://${parameters.host}:${parameters.port}/`;
    const requestBody = {
      application: parameters.application,
      namespace: parameters.namespace,
      deployment: parameters.deployment,
      image: parameters.image,
      portBindings: parameters.portBindings,
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
    }
  }

  public async run() {
    console.log(`--------- DPLOYER DRONE PLUGIN ---------`);
    const parameters: PluginParameters = this.parseParameters();
    this.validateParameters(parameters);

    await this.callAPI(parameters);
  }
}

/*
  Running the plugin...
*/
const plugin = new DployerDronePlugin();
plugin
  .run()
  .then(
    data => {
      console.log(
        'Successfully finish',
        JSON.stringify(data),
      );
      process.exit(0);
    })
  .catch(
    error => {
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
          error.request,
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
      process.exit(1);
    }
  );
