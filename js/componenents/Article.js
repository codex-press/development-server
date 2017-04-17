import React from 'react';
import moment from 'moment';

let dateFormat = 'MMM D, YYYY'
let origin = 'http://localhost'

export default function(props) {
  let media = props.cover && props.cover.media;

  let srcset = media && media.srcset;
  if (media && media.type === 'Video')
    srcset = media.srcset.filter(s => s.type === 'image');
  srcset = srcset && srcset.filter(s => s.width <= 600);
  srcset = srcset && srcset.map(s => `${origin}${s.url} ${s.width}w`).join();

  let cover = srcset && <img src={ media.base64_thumb } srcSet={ srcset } />

  let date = moment(props.metadata.publication_date).format(dateFormat);

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
        <div className="url">{ props.url }</div>
        <div className="date">{ date }</div>
        <p className="description">
          { props.metadata.description || "No description field!" }
        </p>
      </div>

    </div>
  );
}

