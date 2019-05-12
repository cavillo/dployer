import React from 'react';
import {
  BrowserRouter as Router,
} from 'react-router-dom';
import {
  Switch,
  Route,
} from 'react-router';

import Home from './pages/home';
import Containers from './pages/containers';
import ContainerView from './pages/containers/view';
import Login from './pages/login';
import './App.css';

import ClientServices from './services';
type State = {
  loading: boolean,
  token?: string | null;
};

type Props = {
};

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
    };

  }
  async componentDidMount() {
    await this.refreshToken();
  }

  refreshToken = async () => {
    const client = new ClientServices();
    const token = await client.clientUser.getCurrentToken();

    this.setState({ token, loading: false });
  }

  conteinerLogs = (data: any) => (
    <ContainerView
      containerId={data.match.params.id}
    />
  )

  render() {
    if (this.state.loading) return <div>Loading...</div>;

    if (!this.state.token) return <Login refreshToken={this.refreshToken}/>;

    return (
      <div>
        <Router>
          <Switch>
            <Route
              exact={true}
              path="/"
              component={Home}
            />
            <Route
              exact={true}
              path="/containers"
              component={Containers}
            />
            <Route
              exact={true}
              path="/containers/:id"
              render={this.conteinerLogs}
            />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
