import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import moment from 'moment';

import './Info.less';

let dateFormat = 'MMM D, YYYY, h:mm A'

const mapStateToProps = state => {
  return {
    article: state.get('article'),
  }
}


const mapDispatchToProps = {
}


export function Info(props) {

  if (!props.title) {
    return (
      <div className="Info">
        <h2>Loading...</h2>
      </div>
    );
  }

  let origin = 'https://usercontent.codex.press/';
  let edit = 'https://codex.press/edit/article' + props.url;

  let assetNames = props.assets.reduce((assetNames, name) => {
    let assets = props.asset_data.filter(a => {
      return RegExp(`^${name}\.(js|css)$`).test(a.asset_path);
    });
    assetNames.push({name, assets});
    return assetNames;
  },[]);

  // needs to get more data from the server...
  // let githubUrl = `https://github.com/${ remote }/blob/${ sha }/${ filename }`;

  let classed_content = props.classed_content || {};

  let wheel = e => {
    e.preventDefault();
    e.currentTarget.scrollTop += e.deltaY;
  }

  return (
    <div className="Info" onWheel={ wheel }>
      <h2>{ props.title }</h2>

      <div className="url">
        { props.url + ' ' }
        <a href={ edit } target="_blank">(edit)</a>
      </div>

      <div className="puplished">
        { props.published ? 'Published' : 'Not Published' }
      </div>

      <div className="pup-date">
        { moment(props.metadata.publication_date).format(dateFormat) }
      </div>

      <div className="byline">
        { props.metadata.byline || classed_content.byline || 'No byline' }
      </div>

      <div className="description">
        { props.metadata.description || 'No description field!' }
      </div>

      <h3>Assets</h3>

      { assetNames.map(a => 
        <div className="asset-name" key={a.name}>
          { a.name }
          <div> 
            { a.assets.length === 0 &&
              <div className="asset">No matched assets</div> }
            { a.assets.map(d => 
              <div className="asset" key={ d.digest_path }>
                { d.asset_path + ' '}
                <a target="_blank" href={ '' }>(github)</a>
                {' '}
                <a target="_blank" href={ origin + d.digest_path }>(compiled)</a>
              </div>)
            }
          </div>
        </div>)
      }

    </div>
  );

}


export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Info);


