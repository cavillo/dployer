import Container from './Container';
import Docker from './Docker';

export default class Services {
  public container: Container;

  constructor(docker: Docker) {
    this.container = new Container(docker);
  }
}