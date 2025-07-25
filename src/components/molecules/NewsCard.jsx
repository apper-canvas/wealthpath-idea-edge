import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/formatters';

const NewsCard = ({ article, onMarkAsRead, onMarkAsUnread, onReadMore, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReadToggle = () => {
    if (article.isRead) {
      onMarkAsUnread?.(article.Id);
    } else {
      onMarkAsRead?.(article.Id);
    }
  };

  const handleReadMore = () => {
    if (!article.isRead) {
      onMarkAsRead?.(article.Id);
    }
    onReadMore?.(article);
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'earnings': 'TrendingUp',
      'technology': 'Cpu',
      'monetary-policy': 'Building2',
      'commodities': 'Coins',
      'fixed-income': 'PiggyBank',
      'automotive': 'Car',
      'market-outlook': 'BarChart3'
    };
    return iconMap[category] || 'Newspaper';
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'earnings': 'text-green-600 bg-green-50',
      'technology': 'text-blue-600 bg-blue-50',
      'monetary-policy': 'text-purple-600 bg-purple-50',
      'commodities': 'text-yellow-600 bg-yellow-50',
      'fixed-income': 'text-indigo-600 bg-indigo-50',
      'automotive': 'text-red-600 bg-red-50',
      'market-outlook': 'text-orange-600 bg-orange-50'
    };
    return colorMap[category] || 'text-gray-600 bg-gray-50';
  };

  const getRelevanceColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <Card className={cn(
      'relative transition-all duration-200 hover:shadow-lg group',
      article.isRead ? 'opacity-80 bg-slate-50' : 'bg-white',
      className
    )}>
      {/* Read status indicator */}
      <div className={cn(
        'absolute top-0 left-0 w-1 h-full rounded-l-lg transition-all duration-200',
        article.isRead ? 'bg-slate-300' : 'bg-primary-500'
      )} />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                getCategoryColor(article.category)
              )}>
                <ApperIcon 
                  name={getCategoryIcon(article.category)} 
                  className="w-3 h-3 mr-1" 
                />
                {article.category.replace('-', ' ').toUpperCase()}
              </span>
              
              <span className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                getRelevanceColor(article.relevanceScore)
              )}>
                <ApperIcon name="Target" className="w-3 h-3 mr-1" />
                {article.relevanceScore}% Match
              </span>
            </div>

            <h3 className={cn(
              'text-lg font-semibold leading-tight mb-2 group-hover:text-primary-600 transition-colors',
              article.isRead ? 'text-slate-600' : 'text-slate-900'
            )}>
              {article.title}
            </h3>

            <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
              <span className="flex items-center gap-1">
                <ApperIcon name="Calendar" className="w-4 h-4" />
                {formatDate(article.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <ApperIcon name="User" className="w-4 h-4" />
                {article.author}
              </span>
              <span className="flex items-center gap-1">
                <ApperIcon name="Building" className="w-4 h-4" />
                {article.source}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReadToggle}
            className="shrink-0"
            title={article.isRead ? 'Mark as unread' : 'Mark as read'}
          >
            <ApperIcon 
              name={article.isRead ? 'Eye' : 'EyeOff'} 
              className="w-4 h-4" 
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className={cn(
          'text-slate-600 leading-relaxed mb-4',
          article.isRead && 'text-slate-500'
        )}>
          {isExpanded ? article.content : article.summary}
        </p>

        {/* Relevant symbols */}
        {article.relevantSymbols && article.relevantSymbols.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-slate-600">Related:</span>
            <div className="flex flex-wrap gap-1">
              {article.relevantSymbols.map((symbol) => (
                <span
                  key={symbol}
                  className="inline-flex items-center px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded"
                >
                  {symbol}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <ApperIcon name="Tag" className="w-4 h-4 text-slate-400" />
            <div className="flex flex-wrap gap-1">
              {article.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
              {article.tags.length > 4 && (
                <span className="text-xs text-slate-500">
                  +{article.tags.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {article.content && article.content !== article.summary && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-slate-600 hover:text-slate-900"
              >
                <ApperIcon 
                  name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
                  className="w-4 h-4 mr-1" 
                />
                {isExpanded ? 'Show Less' : 'Read More'}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReadMore}
              className="text-primary-600 hover:text-primary-700"
            >
              <ApperIcon name="ExternalLink" className="w-4 h-4 mr-1" />
              Full Article
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;