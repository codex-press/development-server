import React from 'react';
import Fuse from 'fuse.js';
import { connect } from 'react-redux'

import Article from './Article';
import { navigate } from '../actions';


const mapStateToProps = state => {
  return {
    open: state.getIn(['ui','modal']) === 'search',
    articles: state.get('articles'),
  }
}


const mapDispatchToProps = {
  navigate,
}


class Search extends React.Component {


  constructor(props) {
    super();
    this.key = this.key.bind(this);
    this.wheel = this.wheel.bind(this);
    this.search = this.search.bind(this);
    this.state = {query: '', articles: null};
  }


  render() {

    if (!this.props.open || !this.state.articles)
      return null;

    return (
      <div className="Search">

        <input
          autoFocus
          value={ this.state.query }
          onChange={ this.search }
          onKeyDown={ this.key }/>

        <div
          className="articles-container"
          onWheel={ this.wheel }
          ref={ el => this.articlesContainer = el }>

          { this.state.articles.length === 0 &&
            <span className="empty">No match</span>
          }

          { this.state.articles.map(a =>
            <Article
              navigate={ () => this.props.navigate(a.url) }
              select={ () => this.select(a) }
              key={a.id}
              {...a}
              selected={ this.selected().id === a.id } />)
          }
        </div>

      </div>
    );
  }


  componentWillReceiveProps(props) {
    if (!props.open && this.state.query)
      this.setState({query: ''});

    if (!this.state.articles && props.articles.count())
      this.setState({articles: props.articles.toJS()});
  }


  componentDidUpdate() {
    if (this.setScrollTriggered)
      this.setScroll();
    this.setScrollTriggered = false;
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
      case 'Enter':
        return this.selected() && this.props.navigate(this.selected().url);
      case 'ArrowDown':
        return this.selectNext();
      case 'ArrowUp':
        return this.selectPrevious();
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
    this.setState({selected: article.id});
  }


  selectedIndex() {
    let i = this.state.articles.indexOf(this.selected())
    return i >= 0 ? i : 0;
  }


  selectNext() {
    let i = this.selectedIndex();
    if (i+1 < this.state.articles.length)
      this.setState({selected: this.state.articles[i+1].id});
    this.setScrollTriggered = true;
  }


  selectPrevious() {
    let i = this.selectedIndex();
    if (i > 0)
      this.setState({selected: this.state.articles[i-1].id});
    this.setScrollTriggered = true;
  }


  search(e) {

    if (!this.fuse) {
      let keys = [
        "title",
        "url",
        "classed_content.hed",
        "classed_content.byline"
      ];

      this.fuse = new Fuse(this.props.articles.toJS(), {keys});
    }

    let query = e.target.value;
    this.setState({
      query,
      selected: null,
      articles: query ? this.fuse.search(query) : this.props.articles.toJS(),
    });
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

