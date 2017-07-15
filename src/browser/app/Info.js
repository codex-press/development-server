import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import moment from 'moment';

import * as env from '../env';

import './Info.less';


const mapStateToProps = state => {
  return {
    article: state.get('article'),
  }
}


const mapDispatchToProps = {
}


export function Info(props) {
  
  let article = props.article.toJS();

  if (!article.title) {
    return (
      <div className="Info">
        <h2>Loading...</h2>
      </div>
    );
  }

  let editURL = env.codexOrigin + '/edit/article' + article.url;

  console.log(article.asset_data);

  // also needs to check if it's served by the dev repos.... hrm

  let assetNames = article.assets.reduce((assetNames, name) => {
    let assets = article.asset_data.filter(a => {
      return RegExp(`^/?${name}\.(js|css)$`).test(a.path);
    });
    assetNames.push({name, assets});
    return assetNames;
  },[]);

  // needs to get more data from the server...
  // let githubUrl = `https://github.com/${ remote }/blob/${ sha }/${ filename }`;

  let classed_content = article.classed_content || {};

  let wheel = e => {
    e.preventDefault();
    e.currentTarget.scrollTop += e.deltaY;
  }

  let dateFormat = 'MMM D, YYYY, h:mm A';

  return (
    <div className="Info" onWheel={ wheel }>
      <h2>{ article.title }</h2>

      <div className="url">
        { article.url + ' ' }
        <a href={ editURL } target="_blank">(edit)</a>
      </div>

      <div className="puplished">
        { article.published ? 'Published' : 'Not Published' }
      </div>

      <div className="pup-date">
        { moment(article.metadata.publication_date).format(dateFormat) }
      </div>

      <div className="byline">
        { article.metadata.byline || classed_content.byline || 'No byline' }
      </div>

      <div className="description">
        { article.metadata.description || 'No description field!' }
      </div>

      <h3>Assets</h3>

      { assetNames.map(a => 
        <div className="asset-name" key={a.name}>
          { a.name }
          <div> 
            { a.assets.length === 0 &&
              <div className="asset">No matched assets</div> }
            { a.assets.map(d => 
              <div className="asset" key={ d.path }>
                { d.path + ' '}
                <a target="_blank" href={ '' }>(github)</a>
                {' '}
                <a target="_blank" href={ env.contentOrigin + d.path }>(compiled)</a>
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


