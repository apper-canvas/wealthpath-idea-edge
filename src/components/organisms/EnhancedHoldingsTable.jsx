import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { formatCurrency, formatPercentage, getChangeColor, getChangeIcon } from '@/utils/formatters';
import { portfolioService } from '@/services/api/portfolioService';

function SortButton({ field, children, sortField, sortDirection, onSort }) {
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center space-x-1 hover:text-primary-600 transition-colors"
    >
      <span>{children}</span>
      {sortField === field && (
        <ApperIcon 
          name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
          size={14} 
        />
      )}
    </button>
  );
}

export default function EnhancedHoldingsTable({ showTaxInfo = false }) {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('totalValue');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    loadHoldings();
  }, [showTaxInfo]);

  const loadHoldings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = showTaxInfo 
        ? await portfolioService.getHoldingsWithTaxInfo()
        : await portfolioService.getHoldings();
      
      if (result.success) {
        setHoldings(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load holdings data');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedHoldings = [...holdings].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const getHarvestingColor = (potential) => {
    switch (potential) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (holdings.length === 0) return <Empty message="No holdings found" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ApperIcon name="TrendingUp" size={20} />
            <span>Holdings {showTaxInfo ? '& Tax Information' : ''}</span>
          </div>
          <div className="text-sm text-gray-600">
            {holdings.length} positions
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton 
                    field="symbol" 
                    sortField={sortField} 
                    sortDirection={sortDirection} 
                    onSort={handleSort}
                  >
                    Symbol
                  </SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton 
                    field="shares" 
                    sortField={sortField} 
                    sortDirection={sortDirection} 
                    onSort={handleSort}
                  >
                    Shares
                  </SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton 
                    field="currentPrice" 
                    sortField={sortField} 
                    sortDirection={sortDirection} 
                    onSort={handleSort}
                  >
                    Price
                  </SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton 
                    field="totalValue" 
                    sortField={sortField} 
                    sortDirection={sortDirection} 
                    onSort={handleSort}
                  >
                    Market Value
                  </SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton 
                    field="changePercent" 
                    sortField={sortField} 
                    sortDirection={sortDirection} 
                    onSort={handleSort}
                  >
                    Day Change
                  </SortButton>
                </th>
                {showTaxInfo && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortButton 
                        field="totalCostBasis" 
                        sortField={sortField} 
                        sortDirection={sortDirection} 
                        onSort={handleSort}
                      >
                        Cost Basis
                      </SortButton>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortButton 
                        field="unrealizedGain" 
                        sortField={sortField} 
                        sortDirection={sortDirection} 
                        onSort={handleSort}
                      >
                        Unrealized Gain/Loss
                      </SortButton>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harvesting
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedHoldings.map((holding) => {
                const changeColor = getChangeColor(holding.changePercent);
                const changeIcon = getChangeIcon(holding.changePercent);

                return (
                  <tr key={holding.symbol} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {holding.symbol}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-32">
                          {holding.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 currency-display">
                      {holding.shares.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 currency-display">
                      {formatCurrency(holding.currentPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 currency-display">
                      {formatCurrency(holding.totalValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center space-x-1 ${changeColor}`}>
                        <ApperIcon name={changeIcon} size={14} />
                        <span className="text-sm font-medium currency-display">
                          {formatPercentage(holding.changePercent)}
                        </span>
                      </div>
                      <div className={`text-xs ${changeColor} currency-display`}>
                        {formatCurrency(holding.changeAmount)}
                      </div>
                    </td>
                    {showTaxInfo && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 currency-display">
                            {formatCurrency(holding.totalCostBasis)}
                          </div>
                          <div className="text-xs text-gray-500 currency-display">
                            {formatCurrency(holding.costBasisPerShare)}/share
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium currency-display ${
                            holding.unrealizedGain >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(holding.unrealizedGain)}
                          </div>
                          <div className={`text-xs ${
                            holding.unrealizedGainPercent >= 0 ? 'text-green-600' : 'text-red-600'
                          } currency-display`}>
                            {formatPercentage(holding.unrealizedGainPercent)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {holding.harvestingPotential !== 'None' ? (
                            <div className="flex flex-col space-y-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHarvestingColor(holding.harvestingPotential)}`}>
                                {holding.harvestingPotential}
                              </span>
                              {holding.taxLossEligible && (
                                <div className="flex items-center space-x-1 text-red-600">
                                  <ApperIcon name="TrendingDown" size={12} />
                                  <span className="text-xs">Eligible</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">No opportunity</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {showTaxInfo && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <ApperIcon name="Info" size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Tax Information Notes</span>
            </div>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Cost basis calculations are estimates based on current market data</li>
              <li>• Tax-loss harvesting potential considers position size and loss percentage</li>
              <li>• Consult your tax advisor before making harvesting decisions</li>
              <li>• Wash sale rules apply for repurchases within 30 days</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}