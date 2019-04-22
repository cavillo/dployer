import * as React from 'react';
import Layout from '../../components/Layout';
import ClientServices from '../../services';

type State = {
  loading: boolean,
  token: string;
  message?: {
    type: 'danger' | 'success' | 'info';
    text: string;
  }
};

type Props = {
  refreshToken: () => Promise<void>;
};

class Index extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      token: '',
    };

  }

  authenticate = async () => {
    try {
      await this.setState({ loading: true });
      const client = new ClientServices();
      const { token } = this.state;
      const response = await client.services.authentication.authenticate(token);

      if (response.token === token) {
        await client.clientUser.setCurrentToken(token);
        this.props.refreshToken();
      }
    } catch (error) {
      await this.setState({ loading: false, message: { type: 'danger', text: error.message } });
    }
  }

  setToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    const token = event.target.value;
    this.setState({ token });
  }

  renderMessage() {
    const { message } = this.state;
    if (message) {
      return (
        <div className={`alert alert-dismissible alert-${message.type}`}>
          <button type="button" className="close" data-dismiss="alert">&times;</button>
          <strong className="text-capitalize">{message.type}</strong> {message.text}
        </div>
      );
    }
    return null;
  }

  render() {
    if (this.state.loading) return <div>Loading...</div>;

    return (
      <Layout pageName="Login">
        <div className="container">
          <div className="row mt-5">
            <div className="col-md-8 offset-md-2 my-2">
              {this.renderMessage()}
            </div>
            <div className="col-md-8 offset-md-2">
              <div className="card">
                <div className="card-body">
                  <p className="h3">Dployer Login</p>
                  <div className="form-group">
                    <label >Token</label>
                    <input type="password" onChange={this.setToken} className="form-control" placeholder="********************"/>
                  </div>
                  <button type="submit" onClick={this.authenticate} className="btn btn-primary">Submit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}
export default Index;
