import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import NewsCard from '@/components/molecules/NewsCard';
import { newsService } from '@/services/api/newsService';
import { cn } from '@/utils/cn';

const MarketNews = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [marketTrends, setMarketTrends] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newsStats, setNewsStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters state
  const [filters, setFilters] = useState({
    relevanceFilter: 'all',
    category: 'all',
    searchTerm: '',
    showUnreadOnly: false
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Load initial data
  useEffect(() => {
    loadNewsData();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [filters, news]);

  const loadNewsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [newsData, trendsData, categoriesData, statsData] = await Promise.all([
        newsService.getAll(),
        newsService.getMarketTrends(),
        newsService.getCategories(),
        newsService.getNewsStats()
      ]);

      setNews(newsData);
      setMarketTrends(trendsData);
      setCategories(categoriesData);
      setNewsStats(statsData);
    } catch (err) {
      console.error('Error loading news data:', err);
      setError(err.message);
      toast.error('Failed to load market news');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const filtered = await newsService.getFilteredNews(filters);
      setFilteredNews(filtered);
      setCurrentPage(1); // Reset to first page when filters change
    } catch (err) {
      console.error('Error filtering news:', err);
      toast.error('Failed to filter news');
    }
  };

  const handleMarkAsRead = async (articleId) => {
    try {
      await newsService.markAsRead(articleId);
      
      // Update local state
      setNews(prev => prev.map(article => 
        article.Id === articleId ? { ...article, isRead: true } : article
      ));
      
      // Update stats
      const updatedStats = await newsService.getNewsStats();
      setNewsStats(updatedStats);
      
      toast.success('Article marked as read');
    } catch (err) {
      console.error('Error marking article as read:', err);
      toast.error('Failed to mark article as read');
    }
  };

  const handleMarkAsUnread = async (articleId) => {
    try {
      await newsService.markAsUnread(articleId);
      
      // Update local state
      setNews(prev => prev.map(article => 
        article.Id === articleId ? { ...article, isRead: false } : article
      ));
      
      // Update stats
      const updatedStats = await newsService.getNewsStats();
      setNewsStats(updatedStats);
      
      toast.success('Article marked as unread');
    } catch (err) {
      console.error('Error marking article as unread:', err);
      toast.error('Failed to mark article as unread');
    }
  };

  const handleReadMore = (article) => {
    if (article.url) {
      window.open(article.url, '_blank', 'noopener,noreferrer');
      toast.info('Opening full article in new tab');
    } else {
      toast.info('Full article not available');
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSearchChange = (e) => {
    const searchTerm = e.target.value;
    setFilters(prev => ({
      ...prev,
      searchTerm
    }));
  };

  const clearFilters = () => {
    setFilters({
      relevanceFilter: 'all',
      category: 'all',
      searchTerm: '',
      showUnreadOnly: false
    });
    toast.info('Filters cleared');
  };

  const markAllAsRead = async () => {
    try {
      const unreadArticles = filteredNews.filter(article => !article.isRead);
      
      if (unreadArticles.length === 0) {
        toast.info('No unread articles to mark');
        return;
      }

      // Mark all unread articles as read
      await Promise.all(
        unreadArticles.map(article => newsService.markAsRead(article.Id))
      );

      // Update local state
      setNews(prev => prev.map(article => ({ ...article, isRead: true })));
      
      // Update stats
      const updatedStats = await newsService.getNewsStats();
      setNewsStats(updatedStats);
      
      toast.success(`Marked ${unreadArticles.length} articles as read`);
    } catch (err) {
      console.error('Error marking all as read:', err);
      toast.error('Failed to mark articles as read');
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNews = filteredNews.slice(startIndex, endIndex);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'TrendingUp';
      case 'down': return 'TrendingDown';
      case 'stable': return 'Minus';
      default: return 'TrendingUp';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-slate-600';
      default: return 'text-slate-600';
    }
  };

  if (loading) {
    return <Loading className="p-6" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadNewsData} className="p-6" />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Market News</h1>
          <p className="text-slate-600">
            Stay updated with curated financial news and market insights
          </p>
        </div>
        
        {newsStats && (
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-900">
                {newsStats.unreadArticles}
              </div>
              <div className="text-sm text-slate-600">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-900">
                {newsStats.totalArticles}
              </div>
              <div className="text-sm text-slate-600">Total</div>
            </div>
          </div>
        )}
      </div>

      {/* Market Trends Section */}
      {marketTrends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ApperIcon name="BarChart3" className="w-5 h-5 text-primary-600" />
                Key Market Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {marketTrends.keyIndicators.map((indicator, index) => (
                  <div key={index} className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-sm font-medium text-slate-600 mb-1">
                      {indicator.name}
                    </div>
                    <div className="text-lg font-semibold text-slate-900 mb-1">
                      {indicator.value}
                    </div>
                    <div className={cn(
                      'text-sm flex items-center justify-center gap-1',
                      getTrendColor(indicator.trend)
                    )}>
                      <ApperIcon 
                        name={getTrendIcon(indicator.trend)} 
                        className="w-3 h-3" 
                      />
                      {indicator.change}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ApperIcon name="Activity" className="w-5 h-5 text-primary-600" />
                Economic Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketTrends.economicIndicators.map((indicator, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">
                        {indicator.name}
                      </div>
                      <div className="text-sm text-slate-600">
                        Previous: {indicator.previousValue}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">
                        {indicator.value}
                      </div>
                      <div className={cn(
                        'text-sm flex items-center gap-1',
                        getTrendColor(indicator.trend)
                      )}>
                        <ApperIcon 
                          name={getTrendIcon(indicator.trend)} 
                          className="w-3 h-3" 
                        />
                        {indicator.trend}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ApperIcon name="Filter" className="w-5 h-5 text-primary-600" />
            Filter News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search
              </label>
              <div className="relative">
                <ApperIcon 
                  name="Search" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" 
                />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={filters.searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Relevance Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Relevance
              </label>
              <select
                value={filters.relevanceFilter}
                onChange={(e) => handleFilterChange('relevanceFilter', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Articles</option>
                <option value="portfolio">Portfolio Related</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Read Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.showUnreadOnly}
                    onChange={(e) => handleFilterChange('showUnreadOnly', e.target.checked)}
                    className="mr-2 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700">Unread only</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-600">
              Showing {currentNews.length} of {filteredNews.length} articles
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-slate-600"
              >
                <ApperIcon name="X" className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={markAllAsRead}
                disabled={filteredNews.filter(article => !article.isRead).length === 0}
              >
                <ApperIcon name="CheckCheck" className="w-4 h-4 mr-1" />
                Mark All Read
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Articles */}
      {currentNews.length === 0 ? (
        <Empty
          message="No articles found"
          description="Try adjusting your filters or check back later for new articles."
          icon="Newspaper"
          className="py-12"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentNews.map((article) => (
            <NewsCard
              key={article.Id}
              article={article}
              onMarkAsRead={handleMarkAsRead}
              onMarkAsUnread={handleMarkAsUnread}
              onReadMore={handleReadMore}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ApperIcon name="ChevronLeft" className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="min-w-[2.5rem]"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ApperIcon name="ChevronRight" className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MarketNews;