import * as React from 'react';
import * as _ from 'lodash';
import moment from 'moment';
import Layout from '../../components/Layout';
import ClientComponentBase from '../../components/ClientComponentBase';
import ContainerComponent from '../../components/Container';
import conf from '../../conf';
import { Container } from '../../model/Container';
import { Containers } from '..';

type ApplicationTree = {
  [application: string]: {
    [namespace: string] : {
      [deployments: string] : {
        containers: Container[];
      },
    },
  },
};

type State = {
  loading: boolean,
  tree: ApplicationTree,
  selectedAppName?: string,
  selectedNamespaceName?: string,
  list: any[];
};

type Props = {
  user?: any,
};

class Index extends ClientComponentBase<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      list: [],
      tree: {},
    };

  }
  async componentDidMount() {
    this.getList();
  }

  selectApp = (appName: string) => {
    this.setState({ selectedAppName: appName, selectedNamespaceName: _.get(_.keys(this.state.tree[appName]), '[0]', '') });
  }

  selectNameSpace = (namespaceName: string) => {
    this.setState({ selectedNamespaceName: namespaceName });
  }

  getList = async () => {
    await this.setState({ loading: true });
    const list = await this.client.services.containers.getAll();

    const tree: ApplicationTree = {
    };
    for (const container of list) {
      if (!_.has(tree, container.application)) {
        tree[container.application] = {};
      }

      if (!_.has(tree[container.application], container.namespace)) {
        tree[container.application][container.namespace] = {};
      }

      if (!_.has(tree[container.application][container.namespace], container.deployment)) {
        tree[container.application][container.namespace][container.deployment] = {
          containers: [],
        };
      }

      tree[container.application][container.namespace][container.deployment].containers.push(container);
    }

    let selectedAppName: string = _.get(this.state, 'selectedAppName', '');
    let selectedNamespaceName: string = _.get(this.state, 'selectedNamespaceName', '');
    if (selectedAppName === '') {
      selectedAppName = _.keys(tree)[0];
    }
    if (selectedNamespaceName === '') {
      selectedNamespaceName = _.keys(tree[selectedAppName])[0];
    }

    this.setState({ list, tree, selectedAppName, selectedNamespaceName, loading: false });
  }

  renderTree = () => {
    const { selectedAppName, tree } = this.state;

    if (!tree) return null;
    return (
      <div className="row">
        <div className="col-lg-3 col-md-4 col-12 mt-2 mb-4">
          <p className="h4">Applications</p>
          <ul className="list-group">
            {
              this.renderSideBar()
            }
          </ul>
        </div>
        <div className="col-lg-9 col-md-8 col-12 mt-2 mb-4">
          <p className="h4">Namespaces</p>
          <ul className="nav nav-tabs">
            {
              this.renderNamespaces()
            }
          </ul>
          <div id="namespaceTabContent" className="tab-content">
            {
              this.renderDeployments()
            }
          </div>
        </div>
      </div>
    );
  }

  renderSideBar() {
    const { selectedAppName, tree } = this.state;

    if (!selectedAppName) return null;
    if (!tree) return null;
    return (
      _.keys(tree).map((appName: string) => (
        <li
          key={appName}
          onClick={this.selectApp.bind(this, appName)}
          className={`list-group-item d-flex justify-content-between align-items-center text-capitalize ${this.state.selectedAppName === appName ? 'active' : ''}`}
        >
          {appName}
          <span>{this.renderApplicationAggregate(appName)}</span>
        </li>
      ))
    );
  }

  renderNamespaces() {
    const { selectedAppName, selectedNamespaceName, tree } = this.state;

    if (!selectedAppName) return null;
    if (!tree) return null;

    return (
      _.keys(tree[selectedAppName]).map((namespaceName: string) => (
        <li key={namespaceName} className="nav-item">
          <a
            onClick={this.selectNameSpace.bind(this, namespaceName)}
            className={`nav-link ${selectedNamespaceName === namespaceName ? 'active' : ''} text-capitalize`}
            data-toggle="tab"
            href={`#${namespaceName}`}
          >
          {namespaceName}
          <span className="ml-2">{this.renderNamespaceAggregate(selectedAppName, namespaceName)}</span>
          </a>
        </li>
      ))
    );
  }

  renderDeployments() {
    const { selectedAppName, selectedNamespaceName, tree } = this.state;

    if (!selectedAppName) return <p>No containers...</p>;
    if (!selectedNamespaceName) return null;
    if (!tree) return null;
    return (
      _.keys(tree[selectedAppName][selectedNamespaceName]).map((deploymentName: string) => (
        <div key={deploymentName} className="tab-pane fade active show py-2" id={deploymentName}>
          <p className="h5 text-capitalize">{deploymentName}</p>
          <div className="containers-container">
            {
              _.map(
                _.get(tree, `['${selectedAppName}']['${selectedNamespaceName}']['${deploymentName}'].containers`, []),
                (item: Container) => this.renderContainer(item),
              )
            }
          </div>
        </div>
      ))
    );
  }

  renderContainer = (container: Container) => (<ContainerComponent options={{ details: true, logs: true, status: true }} key={container.id} container={container}/>);

  getStatusColorLabel = (status: string) => {
    switch (_.toLower(status)) {
      case 'created':
        return 'info';
      case 'restarting':
        return 'warning';
      case 'running':
        return 'success';
      case 'removing':
        return 'warning';
      case 'paused':
        return 'secondary';
      case 'exited':
        return 'danger';
      case 'dead':
        return 'danger';

      default:
        return 'x';
    }
  }

  renderApplicationAggregate(appName: string) {
    const { tree } = this.state;
    if (!tree) return null;

    const application = tree[appName];
    const appContainers = _.flattenDeep(
      _.values(application).map(namespace => _.values(namespace).map(deployment => deployment.containers.map(container => container.state))),
    );
    const agg = appContainers.reduce(
      (retval: {}, status: any) => {
        const value = _.get(retval, status, 0);
        _.set(retval, status, value + 1);
        return retval;
      },
      {},
    );
    return _.keys(agg).sort().map(
      status => (<span key={status} className={`badge badge-${this.getStatusColorLabel(status)} badge-pill`}>{_.get(agg, `${status}`)}</span>),
    );
  }

  renderNamespaceAggregate(appName: string, namespaceName: string) {
    const { tree } = this.state;
    if (!tree) return null;

    const namespace = tree[appName][namespaceName];
    const appContainers = _.flattenDeep(
      _.values(namespace).map(deployment => deployment.containers.map(container => container.state)),
    );
    const agg = appContainers.reduce(
      (retval: {}, status: any) => {
        const value = _.get(retval, status, 0);
        _.set(retval, status, value + 1);
        return retval;
      },
      {},
    );
    return _.keys(agg).sort().map(
      status => (<span key={status} className={`badge badge-${this.getStatusColorLabel(status)} badge-pill`}>{_.get(agg, `${status}`)}</span>),
    );
  }

  render() {
    if (this.state.loading) return <div>Loading...</div>;

    const { list } = this.state;

    return (
      <Layout pageName="Home">
        <div className="container-fluid">
            {this.renderTree()}
        </div>
      </Layout>
    );
  }
}
export default Index;
