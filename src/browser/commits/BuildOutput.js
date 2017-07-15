import React from 'react';
import { connect } from 'react-redux';

import { setBuildOutputMinimal as setMinimal } from './actions.js'
import './BuildOutput.less';
import Commit from './Commit';


const mapStateToProps = state => {
  return {
    commits : state.get('commits'),
    minimal : state.getIn(['ui','build_output_minimal']),
  }
}


const mapDispatchToProps = {
  setMinimal,
}


export function BuildOutput(props) {

  if (props.commits.size === 0)
    return null;

  let commits = props.commits.toArray().map(c => c.toJS());

  return (
    <div className={ 'BuildOutput' + (props.minimal ? ' minimal' : '' ) }>

      <span className="close" onClick={ () => props.setMinimal(true) }>
        &times;
      </span>
 
      { commits.map(c => <Commit key={ c.id } { ...c } />) }

    </div>
  );

}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BuildOutput);


