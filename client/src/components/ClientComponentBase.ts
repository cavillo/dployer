import * as React from 'react';
import ClientServices from '../services';

abstract class ClientComponentBase<Props, State> extends React.Component<Props, State>{
  client = new ClientServices();
}
export default ClientComponentBase;
