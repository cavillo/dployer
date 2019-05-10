import Container from './Container';
import Image from './Image';
import Docker from './Docker';
import Auth from './Auth';
import MongoDB from './MongoDB';

export default class Services {
  public container: Container;
  public image: Image;
  public auth: Auth;

  constructor(docker: Docker, mongo: MongoDB) {
    this.container = new Container(docker);
    this.image = new Image(docker);
    this.auth = new Auth(mongo);
  }
}