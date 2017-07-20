import React from 'react';
import { connect } from 'react-redux'

import { IconInfo, IconEdit, IconSearch, IconConfig } from './icons';
import { toggleModal } from '../actions';
import * as env from '../env';

import './Nav.less';


const mapStateToProps = state => {
  return {
    focus: state.getIn(['ui','focus']),
    article: state.get('article'),
    account: state.get('account'),
  }
}


const mapDispatchToProps = {
  toggleModal,
}



export class Nav extends React.Component {


  constructor(props) {
    super();
    window.addEventListener('keydown', this.windowKey.bind(this));
  }


  render() {
    return (
      <nav className={ 'Nav' + (this.props.focus ? ' focused' : '') } >
        <IconInfo onClick={ () => this.toggleModal('info') } />
        <IconEdit onClick={ () => this.openEdit() } />
        <IconSearch onClick={ () => this.toggleModal('search') } />
        <IconConfig onClick={ () => this.toggleModal('config') } />
      </nav>
    );
  }


  openEdit() {
    let editURL = env.codexOrigin + '/edit' 

    if (this.props.article.get('account_id') === this.props.account.get('id'))
      editURL += '/article' + this.props.article.get('url');

    window.open(editURL, '_blank');
  }


  toggleModal(value) {
    // don't want to let a double click open and then close it
    if (Date.now() - this.lastToggle < 500)
      return;
    this.props.toggleModal(value);
    this.lastToggle = Date.now();
  }


  windowKey(e) {

    const shouldIgnore = (
      e.path[0].tagName === 'INPUT' ||
      e.defaultPrevented ||
      e.metaKey ||
      e.ctrlKey ||
      e.altKey
    );

    if (e.key === 'Escape') {
      e.preventDefault();
      this.props.toggleModal(null);
    }
    else if (shouldIgnore) {
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
  mapDispatchToProps,
)(Nav);


