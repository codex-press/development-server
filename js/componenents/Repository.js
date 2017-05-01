import React from 'react';

import { openFileSystem } from '../utility';

import RepositoryEdit from './RepositoryEdit';
import RepositoryDetails from './RepositoryDetails';


export default class Repository extends React.Component {

  constructor() {
    super();
    this.state = {editing: false, expanded: false};
  }

  
  render(props) {

    if (this.state.editing) {
      return (
        <RepositoryEdit
          {...this.props}
          submit={ (name, path) => this.update(name, path) }
          cancel={ () => this.setState({ editing: false }) }
        />
      )
    }
    else if (this.state.expanded) {
      return (
        <RepositoryDetails
          {...this.props}
          open={ path => this.open(path) }
          edit={ () => this.setState({ editing: true }) }
          collapse={ () => this.setState({ expanded: false }) }
        />
      )
    }

    return (
      <div className="Repository">

        <h3 className="name">{ this.props.name }</h3>

        <div
          className="path"
          onClick={ () => openFileSystem(this.props.path) }>
          { this.props.path }
        </div>

        <div
          className="expand"
          onClick={ () => this.setState({expanded: true}) }>
          see more
        </div>

        <div>
          { this.props.files.length } files
        </div>

      </div>
    );
  }


  update(name, path) {
    this.props.change(name, path);
    this.setState({ editing: false })
  }


}

