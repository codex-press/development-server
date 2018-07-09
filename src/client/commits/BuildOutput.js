import React from 'react'
import { connect } from 'react-redux'

import Dimmer from '../app/Dimmer';
import { setBuildOutputState, clearCommit } from './actions.js'
import './BuildOutput.less'
import Commit from './Commit'


const mapStateToProps = state => {
  return {
    commits : state.get('commits'),
    state: state.getIn(['ui','buildOutput']),
    modal: state.getIn(['ui','modal']),
  }
}


const mapDispatchToProps = {
  setBuildOutputState,
  clearCommit,
}


export function BuildOutput(props) {

  if (!props.state || !props.commits.size)
    return null;

  // always minimal when there's another modal
  const state = props.modal ? 'minimal' : props.state;

  const commits = props.commits.toArray().map(c => c.toJS());

  const minimize = () => props.setBuildOutputState('minimal');

  const center = e => {
    if (e.target.tagName != 'A' && props.state === 'minimal')
      props.setBuildOutputState('centered');
  }

  return (
    <div>
      <div className={ 'BuildOutput ' + state } onClick={ center }>

        { state === 'centered' && 
          <div className="minimize" onClick={ minimize }>&times;</div>
        }
   
        { commits.map((c, i) =>
          <Commit
            key={ c.id || i }
            { ...c }
            clear={ () => props.clearCommit(c.id) }
          />)
        }

      </div>

      { state === 'centered' && <Dimmer onClick={ minimize } /> }

    </div>
  );

}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BuildOutput);


