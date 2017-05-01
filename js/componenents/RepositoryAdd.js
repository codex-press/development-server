import React from 'react';

import { IconValid, IconInvalid, IconPlus } from './icons';
import { debounce, devAPI } from '../utility';

import RepositoryEdit from './RepositoryEdit';


export default class RepositoryAdd extends React.Component {

  constructor() {
    super();
    this.state = {adding: false, validPath: null, validName: null};
    this.checkPath = debounce(500, this.checkPath, this);
  }


  render() {
    let pathPlaceholder = '/Users/you/code/your-repository';
    if (/Windows/.test(navigator.userAgent))
      pathPlaceholder = 'C:\\code\\your-repository';

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

