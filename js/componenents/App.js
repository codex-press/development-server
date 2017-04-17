import React from 'react';
import { connect } from 'react-redux'

import { codexOrigin } from '../env';

import {
  styleLoadComplete,
  toggleModal,
  removeAlert,
  saveState,
  restoreState,
  setArticle,
  loadConfig,
} from '../actions';

import Config from './Config';
import Search from './Search';
import Info from './Info';
import AlertContainer from './AlertContainer';
import { InfoIcon, EditIcon, SearchIcon, ConfigIcon } from './icons';



const mapStateToProps = state => {
  return {
    loaded: state.getIn(['ui','style_loaded']),
    alerts: state.get('alerts'),
    modal: state.getIn(['ui','modal']),
    article: state.get('article').toJS(),
  }
}



const mapDispatchToProps = {
  styleLoadComplete,
  toggleModal,
  removeAlert,
  restoreState,
  saveState,
  loadConfig,
}



class App extends React.Component {


  constructor(props) {
    super();
    this.windowKey = this.windowKey.bind(this);
    this.focusHandler = this.focusHandler.bind(this);
    this.state = { focus: document.hasFocus() };

    props.loadConfig();

    // load the article
    fetch(`${codexOrigin}${location.pathname}.json?full`)
    .then(response => response.json())
    .then(data => {
      let article = require('article').default;
      article.set(data);
      setArticle(data);
      document.documentElement.classList.add('javascript','focus');
      article.tick();
    });

    props.restoreState();
    window.addEventListener('beforeunload', props.saveState);
  }


  render() {

    const hidden = { display: 'none' };
    const props = this.props;

    return (
      <div className={ 'App ' + (this.state.focus ? ' focused' : '') }
        style={ props.loaded ? null : hidden }>

        <link ref={el => this.styleEl = el} rel="stylesheet" href="/main.css" />

        <nav>
          <InfoIcon onClick={ () => props.toggleModal('info') } />
          <EditIcon onClick={ () => this.openEdit() } />
          <SearchIcon onClick={ () => props.toggleModal('search') } />
          <ConfigIcon onClick={ () => props.toggleModal('config') } />
        </nav>

        <Info open={ props.modal === 'info' } {...props.article} />
        <Search />
        <Config />
        
        <AlertContainer alerts={ props.alerts } remove={ props.removeAlert } />

        { props.modal &&
          <div className="dimmer" onClick={ () => props.toggleModal(null) }/>
        }

      </div>
    );
  }


  componentDidMount() {
    this.styleEl.addEventListener('load', this.props.styleLoadComplete);
    window.addEventListener('keydown', this.windowKey);
    window.addEventListener('focus', this.focusHandler);
    window.addEventListener('blur', this.focusHandler);
  }


  componentWillUnmount() {
    window.removeEventListener('keydown', this.windowKey);
    window.removeEventListener('focus', this.focusHandler);
    window.removeEventListener('blur', this.focusHandler);
  }


  openEdit() {
    const editUrl = 'https://codex.press/edit/article' + location.pathname;
    window.open(editUrl, '_blank');
  }


  focusHandler(e) {
    this.setState({focus: document.hasFocus()});
  }


  windowKey(e) {

    if (e.key === 'Escape') {
      e.preventDefault();
      this.props.toggleModal(null);
    }
    else if (e.path[0].tagName === 'INPUT' || e.defaultPrevented) {
      return;
    }
    else if (e.key === 'f') {
      e.preventDefault();
      this.props.toggleModal('search');
    }
    else if (e.key === 'i') {
      e.preventDefault();
      this.props.toggleModal('info');
    }
    else if (e.key === 'c') {
      e.preventDefault();
      this.props.toggleModal('config');
    }

  }


}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

