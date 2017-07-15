import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import { openFileSystem } from '../utility';

import RepositoryEdit from './RepositoryEdit';
import RepositoryDetails from './RepositoryDetails';
import RepositoryBroken from './RepositoryBroken';

import './Repository.less';


export default class Repository extends React.Component {

  constructor(props) {
    super(props);
    this.state = {editing: false, expanded: false};
  }

  
  render() {

    const update = (name, path) => {
      this.props.change(name, path);
      this.setState({ editing: false })
    }

    if (this.state.editing) {
      return (
        <RepositoryEdit
          {...this.props}
          submit={ update }
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

    if (this.props.broken) {
      return (
        <RepositoryBroken
          { ...this.props }
          edit={ () => this.setState({ editing: true }) }
        />
      );
    }

    return (
      <div className="Repository">

        <h4 className="name">{ this.props.name }</h4>

        <div className="path"
          onClick={ () => openFileSystem(this.props.path) }>
          { this.props.path }
        </div>

        <div className="expand"
          onClick={ () => this.setState({expanded: true}) }>
          see more
        </div>

        <div>
          { this.props.files.length } files
        </div>

      </div>
    );
  }

}

Repository.propTypes = {
  name: PropTypes.string,
  path: PropTypes.string,
  assets: PropTypes.arrayOf(PropTypes.string),
  files: PropTypes.arrayOf(PropTypes.object),
  remove: PropTypes.func,
  change: PropTypes.func,
  usedNames: PropTypes.arrayOf(PropTypes.string),
}


