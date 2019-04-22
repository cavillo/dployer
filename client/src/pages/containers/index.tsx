import * as React from 'react';
import * as _ from 'lodash';
import moment from 'moment';
import Layout from '../../components/Layout';
import ClientComponentBase from '../../components/ClientComponentBase';
import ContainerComponent from '../../components/Container';
import conf from '../../conf';
import { Container } from '../../model/Container';

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
  selectedApp?: string,
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

    const selectedApp = _.get(this.state, 'selectedApp', _.get(_.keys(tree), '[0]', undefined));

    this.setState({ list, tree, selectedApp, loading: false });
  }

  renderTree = () => {
    const { selectedApp, tree } = this.state;

    if (!selectedApp) return null;
    if (!tree) return null;
    return (
      <div className="row">
        <div className="col-lg-2 col-md-3 col-12 mt-2 mb-4">
          <p className="h4">Applications</p>
          <ul className="list-group">
            {
              _.keys(tree).map((appName: string) => (
                <li key={appName} className="list-group-item d-flex justify-content-between align-items-center text-capitalize">
                  {appName}
                  <span className="badge badge-primary badge-pill">{_.size(_.filter(this.state.list, (container: Container) => (container.application === appName)))}</span>
                </li>
              ))
            }
          </ul>
        </div>
        <div className="col-lg-10 col-md-9 col-12 mt-2 mb-4">
          <p className="h4">Namespaces</p>
          <ul className="nav nav-tabs">
            {
              _.keys(tree[selectedApp]).map((namespaceName: string) => (
                <li key={namespaceName} className="nav-item">
                  <a className="nav-link active text-capitalize" data-toggle="tab" href={`#${namespaceName}`}>{namespaceName}</a>
                </li>
              ))
            }
          </ul>
          <div id="namespaceTabContent" className="tab-content">
            {
              _.keys(tree[selectedApp]).map((namespaceName: string) => (
                <div key={namespaceName} className="tab-pane fade active show py-2" id={namespaceName}>
                  <p className="h5">Deployments</p>
                  <div className="containers-container d-flex flex-wrap">
                    {
                      _.keys(tree[selectedApp][namespaceName]).map((deploymentName: string) => (
                        tree[selectedApp][namespaceName][deploymentName].containers.map((item: Container) => this.renderContainer(item))
                      ))
                    }
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    );
  }

  renderContainer = (container: Container) => (<ContainerComponent key={container.id} container={container}/>);

  render() {
    if (this.state.loading) return <div>Loading...</div>;

    const { list } = this.state;

    return (
      <Layout pageName="Home">
        <div className="container-fluid">
          {_.isArray(list) && list.length > 0 ? (
            this.renderTree()
          ) : (
              <div>
                <h2>No List Items Found</h2>
              </div>
            )
          }
        </div>
      </Layout>
    );
  }
}
export default Index;
