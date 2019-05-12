import * as React from 'react';
import * as _ from 'lodash';
import moment from 'moment';
import ClientComponentBase from './ClientComponentBase';
import { IContainer } from '../model/Container';

type State = {
  loading: boolean,
  container?: IContainer,
};

type Props = {
  container: IContainer,
  options?: {
    logs?: boolean;
    details?: boolean;
    status?: boolean;
  },
  onChange?: Function,
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

  onChange = async () => {
    if (this.props.onChange) await this.props.onChange();
  }

  stopContainer = async (id: string) => {
    await this.setState({ loading: true });
    const container = await this.client.services.containers.stop(id);

    this.setState({ container, loading: false }, this.onChange);
  }

  restartContainer = async (id: string) => {
    await this.setState({ loading: true });
    const container = await this.client.services.containers.restart(id);

    this.setState({ container, loading: false }, this.onChange);
  }

  startContainer = async (id: string) => {
    await this.setState({ loading: true });
    const container = await this.client.services.containers.start(id);

    this.setState({ container, loading: false }, this.onChange);
  }

  killContainer = async (id: string) => {
    await this.setState({ loading: true });
    const container = await this.client.services.containers.kill(id);

    this.setState({ container, loading: false }, this.onChange);
  }

  removeContainer = async (id: string) => {
    await this.setState({ loading: true });
    await this.client.services.containers.remove(id);
    this.setState({ loading: false }, this.onChange);
  }

  getStatusIcon = (status: string) => {
    switch (_.toLower(status)) {
      case 'created':
        return <i className="fas fa-check"/>;
      case 'restarting':
        return <i className="fas fa-clock"/>;
      case 'running':
        return <i className="fas fa-play"/>;
      case 'removing':
        return <i className="fas fa-clock"/>;
      case 'paused':
        return <i className="fas fa-paused"/>;
      case 'exited':
        return <i className="fas fa-times-circle"/>;
      case 'dead':
        return <i className="fas fa-skull-crossbones"/>;

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

  renderOptions = (container: IContainer) => (
    <div className="btn-group float-right" role="group" aria-label="Container options">
      {_.get(this.props.options, 'status', false) ?
        (
          <div className="btn-group dropup">
            <button className="btn btn-secondary btn-sm dropdown-toggle text-left" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {_.capitalize(_.get(container, 'state'))}
            </button>
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={this.startContainer.bind(this, _.get(container, 'id'))}>Start</button>
              <button className="dropdown-item" onClick={this.restartContainer.bind(this, _.get(container, 'id'))}>Restart</button>
              <button className="dropdown-item" onClick={this.stopContainer.bind(this, _.get(container, 'id'))}>Stop</button>
              <button className="dropdown-item" onClick={this.killContainer.bind(this, _.get(container, 'id'))}>Kill</button>
              <button className="dropdown-item" onClick={this.removeContainer.bind(this, _.get(container, 'id'))}>Remove</button>
            </div>
          </div>
        ) : null
      }
    </div>
  )

  renderContainer = (container: any) => (
    <div className="w-100 hvr-ripple-out" key={_.get(container, 'id')}>
      <div className="card shadow p-2 rounded-lg">
        <div className="card-body mb-1 p-0">
          <div className="mb-0">
            <span className={`text-${this.getStatusColorLabel(_.get(container, 'state', ''))} mr-2`}>{this.getStatusIcon(_.get(container, 'state', ''))}</span>
            <span className="font-weight-bold">{_.trim(_.get(container, 'deployment'), '/')}</span>
            <span className="float-right">
              {this.renderOptions(container)}
            </span>
          </div>
        </div>
        <a href={`/containers/${container.id}`} className="card-body p-0 text-reset text-decoration-none">
          <p className="small mb-0 text-truncate">
            {_.get(container, 'id')}
          </p>
          <p className="small mb-0">
            <span className="mr-2">{_.get(container, 'image')}</span>created<span className="font-italic ml-2">{moment(_.get(container, 'createdAt') * 1000).fromNow()}</span>
          </p>
          <p className="small mb-0">
            {_.get(container, 'status', '')}
          </p>
        </a>
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
