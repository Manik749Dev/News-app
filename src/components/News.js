import React, { Component } from 'react';
import NewsItem from './NewsItem';
import Spinner from './Spinner';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';

export class News extends Component {
  static defaultProps = {
    country: 'us',
    pageSize: 8,
    category: 'general',
  };

  static propTypes = {
    country: PropTypes.string,
    pageSize: PropTypes.number,
    category: PropTypes.string,
    apiKey: PropTypes.string.isRequired,
    setProgress: PropTypes.func,
  };

  capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  constructor(props) {
    super(props);
    this.state = {
      articles: [],
      loading: true,
      page: 1,
      totalResults: 0,
      hasMore: true,
    };
    document.title = `${this.capitalizeFirstLetter(this.props.category)} - NewsMonkey`;
  }

  async updateNews() {
    try {
      this.props.setProgress(10);
      const url = `https://newsapi.org/v2/top-headlines?country=${this.props.country}&category=${this.props.category}&apiKey=${this.props.apiKey}&page=1&pageSize=${this.props.pageSize}`;
      this.props.setProgress(40);
      this.setState({ loading: true });

      const response = await fetch(url);
      const parsedData = await response.json();
      this.props.setProgress(70);

      if (parsedData.status !== 'ok') {
        throw new Error(parsedData.message || 'Failed to fetch news');
      }

      this.setState({
        articles: parsedData.articles || [],
        totalResults: parsedData.totalResults || 0,
        loading: false,
        hasMore: (parsedData.articles?.length || 0) < (parsedData.totalResults || 0),
        page: 1,
      });

      this.props.setProgress(100);
    } catch (error) {
      console.error('❌ Error fetching news:', error.message);
      this.setState({ loading: false, articles: [], hasMore: false });
      this.props.setProgress(100);
    }
  }

  async componentDidMount() {
    await this.updateNews();
  }

  fetchMoreData = async () => {
    try {
      const nextPage = this.state.page + 1;
      const url = `https://newsapi.org/v2/top-headlines?country=${this.props.country}&category=${this.props.category}&apiKey=${this.props.apiKey}&page=${nextPage}&pageSize=${this.props.pageSize}`;
      const response = await fetch(url);
      const parsedData = await response.json();

      if (parsedData.status !== 'ok' || !parsedData.articles || parsedData.articles.length === 0) {
        this.setState({ hasMore: false });
        return;
      }

      this.setState({
        articles: this.state.articles.concat(parsedData.articles),
        totalResults: parsedData.totalResults || this.state.totalResults,
        page: nextPage,
        hasMore: this.state.articles.length + parsedData.articles.length < (parsedData.totalResults || this.state.totalResults),
      });
    } catch (error) {
      console.error('❌ Error fetching more data:', error.message);
      this.setState({ hasMore: false });
    }
  };

  render() {
    const { articles, loading, hasMore } = this.state;

    return (
      <>
        <h1 className="text-center" style={{ margin: '35px 0px' }}>
          NewsMonkey - Top {this.capitalizeFirstLetter(this.props.category)} Headlines
        </h1>

        {loading && <Spinner />}

        {!loading && (
          <InfiniteScroll
            dataLength={articles.length}
            next={this.fetchMoreData}
            hasMore={hasMore}
            loader={<Spinner />}
            endMessage={
              <p style={{ textAlign: 'center', marginTop: '20px' }}>
                <b>Congratulations! You have reached the end of the news feed 📰</b>
              </p>
            }
          >
            <div className="container">
              <div className="row">
                {articles.map((element) => (
                  <div className="col-md-4" key={element.url}>
                    <NewsItem
                      title={element.title || ''}
                      description={element.description || ''}
                      imageUrl={element.urlToImage}
                      newsUrl={element.url}
                      author={element.author}
                      date={element.publishedAt}
                      source={element.source?.name}
                    />
                  </div>
                ))}
              </div>
            </div>
          </InfiniteScroll>
        )}
      </>
    );
  }
}

export default News;
