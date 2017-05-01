import React from 'react';

import { IconValid, IconInvalid } from './icons';
import { debounce, devAPI } from '../utility';


export default class RepositoryAdd extends React.Component {

  constructor(props) {
    super();
    this.state = {name: props.name, validName: null, path: props.path, validPath: null};
    this.checkPath = debounce(500, this.checkPath, this);
  }


  render() {

    let pathPlaceholder = '/Users/you/code/your-repository';
    if (/Windows/.test(navigator.userAgent))
      pathPlaceholder = 'C:\\code\\your-repository';

    return (
      <div className="RepositoryEdit">

        <label>
          Name {' '}

          { this.state.validName !== null && (this.state.validName ?
            <IconValid /> :
            <IconInvalid />)
          }

          <input
            value={ this.state.name }
            ref={ ref => this.nameInput = ref }
            onChange={ () => this.nameUpdate() }
            className="name"
            placeholder="new"
          />

        </label>

        <label>
          Path {' '}

          { this.state.validPath !== null && (this.state.validPath ?
            <IconValid /> :
            <IconInvalid />)
          }

          <input
            className="path"
            ref={ ref => this.pathInput = ref }
            value={ this.state.path }
            placeholder={ pathPlaceholder }
            onChange={ () => this.pathUpdate() }
            onPaste={ () => this.pastePath() }
          />

        </label>

        <div className="button-container">

          <button onClick={ this.props.cancel }>Cancel</button>

          {' '}

          <button className="primary" onClick={ () => this.submit() }>
            Submit
          </button>

        </div>

      </div>
    );
  }


  nameUpdate() {
    this.setState({
      name: this.nameInput.value,
      validName: this.validName(),
    });
  }


  validName() {
    return (
      this.nameInput.value === this.props.name ||
      this.props.checkName(this.nameInput.value)
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


  pathUpdate() {
    let path = this.pathInput.value;
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


  submit() {
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

