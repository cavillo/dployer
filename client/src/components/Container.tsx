import * as React from 'react';
import * as _ from 'lodash';
import moment from 'moment';
import ClientComponentBase from '../components/ClientComponentBase';
import { Container } from '../model/Container';

type State = {
  loading: boolean,
  container?: Container,
};

type Props = {
  container: Container,
};

class ContainerComponent extends ClientComponentBase<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
    };
  }
  async componentDidMount() {
    await this.setState({
      loading: false,
      container: this.props.container,
    });
  }

  stopContainer = async (id: string) => {
    await this.setState({ loading: true });
    const container = await this.client.services.containers.stop(id);

    this.setState({ container, loading: false });
  }

  restartContainer = async (id: string) => {
    await this.setState({ loading: true });
    const container = await this.client.services.containers.restart(id);

    this.setState({ container, loading: false });
  }

  killContainer = async (id: string) => {
    await this.setState({ loading: true });
    const container = await this.client.services.containers.kill(id);

    this.setState({ container, loading: false });
  }

  removeContainer = async (id: string) => {
    await this.setState({ loading: true });
    const container = await this.client.services.containers.remove(id);

    this.setState({ container, loading: false });
  }

  getStatusIcon = (status: string) => {
    switch (_.toLower(status)) {
      case 'created':
        return <i className="fas fa-check mr-3"/>;
      case 'restarting':
        return <i className="fas fa-clock mr-3"/>;
      case 'running':
        return <i className="fas fa-play mr-3"/>;
      case 'removing':
        return <i className="fas fa-clock mr-3"/>;
      case 'paused':
        return <i className="fas fa-paused mr-3"/>;
      case 'exited':
        return <i className="fas fa-times-circle mr-3"/>;
      case 'dead':
        return <i className="fas fa-skull-crossbones mr-3"/>;

      default:
        return 'x';
    }
  }

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

  getContainerCodeName = (container: any) => (
    `${_.get(container, 'application')}.${_.get(container, 'deployment')}.${_.get(container, 'namespace')}`
  )

  renderContainer = (container: any) => (
    <div className="container-card hvr-ripple-out" key={_.get(container, 'id')}>
      <div className={`card border-${this.getStatusColorLabel(_.get(container, 'state', ''))} shadow-sm`}>
        <div className="card-header">
          {_.trim(_.get(container, 'deployment'), '/')}
          <br />
          <span className="small">{_.get(container, 'status')}</span>
        </div>
        <div className="card-body">
          <p className="small mb-0 text-primary text-capitalize">code</p>
          <p className="small mb-1">{this.getContainerCodeName(container)}</p>
          <p className="small mb-0 text-primary text-capitalize">created</p>
          <p className="small mb-0">{moment(_.get(container, 'createdAt') * 1000).fromNow()}</p>
        </div>
        <div className="card-body p-0">
          <div className="btn-group btn-block p-1">
            <button className="btn btn-secondary btn-sm dropdown-toggle text-left" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {this.getStatusIcon(_.get(container, 'state', ''))}
              {_.capitalize(_.get(container, 'state'))}
            </button>
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={this.restartContainer.bind(this, _.get(container, 'id'))}>Restart</button>
              <button className="dropdown-item" onClick={this.stopContainer.bind(this, _.get(container, 'id'))}>Stop</button>
              <button className="dropdown-item" onClick={this.killContainer.bind(this, _.get(container, 'id'))}>Kill</button>
              <button className="dropdown-item" onClick={this.removeContainer.bind(this, _.get(container, 'id'))}>Remove</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  render() {
    if (this.state.loading) return <div>Loading...</div>;
    const { container } = this.state;

    if (!container) return null;

    return this.renderContainer(container);
  }
}
export default ContainerComponent;
