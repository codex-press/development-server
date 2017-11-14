import React from 'react';
import moment from 'moment';

import { contentOrigin } from '../env';

import './Article.less';


let dateFormat = 'MMM D, YYYY'

export default function Article(props) {
  let media = props.cover && props.cover.media;

  let srcset = media && media.srcset;
  if (media && media.type === 'Video')
    srcset = media.srcset.filter(s => s.type === 'image');
  srcset = srcset && srcset.filter(s => s.width <= 600);
  srcset = srcset && srcset.map(s => `${contentOrigin}${s.url} ${s.width}w`).join();

  let cover = srcset && <img src={ media.base64Thumb } srcSet={ srcset } />

  let date;
  if (props.metadata.publicationDate)
    date = moment(props.metadata.publicationDate).format(dateFormat);

  let byline = props.classedContent.byline;

  return (
    <div
      onClick={ props.navigate }
      onWheel={ props.select }
      onMouseMove={ e => { if (e.nativeEvent.movementY != 0) props.select() } }
      className={ 'Article' + (props.selected ? ' selected' : '') } >

      <div className="cover">
        { cover }
      </div>

      <div className="chatter">
        <h2>{ props.title }</h2>
        <div className="url">
          { props.url.slice((props.pathPrefix || '').length) }
        </div>
        { date && <div className="date">{ date }</div> }
        { byline && <div className="byline">{ byline }</div> }
        <p className="description">
          { props.metadata.description || "No description field!" }
        </p>
      </div>

    </div>
  );
}

