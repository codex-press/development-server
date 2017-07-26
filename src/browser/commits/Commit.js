import React from 'react';
import * as env from '../env';

import './Commit.less';

export default function Commit(props) {

  // This is likely because we got a message but have not fetched corresponding
  // data from the server yet
  if (!props.repository_name)
    return null;

  const repoLink = env.codexOrigin + '/edit/repos/' + props.repository_name
  const commitLink = repoLink + '/' + props.sha

  const wheel = e => {
    e.preventDefault()
    e.target.scrollTop += e.deltaY
  }

  const scrollBottom = el => el && (el.scrollTop = el.scrollHeight)

  const pct = Math.round(props.build_progress * 100) + '%'

  return (
    <div className="Commit">

      <div className="message">

        <a className="repository-name" href={ repoLink } target="_blank">
          { props.repository_name }:
        </a>
        {' '}
        <a className="commit-link" href={ commitLink } target="_blank">
          { props.message.trim() }
        </a>
        {' '}
        { props.build_progress == 1 &&
          <button className="small" onClick={ props.clear }>
            Clear
          </button>
        }
      </div>

      { props.build_progress < 1 &&
        <div className="progress-bar">
          <div className="bar" style={ { width: pct } }>
            <div className="stripes" />
            <div className="indicator" />
            <div className="text">{ pct }</div>
          </div>
        </div> 
      }

      <pre onWheel={ wheel } ref={ scrollBottom }>
        { props.build_output instanceof Array ? 
          props.build_output.join('') :
          props.build_output
        }
      </pre>

    </div>
  );

}


