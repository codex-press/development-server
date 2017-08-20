import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { openFileSystem } from '../utility';

import * as env from '../env';

import './Info.less';


const mapStateToProps = state => {
  return {
    visible: state.getIn(['ui', 'modal']) === 'info',
    article: state.get('article'),
    resolvedAssets: state.get('resolvedAssets'),
  }
}


const mapDispatchToProps = {
}


export function Info(props) {

  if (!props.visible)
    return null;

  const article = props.article.toJS();

  if (!article.title) {
    return (
      <div className="Info">
        <h2>Loading...</h2>
      </div>
    );
  }

  const editURL = env.codexOrigin + '/edit/article' + article.url;

  const classed_content = article.classed_content || {};

  const dateFormat = 'MMM D, YYYY, h:mm A';

  return (
    <div className="Info">
      <h2>{ article.title }</h2>

      <div className="url-line">
        <span className="url">
          { article.canonical_url }
        </span>
        <a href={ article.canonical_url } target="_blank">
          (live)
        </a>
        <a href={ editURL } target="_blank">
          (edit)
        </a>
      </div>

      <div className="puplished">
        { article.published && 'Published ' }
        { moment(article.metadata.publication_date).format(dateFormat) }
        { !article.published && ' (draft)' }
      </div>

      <div className="byline">
        { article.metadata.byline || classed_content.byline || 'No byline' }
      </div>

      <div className="description">
        { article.metadata.description || 'No description field!' }
      </div>

      <h3>Assets</h3>

      { article.header_path &&
        <div className="">
          <b>Header</b> { article.header_path }
        </div>
      }

      { article.footer_path &&
        <div className="">
          <b>Footer</b> { article.footer_path }
        </div>
      }
    
      <b>External</b>
      { props.resolvedAssets.toJS().map(([ basePath, matched ]) => 
        <div className="asset-name" key={ basePath }>
          { basePath }
          <div> 
            { matched.length === 0 ?
              <div className="asset">No matched assets</div> :
              matched.map(a => 
                <div className="asset" key={ a.path }>
                  { a.path + ' ' }
                  { a.stage === 'development' ?
                    <span>
                      <span className="open"
                        onClick={ () => openFileSystem(a.source) }>
                        (source: { a.filename })
                      </span>
                      {' '}
                      <a target="_blank" href={ a.path }>
                        (compiled)
                      </a>
                    </span> :
                    <span>
                      <a target="_blank" href={ a.source }>
                        (github)
                      </a>
                      {' '}
                      <a target="_blank" href={ env.contentOrigin + a.path }>
                        (compiled)
                      </a>
                    </span>
                  }
                </div>
              )
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


