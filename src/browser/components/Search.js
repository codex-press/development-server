import React from 'react';

import Article from './Article';
import { debounce, api } from '../utility'

import './Search.less';

export default class Search extends React.Component {

  constructor(props) {
    super();
    this.search = debounce(500, this.search, this);
    this.state = {query: '', articles: null, selected: null};
  }


  render() {

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
              navigate={ () => window.location.href = a.url }
              select={ () => this.select(a) }
              key={a.id}
              {...a}
              selected={ this.selected() && this.selected().id === a.id } />)
          }
        </div>

      </div>
    );
  }


  componentDidMount() {
    this.search();
  }


  componentWillReceiveProps(props) {
    if (!props.open && this.state.query)
      this.setState({query: '', articles: null, selected: null});
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
      case 'ArrowDown':
        return this.selectNext();
      case 'ArrowUp':
        return this.selectPrevious();
      case 'Enter':
        if (this.selected())
          window.location.href = this.selected().url;
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


  updateQuery(e) {
    this.setState({query: e.target.value}, () => this.search());
  }


  search() {
    if (this.state.query) {
      api(`/articles?limit=20&q=${ encodeURIComponent(this.state.query) }`)
      .then(articles => {
        if (this.articlesContainer) {
          this.articlesContainer.scrollTop = 0;
        }
        this.setState({articles, selected: null})
      })
    }
    else {
      api(`/articles?limit=20&order=updated_at_desc`)
      .then(articles => {
        if (this.articlesContainer) {
          this.articlesContainer.scrollTop = 0;
        }
        this.setState({articles, selected: null})
      })
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
