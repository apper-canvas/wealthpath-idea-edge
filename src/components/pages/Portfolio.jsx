import { useState, useEffect } from "react";
import PortfolioChart from "@/components/organisms/PortfolioChart";
import PerformanceChart from "@/components/organisms/PerformanceChart";
import HoldingsTable from "@/components/organisms/HoldingsTable";
import MetricCard from "@/components/molecules/MetricCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { portfolioService } from "@/services/api/portfolioService";

const Portfolio = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const loadPortfolioData = async () => {
    try {
      setError(null);
      setLoading(true);
      const [summaryData, metricsData] = await Promise.all([
        portfolioService.getPortfolioSummary(),
        portfolioService.getPerformanceMetrics()
      ]);
      setPortfolioData(summaryData);
      setPerformanceMetrics(metricsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadPortfolioData();
  }, []);
  
if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadPortfolioData} />;
  if (!portfolioData || !performanceMetrics) return null;
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Portfolio
          </h1>
          <p className="text-slate-600 mt-1">
            Analyze your investment allocation and performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-slate-500">Last updated</p>
            <p className="text-sm font-medium text-slate-900">
              {new Date().toLocaleString("en-US", { 
                month: "short", 
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true
              })}
            </p>
          </div>
          <Button variant="primary" className="inline-flex items-center space-x-2">
            <ApperIcon name="RefreshCw" className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>
      
{/* Portfolio Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Value"
          value={portfolioData.totalValue}
          change={portfolioData.dayChange}
          changePercent={portfolioData.dayChangePercent}
          icon="Wallet"
          gradient="from-blue-500 to-indigo-600"
        />
        <MetricCard
          title="Today's Change"
          value={portfolioData.dayChange}
          changePercent={portfolioData.dayChangePercent}
          icon="TrendingUp"
          type="currency"
          gradient="from-emerald-500 to-teal-600"
        />
        <MetricCard
          title="Total Gain/Loss"
          value={performanceMetrics.totalUnrealizedGain}
          changePercent={performanceMetrics.totalReturnPercent}
          icon="Target"
          type="currency"
          gradient="from-purple-500 to-pink-600"
        />
        <MetricCard
          title="Cost Basis"
          value={performanceMetrics.totalCostBasis}
          icon="DollarSign"
          type="currency"
          gradient="from-orange-500 to-red-600"
        />
</div>

      {/* Performance Chart Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ApperIcon name="BarChart3" size={20} />
            <span>Performance Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceChart />
        </CardContent>
      </Card>
      {/* Performance Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
              <ApperIcon name="TrendingUp" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Best Performer</h3>
              <p className="text-sm text-slate-600">
                {performanceMetrics.bestPerformer.symbol} • {performanceMetrics.bestPerformer.name}
              </p>
              <p className="text-lg font-bold text-green-600">
                +${Math.abs(performanceMetrics.bestPerformer.dayChange).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
              <ApperIcon name="TrendingDown" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Worst Performer</h3>
              <p className="text-sm text-slate-600">
                {performanceMetrics.worstPerformer.symbol} • {performanceMetrics.worstPerformer.name}
              </p>
              <p className="text-lg font-bold text-red-600">
                ${performanceMetrics.worstPerformer.dayChange.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Portfolio Allocation and Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Asset Allocation Chart */}
        <div className="lg:col-span-2">
          <PortfolioChart />
        </div>
        
        {/* Holdings Table */}
        <div className="lg:col-span-3">
          <HoldingsTable />
        </div>
      </div>
      
      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <ApperIcon name="Lightbulb" className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Portfolio Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Diversification</h4>
                <p className="text-sm text-slate-600">
                  Your portfolio shows good diversification across asset classes, helping to reduce overall risk.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Performance</h4>
                <p className="text-sm text-slate-600">
                  Recent performance has been {portfolioData.dayChange > 0 ? "positive" : "negative"}, 
                  with strong {portfolioData.yearChange > 0 ? "annual gains" : "annual performance"}.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Recommendation</h4>
                <p className="text-sm text-slate-600">
                  Consider rebalancing if any asset class deviates significantly from your target allocation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;