import React from 'react';

import { IconValid, IconInvalid } from './icons';
import { debounce, devAPI } from '../utility';

import './RepositoryEdit.less';

export default class RepositoryEdit extends React.Component {

  constructor(props) {
    super();
    this.state = {
      name: props.name,
      validName: null,
      path: props.path,
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
          Name {' '}

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
          Path {' '}

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
    let name = e.target.value;
    this.setState({ name, validName: this.validName(name) });
  }


  validName(name) {
    return (
      name === this.props.name ||
      name.length > 1 &&
      !/[^\w-]/.test(name) &&
      !this.props.usedNames.includes(name)
    );
  }


  pastePath() {
    this.setState({path: this.pathInput.value});

    if (this.nameInput.value.length > 0)
      return;

    let match = this.pathInput.value.match(/[\\/]([^\\/]+)[\\/]?$/)
    if (match) {
      this.setState({name: match[1]}, () => this.checkName());
    }
  }


  pathUpdate(e) {
    let path = e.target.value;
    this.setState({path, validPath: null});
    this.checkPath();
  }


  checkPath() {
    let val = this.pathInput.value;
    devAPI(`/path?path=${ encodeURIComponent(val) }`)
    .then(validPath => {
      if (val !== this.pathInput.value)
        return;
      this.setState({validPath});
    });
  }


  submit(e) {
    e.preventDefault();
    this.setState({validName: this.validName()});

    if (this.state.path.length === 0)
      this.setState({validPath: false});

    let notValid = (
      !this.validName() ||
      this.state.path.length === 0 ||
      this.state.validPath === false
    );

    if (notValid)
      return;

    let name = this.nameInput.value;
    let path = this.pathInput.value;

    this.props.submit(name, path);
  }

}

