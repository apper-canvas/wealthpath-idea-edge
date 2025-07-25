import mockNews from '@/services/mockData/news.json';
import { portfolioService } from '@/services/api/portfolioService';

let newsData = [...mockNews];
let nextId = Math.max(...newsData.map(item => item.Id)) + 1;

export const newsService = {
  // Get all news articles
  getAll: () => {
    return Promise.resolve([...newsData]);
  },

  // Get news by ID
  getById: (id) => {
    if (typeof id !== 'number') {
      return Promise.reject(new Error('ID must be a number'));
    }
    
    const article = newsData.find(item => item.Id === id);
    if (!article) {
      return Promise.reject(new Error('Article not found'));
    }
    
    return Promise.resolve({ ...article });
  },

  // Get filtered news based on user's portfolio
  getFilteredNews: async (filters = {}) => {
    try {
      const { relevanceFilter = 'all', category = 'all', searchTerm = '', showUnreadOnly = false } = filters;
      let filteredNews = [...newsData];

      // Filter by portfolio relevance
      if (relevanceFilter === 'portfolio') {
        const portfolio = await portfolioService.getPortfolioSummary();
        const userSymbols = portfolio.holdings.map(holding => holding.symbol);
        
        filteredNews = filteredNews.filter(article => 
          article.relevantSymbols.some(symbol => userSymbols.includes(symbol))
        );
      }

      // Filter by category
      if (category !== 'all') {
        filteredNews = filteredNews.filter(article => article.category === category);
      }

      // Filter by search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        filteredNews = filteredNews.filter(article =>
          article.title.toLowerCase().includes(term) ||
          article.summary.toLowerCase().includes(term) ||
          article.tags.some(tag => tag.toLowerCase().includes(term))
        );
      }

      // Filter by read status
      if (showUnreadOnly) {
        filteredNews = filteredNews.filter(article => !article.isRead);
      }

      // Sort by relevance score and date
      filteredNews.sort((a, b) => {
        if (a.relevanceScore !== b.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      });

      return Promise.resolve(filteredNews);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Mark article as read
  markAsRead: (id) => {
    if (typeof id !== 'number') {
      return Promise.reject(new Error('ID must be a number'));
    }

    const articleIndex = newsData.findIndex(item => item.Id === id);
    if (articleIndex === -1) {
      return Promise.reject(new Error('Article not found'));
    }

    newsData[articleIndex] = {
      ...newsData[articleIndex],
      isRead: true
    };

    return Promise.resolve({ ...newsData[articleIndex] });
  },

  // Mark article as unread
  markAsUnread: (id) => {
    if (typeof id !== 'number') {
      return Promise.reject(new Error('ID must be a number'));
    }

    const articleIndex = newsData.findIndex(item => item.Id === id);
    if (articleIndex === -1) {
      return Promise.reject(new Error('Article not found'));
    }

    newsData[articleIndex] = {
      ...newsData[articleIndex],
      isRead: false
    };

    return Promise.resolve({ ...newsData[articleIndex] });
  },

  // Get market trends summary
  getMarketTrends: () => {
    const trends = {
      marketSentiment: 'bullish',
      keyIndicators: [
        { name: 'S&P 500', value: '4,750.23', change: '+1.2%', trend: 'up' },
        { name: 'NASDAQ', value: '14,892.45', change: '+1.8%', trend: 'up' },
        { name: 'VIX', value: '18.45', change: '-0.5%', trend: 'down' },
        { name: '10Y Treasury', value: '4.12%', change: '-0.03%', trend: 'down' }
      ],
      economicIndicators: [
        { name: 'Inflation (CPI)', value: '3.2%', previousValue: '3.7%', trend: 'down' },
        { name: 'Unemployment', value: '3.8%', previousValue: '3.9%', trend: 'down' },
        { name: 'GDP Growth', value: '2.4%', previousValue: '2.1%', trend: 'up' },
        { name: 'Fed Funds Rate', value: '5.25-5.50%', previousValue: '5.25-5.50%', trend: 'stable' }
      ]
    };

    return Promise.resolve(trends);
  },

  // Get news categories
  getCategories: () => {
    const categories = [
      { value: 'all', label: 'All Categories' },
      { value: 'earnings', label: 'Earnings' },
      { value: 'technology', label: 'Technology' },
      { value: 'monetary-policy', label: 'Monetary Policy' },
      { value: 'commodities', label: 'Commodities' },
      { value: 'fixed-income', label: 'Fixed Income' },
      { value: 'automotive', label: 'Automotive' },
      { value: 'market-outlook', label: 'Market Outlook' }
    ];

    return Promise.resolve(categories);
  },

  // Get news statistics
  getNewsStats: () => {
    const totalArticles = newsData.length;
    const unreadArticles = newsData.filter(article => !article.isRead).length;
    const readArticles = totalArticles - unreadArticles;
    
    const categoryStats = newsData.reduce((acc, article) => {
      acc[article.category] = (acc[article.category] || 0) + 1;
      return acc;
    }, {});

    return Promise.resolve({
      totalArticles,
      unreadArticles,
      readArticles,
      categoryStats
    });
  },

  // Create new article (for admin/testing purposes)
  create: (articleData) => {
    const newArticle = {
      ...articleData,
      Id: nextId++,
      publishedAt: new Date().toISOString(),
      isRead: false
    };

    newsData.unshift(newArticle);
    return Promise.resolve({ ...newArticle });
  },

  // Update article
  update: (id, articleData) => {
    if (typeof id !== 'number') {
      return Promise.reject(new Error('ID must be a number'));
    }

    const articleIndex = newsData.findIndex(item => item.Id === id);
    if (articleIndex === -1) {
      return Promise.reject(new Error('Article not found'));
    }

    newsData[articleIndex] = {
      ...newsData[articleIndex],
      ...articleData,
      Id: id // Ensure ID doesn't change
    };

    return Promise.resolve({ ...newsData[articleIndex] });
  },

  // Delete article
  delete: (id) => {
    if (typeof id !== 'number') {
      return Promise.reject(new Error('ID must be a number'));
    }

    const articleIndex = newsData.findIndex(item => item.Id === id);
    if (articleIndex === -1) {
      return Promise.reject(new Error('Article not found'));
    }

    const deletedArticle = newsData.splice(articleIndex, 1)[0];
    return Promise.resolve({ ...deletedArticle });
  }
};