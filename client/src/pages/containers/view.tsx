import * as React from 'react';
import * as _ from 'lodash';
import moment from 'moment';
import Layout from '../../components/Layout';
import ClientComponentBase from '../../components/ClientComponentBase';
import ContainerComponent from '../../components/Container';
import conf from '../../conf';
import { Container, ContainerStats } from '../../model/Container';

type State = {
  loading: boolean,
  container?: Container,
  logs: string[],
  stats?: ContainerStats,
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
    const stats: ContainerStats = await this.getStats(this.props.containerId);

    this.setState({ container, logs, stats, loading: false });
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

  getStats = async (id: string): Promise<ContainerStats> => {
    const stats = await this.client.services.containers.stats(id);
    return stats;
  }

  formatBytes(bytesData: string, decimals = 2) {
    const bytes = _.isNumber(bytesData) ? bytesData : _.toNumber(bytesData);
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(dm)} ${sizes[i]}`;
  }

  calculateCPUPercentUnix = (stats: any) => {
    let cpuPercent = 0.0;
    const cpuDelta = _.get(stats, 'cpuStats.cpuUsage.totalUsage', 0) - _.get(stats, 'precpuStats.cpuUsage.totalUsage', 0);
    const systemDelta = _.get(stats, 'cpuStats.systemCpuUsage', 0) - _.get(stats, 'precpuStats.systemCpuUsage', 0);
    const nCPU = _.get(stats, 'cpuStats.onlineCpus', 1);

    if (systemDelta > 0 && cpuDelta > 0) {
      cpuPercent = ((cpuDelta / systemDelta) * nCPU) * 100;
    }

    return cpuPercent.toFixed(2);
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

  renderStats = () => {
    const stats: ContainerStats | undefined = this.state.stats;
    if (!stats) { return null; }

    return (
      <div className="card shadow rounded-lg mb-3">
        <div className="card-body p-2">
          <div className="row">
            <div className="col-md-3 col-sm-6 col-12">
              <p className="text-muted mb-0">CPU usage</p>
              <p className="mb-2">
                {stats.formattedStats.cpuCurrentUsage}
              </p>
            </div>
            <div className="col-md-3 col-sm-6 col-12">
              <p className="text-muted mb-0">Mem usage / limit</p>
              <p className="mb-2">
                {stats.formattedStats.memoryUsage} / {stats.formattedStats.memoryLimit}
              </p>
            </div>
            <div className="col-md-3 col-sm-6 col-12">
              <p className="text-muted mb-0">Mem %</p>
              <p className="mb-2">{stats.formattedStats.memoryPct}</p>
            </div>
            <div className="col-md-3 col-sm-6 col-12">
              <p className="text-muted mb-0">PIDS</p>
              <p className="mb-2">{stats.formattedStats.currentPids}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { loading, container } = this.state;

    if (loading) return (
      <Layout pageName="Container-Detail">
        <div className="container">
          <div>Loading...</div>
        </div>
      </Layout>
    );
    if (!container) return <div>No container...</div>;

    return (
      <Layout pageName="Container-Detail">
        <div className="container">
          <div className="row my-3">
            <div className="col-12">
              <a className="btn btn-secondary btn-sm float-right " href="/containers" role="button">Back to list</a>
            </div>
          </div>
          <div className="mb-3">
            <ContainerComponent container={container} options={{ status: true }}/>
          </div>
          {this.renderStats()}
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
