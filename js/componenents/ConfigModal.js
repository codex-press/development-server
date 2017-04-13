import React, {Component} from 'react';
import { connect } from 'react-redux'


function mapStateToProps(state) {
  return {
    token: state.get('token'),
    repo_path: state.get('repo_path'),
  }
}

function mapDispatchToProps(dispatch) {
  return {

    change(event) {
      dispatch({
        type: 'SET_' + event.target.name.toUpperCase(),
        value: event.target.value,
      });
    },

    sync(event) {
      dispatch({type: 'SYNC'});
    }

  }
}



class ConfigModal extends Component {

  constructor(props) {
    super(props);
  }


  // change(event) {
  //   this.props.store.dispatch({
  //     type: 'SET_' + event.target.name.toUpperCase(),
  //     value: event.target.value,
  //   });
  // }


  render() {
    return (
      <div className="ConfigModal">

        <h2>Welcome to Codex Dev Server</h2>

        <label>
          API Token

          <input
            name="token"
            value={this.props.token}
            onChange={this.props.change} />

        </label>

        <label>
          Repository Path

          <input
            name="repo_path"
            value={this.props.repo_path}
            onChange={this.props.change} />

        </label>

        <button onClick={this.props.sync}>Save</button>

      </div>
    );
  }

}


export default connect(mapStateToProps, mapDispatchToProps)(ConfigModal);

