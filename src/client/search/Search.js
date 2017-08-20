import React from 'react';
import { connect } from 'react-redux';

import Article from './Article';
import { debounce, api } from '../utility';
import * as env from '../env';
import { apiError, toggleModal, navigate } from '../actions';

import './Search.less';

const mapStateToProps = state => {
  return {
    visible: state.getIn(['ui', 'modal']) === 'search',
    token : state.getIn(['config','token']),
    domains: state.get('domains'),
    config: state.get('config'),
  }
}

const mapDispatchToProps = {
  apiError,
  navigate,
  toggleModal,
}

export class Search extends React.Component {

  constructor(props) {
    super();
    this.searchDebounced = debounce(500, this.search, this);
    this.state = { query: '', articles: null, selected: null };
  }


  render() {

    if (!this.props.visible)
      return null;

    const pathPrefix = this.pathPrefix()

    return (
      <div className="Search">

        <input
          autoFocus
          value={ this.state.query }
          onChange={ e => this.updateQuery(e) }
          onKeyDown={ e => this.key(e) }/>

        <div
          className="articles-container"
          onWheel={ e => this.wheel(e) }
          ref={ el => this.articlesContainer = el }>

          { this.state.articles && this.state.articles.length === 0 &&
            <span className="empty">No match</span>
          }

          { this.state.articles && this.state.articles.map(a =>
            <Article
              navigate={ () => this.navigate(a.url) }
              select={ () => this.select(a) }
              key={a.id}
              pathPrefix={ pathPrefix }
              {...a}
              selected={ this.selected() && this.selected().id === a.id } />)
          }
        </div>

      </div>
    );
  }


  componentDidMount() {
    if (this.props.visible)
      this.search();
  }


  componentWillReceiveProps(props) {
    if (props.visible)
      this.search();
    else
      this.setState({query: '', articles: null, selected: null});
  }


  componentDidUpdate() {
    if (this.setScrollTriggered)
      this.setScroll();
    this.setScrollTriggered = false;
  }


  navigate(url) {
    this.props.toggleModal(null);
    this.props.navigate(url.slice(this.pathPrefix().length));
  }


  selected() {
    return this.state.articles.find((a,i) =>
      a.id === this.state.selected ||
      (!this.state.selected && i === 0)
    );
  }


  wheel(e) {
    this.articlesContainer.scrollTop += e.deltaY;
    e.preventDefault();
  }


  key(e) {

    switch (e.key) {
      case 'ArrowDown':
        return this.selectNext();
      case 'ArrowUp':
        return this.selectPrevious();
      case 'Enter':
        if (this.selected())
          this.navigate(this.selected().url);
    }

    if (/Macintosh/.test(navigator.userAgent) && e.ctrlKey) {
      switch (e.key) {
        case 'n':
          return this.selectNext();
        case 'p':
          return this.selectPrevious();
      }
    }

  }


  select(article) {
    this.setState({ selected: article.id });
  }


  selectedIndex() {
    let i = this.state.articles.indexOf(this.selected())
    return i >= 0 ? i : 0;
  }


  selectNext() {
    let i = this.selectedIndex();
    if (i+1 < this.state.articles.length)
      this.setState({ selected: this.state.articles[i+1].id });
    this.setScrollTriggered = true;
  }


  selectPrevious() {
    let i = this.selectedIndex();
    if (i > 0)
      this.setState({ selected: this.state.articles[i-1].id });
    this.setScrollTriggered = true;
  }


  updateQuery(e) {
    this.setState({ query: e.target.value }, () => this.searchDebounced());
  }


  pathPrefix() {
    if (!this.props.domains)
      return '';

    const domain = this.props.domains.find(d => 
      d.get('name') === this.props.config.get('domain')
    );

    return domain ? domain.get('path') : '';
  }


  async search() {
    const opts = { token: this.props.token };

    if (this.state.query)
      opts.query = { limit: 20, q: this.state.query };
    else 
      opts.query = { limit: 20, order: 'updated_at_desc' };

    if (this.pathPrefix()) opts.query.path = this.pathPrefix()

    try {
      const articles = await api(env.apiOrigin + '/articles', opts);

      if (this.articlesContainer)
        this.articlesContainer.scrollTop = 0;

      this.setState({ articles, selected: null })
    }
    catch (error) {
      console.error(error)
      this.props.apiError(error)
    }
  }


  setScroll() {

    if (!this.articlesContainer)
      return;

    let articles = Array.from(this.articlesContainer.children);
    let selected = articles.find(el => el.classList.contains('selected'));

    if (!selected)
      return;

    // distance in px to get the top of the selected aticle to the top of the
    // container
    let scrollDown = (
      selected.offsetTop
      - this.articlesContainer.scrollTop
    );

    // distance in px to put the bottom of the item at the bottom of the box
    let scrollUp = -1 * (
      this.articlesContainer.scrollTop
      + this.articlesContainer.clientHeight
      - selected.clientHeight
      - selected.offsetTop
    );

    if (scrollDown < 0)
      this.articlesContainer.scrollTop += scrollDown;
    else if (scrollUp > 0)
      this.articlesContainer.scrollTop += scrollUp;

  }

}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Search);


