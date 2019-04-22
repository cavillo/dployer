import * as React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
// import * as _ from 'lodash';
// import * as moment from 'moment';

type State = {
  loading: boolean,
};

type Props = {
  user?: any,
};

class Index extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
    };

  }
  async componentDidMount() {
    this.setState({ loading: false });
  }

  render() {
    if (this.state.loading) return <div>Loading...</div>;

    return (
      <Layout pageName="Home">
        <div className="container-fluid">
          <h1>D-Ployer</h1>
          <Link to={'./containers'}>
            <button>
              My Container List
            </button>
          </Link>
        </div>
      </Layout>
    );
  }
}
export default Index;
