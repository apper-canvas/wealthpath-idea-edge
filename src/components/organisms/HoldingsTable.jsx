import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { formatCurrency, formatPercentage, getChangeColor, getChangeIcon } from "@/utils/formatters";
import { portfolioService } from "@/services/api/portfolioService";

const HoldingsTable = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("totalValue");
  const [sortOrder, setSortOrder] = useState("desc");
  
  const loadHoldings = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await portfolioService.getHoldings();
      setHoldings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadHoldings();
  }, []);
  
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };
  
  const sortedHoldings = [...holdings].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === "string") {
      return sortOrder === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
  });
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadHoldings} />;
  if (holdings.length === 0) return <Empty message="No holdings found" />;
  
  const SortButton = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left font-semibold text-slate-700 hover:text-slate-900 transition-colors"
    >
      <span>{children}</span>
      <ApperIcon 
        name={sortBy === field ? (sortOrder === "asc" ? "ChevronUp" : "ChevronDown") : "ChevronsUpDown"} 
        className="h-4 w-4" 
      />
    </button>
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Holdings</span>
          <div className="w-2 h-2 bg-gradient-to-r from-success-500 to-success-600 rounded-full"></div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
<tr className="border-b border-slate-200">
                <th className="text-left py-3 px-2">
                  <SortButton field="symbol">Symbol</SortButton>
                </th>
                <th className="text-left py-3 px-2 hidden sm:table-cell">
                  <SortButton field="name">Name</SortButton>
                </th>
                <th className="text-right py-3 px-2">
                  <SortButton field="quantity">Shares</SortButton>
                </th>
                <th className="text-right py-3 px-2">
                  <SortButton field="currentPrice">Price</SortButton>
                </th>
                <th className="text-right py-3 px-2 hidden lg:table-cell">
                  <SortButton field="costBasis">Cost Basis</SortButton>
                </th>
                <th className="text-right py-3 px-2">
                  <SortButton field="totalValue">Value</SortButton>
                </th>
                <th className="text-right py-3 px-2">
                  <SortButton field="dayChange">Day Change</SortButton>
                </th>
                <th className="text-right py-3 px-2 hidden xl:table-cell">
                  <SortButton field="unrealizedGain">Total Gain/Loss</SortButton>
                </th>
                <th className="text-right py-3 px-2 hidden md:table-cell">
                  <SortButton field="allocation">%</SortButton>
                </th>
              </tr>
            </thead>
            <tbody>
{sortedHoldings.map((holding) => {
                const changeColor = getChangeColor(holding.dayChange);
                const changeIcon = getChangeIcon(holding.dayChange);
                const changePercent = (holding.dayChange / (holding.totalValue - holding.dayChange)) * 100;
                
                // Calculate cost basis and unrealized gain
                const costBasisPerShare = holding.currentPrice - (holding.dayChange / holding.quantity);
                const totalCostBasis = holding.quantity * costBasisPerShare;
                const unrealizedGain = holding.totalValue - totalCostBasis;
                const totalReturnPercent = (unrealizedGain / totalCostBasis) * 100;
                
                const gainColor = getChangeColor(unrealizedGain);
                const gainIcon = getChangeIcon(unrealizedGain);
                
                return (
                  <tr 
                    key={holding.Id} 
                    className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-200"
                  >
                    <td className="py-4 px-2">
                      <div className="font-semibold text-slate-900">{holding.symbol}</div>
                      <div className="text-sm text-slate-500 sm:hidden truncate max-w-[100px]">
                        {holding.name}
                      </div>
                    </td>
                    <td className="py-4 px-2 hidden sm:table-cell">
                      <div className="text-sm text-slate-700 max-w-[150px] truncate">
                        {holding.name}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <span className="font-medium text-slate-900 currency-display">
                        {holding.quantity.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <span className="font-medium text-slate-900 currency-display">
                        {formatCurrency(holding.currentPrice, { showCents: true })}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right hidden lg:table-cell">
                      <span className="font-medium text-slate-700 currency-display">
                        {formatCurrency(totalCostBasis)}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <span className="font-semibold text-slate-900 currency-display">
                        {formatCurrency(holding.totalValue)}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className={`flex items-center justify-end space-x-1 ${changeColor}`}>
                        <ApperIcon name={changeIcon} className="h-3 w-3" />
                        <span className="text-sm font-medium currency-display">
                          {formatCurrency(Math.abs(holding.dayChange), { compact: true })}
                        </span>
                        <span className="text-xs">
                          ({formatPercentage(Math.abs(changePercent))})
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right hidden xl:table-cell">
                      <div className={`flex items-center justify-end space-x-1 ${gainColor}`}>
                        <ApperIcon name={gainIcon} className="h-3 w-3" />
                        <div className="text-right">
                          <div className="text-sm font-medium currency-display">
                            {formatCurrency(Math.abs(unrealizedGain), { compact: true })}
                          </div>
                          <div className="text-xs">
                            ({formatPercentage(Math.abs(totalReturnPercent))})
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right hidden md:table-cell">
                      <span className="text-sm font-medium text-slate-700">
                        {formatPercentage(holding.allocation)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default HoldingsTable;