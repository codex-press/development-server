import React from 'react';

import './Commit.less';

export default function Commit(props) {

      /*
      <h4>
        { props.repository_name } &ndash; {}
        <span className="sha">{ props.sha.substr(0, 5) }</span>
      </h4>
      */

  console.log(props);

  return (
    <div className="Commit">

      <div className="message">
        { props.message }
      </div>

      <div className="progress-bar">
        <div style={ { width: (props.build_progress * 100 + '%') } }>
          { Math.round(props.build_progress * 100) + '%' }
        </div>
      </div> 

      <pre>
        { props.build_output.join('') }
      </pre>

    </div>
  );

}


