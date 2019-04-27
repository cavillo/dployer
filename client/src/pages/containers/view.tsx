import * as React from 'react';
import * as _ from 'lodash';
import moment from 'moment';
import Layout from '../../components/Layout';
import ClientComponentBase from '../../components/ClientComponentBase';
import ContainerComponent from '../../components/Container';
import conf from '../../conf';
import { Container } from '../../model/Container';
import { Containers } from '..';

type State = {
  loading: boolean,
  container?: Container,
  logs: string[],
};

type Props = {
  containerId: any,
};

class View extends ClientComponentBase<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      logs: [],
    };

  }
  async componentDidMount() {
    await this.setState({ loading: true });

    const container = await this.getContainer(this.props.containerId);
    const logs = await this.getLogs(this.props.containerId);

    this.setState({ container, logs, loading: false });
  }

  refreshLogs = async (): Promise<void> => {
    // await this.setState({ loading: true });

    const logs = await this.getLogs(this.props.containerId);

    this.setState({ logs });
  }

  getContainer = async (id: string): Promise<Container> => {
    const container = await this.client.services.containers.getOne(id);
    return container;
  }

  getLogs = async (id: string): Promise<string[]> => {
    const logs = await this.client.services.containers.logs(id);
    return logs;
  }

  renderLogs = () => (
    this.state.logs.map(
      (line: string, index: number) => (
        <div key={index} className="text-monospace mb-1 d-flex flex-row">
          <div className="text-muted mr-2 flex-shrink-1" style={{ width: 20 }}>{index + 1}</div>
          <div className="w-100">{line}</div>
        </div>
      ),
    )
  )

  render() {
    const { loading, container } = this.state;

    if (loading) return (
      <Layout pageName="Container-Detail">
        <div className="container-fluid">
          <div>Loading...</div>
        </div>
      </Layout>
    );
    if (!container) return <div>No container...</div>;

    return (
      <Layout pageName="Container-Detail">
        <div className="container-fluid">
          <div className="row my-3">
            <div className="col-12">
              <a className="btn btn-secondary btn-sm float-right " href="/containers" role="button">Back to list</a>
            </div>
          </div>
          <div className="mb-3">
            <ContainerComponent container={container} options={{ status: true }}/>
          </div>
          <div className="card shadow rounded-lg mb-3">
            <div className="card-body p-2">
              <div className="row">
                <div className="col-12">
                  <p className="text-muted mb-0">Container ID</p>
                  <p className="mb-2">{_.get(container, 'id')}</p>
                  <p className="text-muted mb-0">Image ID</p>
                  <p className="mb-2">{_.get(container, 'imageId')}</p>
                  <p className="text-muted mb-0">Command</p>
                  <p className="mb-2">{_.get(container, 'command')}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4 col-sm-6 col-12">
                  <p className="text-muted mb-0">Application</p>
                  <p className="mb-2">{_.get(container, 'application')}</p>
                </div>
                <div className="col-md-4 col-sm-6 col-12">
                  <p className="text-muted mb-0">Namespace</p>
                  <p className="mb-2">{_.get(container, 'application')}</p>
                </div>
                <div className="col-md-4 col-sm-6 col-12">
                  <p className="text-muted mb-0">Deployment</p>
                  <p className="mb-2">{_.get(container, 'deployment')}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4 col-sm-6 col-12">
                  <p className="text-muted mb-0">Created At</p>
                  <p className="mb-2">{moment(_.get(container, 'createdAt')).format('lll')}</p>
                </div>
                <div className="col-md-4 col-sm-6 col-12">
                  <p className="text-muted mb-0">Status</p>
                  <p className="mb-2">{_.get(container, 'status')}</p>
                </div>
                <div className="col-md-4 col-sm-6 col-12">
                  <p className="text-muted mb-0">State</p>
                  <p className="mb-2">{_.get(container, 'state')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card text-white bg-dark mb-3">
            <div className="card-header">
              Container Logs
            </div>
            <div className="card-body p-2 d-flex flex-column small">
              {this.renderLogs()}
            </div>
            <div className="card-footer">
              <button className="float-right" onClick={this.refreshLogs}>Refresh</button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}
export default View;
