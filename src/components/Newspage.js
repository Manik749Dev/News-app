// NewsPage.jsx

import React, { useState, useEffect } from 'react';

const NewsPage = () => {
  const [articles, setArticles] = useState([]);       // to store news articles
  const [loading, setLoading] = useState(true);       // loading state
  const [error, setError] = useState(null);           // to store error

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const apiKey = "8b251074-71a4-45b5-b5af-3d5021230c23";
        const q = "technology";  // example query
        // build URL according to NewsAPI.ai docs
        const url = `https://newsapi.ai/api/search?q=${encodeURIComponent(q)}&apiKey=${apiKey}`;
        // (adjust path/params as per actual docs)
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.response && data.response.results) {
          setArticles(data.response.results || []);
        } else {
          throw new Error('Invalid JSON response');
        }
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);  // empty dependency → run once when component mounts

  if (loading) {
    return <div>Loading news...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>News</h1>
      {articles.length === 0 ? (
        <div>No articles found</div>
      ) : (
        <ul>
          {articles.map((art, idx) => (
            <li key={idx}>
              <h3>{art.title}</h3>
              <p>{art.description}</p>
              <a href={art.url} target="_blank" rel="noreferrer">Read more</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NewsPage;

