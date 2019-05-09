import Container from './Container';
import Image from './Image';
import Docker from './Docker';

export default class Services {
  public container: Container;
  public image: Image;

  constructor(docker: Docker) {
    this.container = new Container(docker);
    this.image = new Image(docker);
  }
}