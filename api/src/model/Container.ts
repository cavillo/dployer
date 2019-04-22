export interface Container {
  id          : string;
  name        : string;
  deployment  : string;
  namespace   : string;
  application : string;
  image       : string;
  imageId     : string;
  command     : string;
  labels      : { [label: string]: string };
  state       : string;
  status      : string;
  createdAt   : number;
}

export interface ContainerDB {
  i           : string;
  n           : string;
  d           : string;
  ns          : string;
  a           : string;
  im          : string;
  imi         : string;
  c           : string;
  ls: { [label: string]: string };
  s           : string;
  st          : string;
  ca          : number;
}
