import * as React from 'react';
import * as _ from 'lodash';
import ClientServices from '../services';

type Props = {
  pageName: string,
  children?: any,
};
type State = {
  isAuthenticated?: boolean;
};

class Layout extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  async componentDidMount() {
    document.title = `${this.props.pageName} | D-Ployer`;

    const client = new ClientServices();
    const token = await client.clientUser.getCurrentToken();

    this.setState({ isAuthenticated: !_.isNil(token) });
  }

  logout = async () => {
    const client = new ClientServices();
    client.clientUser.deleteCurrentToken();
    window.location.reload();
  }

  renderTopBar = () => {
    const { isAuthenticated } = this.state;
    if (isAuthenticated) {
      return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <a className="navbar-brand" href="/">Dployer</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor02" aria-controls="navbarColor02" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"/>
          </button>

          <div className="collapse navbar-collapse" id="navbarColor02">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <a className="nav-link" href="/containers">Containers</a>
              </li>
            </ul>
            <ul className="nav navbar-nav ml-auto">
              <li className="nav-item">
                <a className="nav-link" href="#" onClick={this.logout}>Logout</a>
              </li>
            </ul>
          </div>
        </nav>
      );
    }

    return null;
  }

  renderFooter() {
    return (
      <footer className="footer bg-light">
        <div className="footer pt-5">
          <div className="container">
            <div className="row">
              <div className="col-md-4 mb-4">
                <p className="mb-2 text-muted">
                  <a href="/" className="text-primary font-weight-bold">
                    D-Ployer
                    <span className="font-weight-lighter text-muted pl-1">Beta</span>
                  </a>
                </p>
                <p className="lead text-muted"><small>
                  Most complete and curated crafted beers & breweries catalog online. Feed and maintained by the own breweries. No useless and pointless ratings.
                </small></p>
              </div>
              <div className="col-md-4 mb-4">
                <p className="mb-2 text-muted"><strong>LINKS</strong></p>
                <ul className="nav flex-column">
                  <li className="nav-item">
                    <a className="nav-link p-0 text-muted" href="/about">
                      About
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link p-0 text-muted" href="/about#pricing">
                      Pricing
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link p-0 text-muted" href="/brewery-owner">
                      Brewery Owner?
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link p-0 text-muted" href="/policy">
                      Privacy Policy
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link p-0 text-muted" href="/terms">
                      Terms & Conditions
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-md-4 mb-4">
                <p className="mb-2 text-muted"><strong>KEEP IN TOUCH</strong></p>
                <p className="mb-3 text-muted">
                  There are a couple of ways to keep in touch and stay on top of updates in the comunity
                </p>
                <div className="input-group mb-3 shadow">
                  <input
                    type="email"
                    className="form-control rounded-left"
                    placeholder="Email"
                  />
                  <div className="input-group-append">
                    <button
                      className="btn btn-secondary rounded-right"
                      type="button"
                    >
                      <i className="fa fa-fw fa-envelope" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="row border-top">
              <div className="col-6 text-left py-4">
                <a className="btn btn-secondary btn-circle mr-2" href="/about">
                  <i className="fab fa-instagram" />
                </a>
                <a className="btn btn-secondary btn-circle mr-2" href="/about">
                  <i className="fab fa-facebook-f" />
                </a>
                <a className="btn btn-secondary btn-circle mr-2" href="/about">
                  <i className="fab fa-pinterest-p" />
                </a>
              </div>
              <div className="col-6 py-4">
                <p className="copyright text-muted text-right mb-0">
                  © {(new Date().getFullYear())} by <a href="http://www.cavillo.co" rel="noopener noreferrer" target="_blank">Cavillo</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  render() {
    return (
      <div className="base-page">

        {this.renderTopBar()}

        <div className="content">
          {this.props.children}
        </div>

        {/* {this.renderFooter()} */}
      </div>
    );
  }
}
export default Layout;
