import React from 'react';

import { IconValid, IconInvalid } from '../app/icons';
import { debounce, api } from '../utility';

import './RepositoryEdit.less';

export default class RepositoryEdit extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      name: props.name || '',
      validName: null,
      path: props.path || '',
      validPath: null
    };
    this.checkPath = debounce(500, this.checkPath, this);
  }


  render() {

    let pathPlaceholder = (
      /Windows/.test(navigator.userAgent) ?
      'C:\\code\\your-repository' :
      '/Users/you/code/your-repository'
    );

    return (
      <form className="RepositoryEdit" onSubmit={ e => this.submit(e) } >

        <label>
          Name {}

          { this.state.validName !== null && (this.state.validName ?
            <IconValid /> :
            <IconInvalid />)
          }

          <input
            value={ this.state.name }
            onChange={ e => this.nameUpdate(e) }
            name="name"
            placeholder="new"
            autoFocus
          />
        </label>

        <label>
          Path {}

          { this.state.validPath !== null && (this.state.validPath ?
            <IconValid /> :
            <IconInvalid />)
          }

          <input
            name="path"
            value={ this.state.path }
            placeholder={ pathPlaceholder }
            onChange={ e => this.pathUpdate(e) }
            onPaste={ e => this.pastePath(e) }
          />
        </label>

        <div className="button-container">
          <button onClick={ e => this.cancel(e) }>Cancel</button>
          {' '}
          <button className="primary">Submit</button>
        </div>

      </form>
    );
  }


  cancel(e) {
    e.preventDefault();
    this.props.cancel(e);
  }


  nameUpdate(e) {
    let name = e.target.value.toLowerCase();
    this.setState({ name, validName: this.checkName(name) });
  }


  checkName(name = this.state.name) {
    return (
      name.length > 1 &&
      !/[^\w-]/.test(name) &&
      (name === this.props.name || !this.props.usedNames.includes(name))
    );
  }


  pathUpdate(e) {
    let path = e.target.value;
    this.setState({path, validPath: null});
    this.checkPath(path);
  }


  // checks if it's a valid path on this computer
  checkPath() {
    let path = this.state.path;
    api(`/api/path?path=${ encodeURIComponent(path) }`)
    .then(validPath => {
      // already changed because they continued typing
      if (path !== this.state.path)
        return;
      this.setState({ validPath });
    });
  }


  // sets name based on end of the path
  pastePath(e) {
    let path = e.clipboardData.getData('text/plain');

    if (this.state.name.length > 0)
      return;

    let match = path.match(/[\\/]([^\\/]+)[\\/]?$/)
    if (match) {
      this.setState({ name: match[1], validName: this.checkName(match[1]) });
    }
  }


  submit(e) {
    e.preventDefault();

    let notValid = (
      !this.checkName() ||
      this.state.path.length === 0 ||
      this.state.validPath === false
    );

    console.log({ notValid });

    if (notValid) {
      this.setState({validName: this.checkName()});
      if (this.state.path.length === 0)
        this.setState({validPath: false});
      return;
    }

    this.props.submit(this.state.name, this.state.path);
  }

}

