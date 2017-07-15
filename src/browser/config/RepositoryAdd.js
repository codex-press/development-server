import React from 'react';

import { IconPlus } from '../app/icons';
import RepositoryEdit from './RepositoryEdit';

import './RepositoryAdd.less';

export default class RepositoryAdd extends React.Component {


  constructor() {
    super();
    this.state = {adding: false, validPath: null, validName: null};
  }


  render() {

    if (!this.state.adding) {
      return (
        <div className="RepositoryAdd">
          <button onClick={ ()=>this.setState({adding: true}) }>
            <IconPlus />
          </button>
        </div>
      );
    }

    return (
      <RepositoryEdit
        { ...this.props }
        cancel={ () => this.setState({ adding: false }) }
        submit={ (name, path) => this.submit(name, path) } 
      />
    );
  }


  submit(name, path) {
    this.setState({ adding: false });
    this.props.submit(name, path);
  }


}

