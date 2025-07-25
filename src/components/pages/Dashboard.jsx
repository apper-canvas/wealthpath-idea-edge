import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MetricCard from "@/components/molecules/MetricCard";
import PerformanceIndicator from "@/components/molecules/PerformanceIndicator";
import PerformanceChart from "@/components/organisms/PerformanceChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ProgressBar from "@/components/atoms/ProgressBar";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { portfolioService } from "@/services/api/portfolioService";
import { goalsService } from "@/services/api/goalsService";
import { formatCurrency, formatDate } from "@/utils/formatters";

const Dashboard = () => {
const navigate = useNavigate();
const [portfolioData, setPortfolioData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const loadDashboardData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const [portfolio, goalsData, metrics] = await Promise.all([
        portfolioService.getPortfolioSummary(),
        goalsService.getAll(),
        portfolioService.getPerformanceMetrics()
      ]);
      
      setPortfolioData(portfolio);
      setGoals(goalsData.slice(0, 3)); // Show top 3 goals
      setPerformanceMetrics(metrics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;
  if (!portfolioData) return null;
  
  return (
    <div className="space-y-8">
      {/* Header */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Track your investment performance and goals
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <Button 
            onClick={() => navigate('/risk-assessment')}
            className="mb-2 sm:mb-0 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg"
          >
            <ApperIcon name="Shield" size={16} />
            Take Risk Assessment
          </Button>
          <div className="text-right">
            <p className="text-sm text-slate-500">Last updated</p>
            <p className="text-sm font-medium text-slate-900">
              {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      
      {/* Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Net Worth"
          value={portfolioData.netWorth}
          change={portfolioData.monthChange}
          changePercent={(portfolioData.monthChange / portfolioData.netWorth) * 100}
          icon="Wallet"
          gradient="from-emerald-500 to-teal-600"
        />
        <MetricCard
          title="Portfolio Value"
          value={portfolioData.totalValue}
          change={portfolioData.dayChange}
          changePercent={portfolioData.dayChangePercent}
          icon="TrendingUp"
          gradient="from-blue-500 to-indigo-600"
        />
        <MetricCard
          title="Monthly Change"
          value={portfolioData.monthChange}
          icon="Calendar"
          type="currency"
          gradient="from-purple-500 to-pink-600"
        />
        <MetricCard
          title="Yearly Change"
          value={portfolioData.yearChange}
          icon="BarChart3"
          type="currency"
          gradient="from-orange-500 to-red-600"
        />
      </div>
      
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Performance Overview</span>
            <div className="w-2 h-2 bg-gradient-to-r from-success-500 to-success-600 rounded-full"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl">
              <p className="text-sm font-medium text-slate-600 mb-2">Today</p>
              <PerformanceIndicator 
                value={portfolioData.dayChange}
                percentage={portfolioData.dayChangePercent}
                size="lg"
              />
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl">
              <p className="text-sm font-medium text-slate-600 mb-2">This Month</p>
              <PerformanceIndicator 
                value={portfolioData.monthChange}
                percentage={(portfolioData.monthChange / portfolioData.totalValue) * 100}
                size="lg"
              />
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-slate-50 to-green-50 rounded-xl">
              <p className="text-sm font-medium text-slate-600 mb-2">This Year</p>
              <PerformanceIndicator 
                value={portfolioData.yearChange}
                percentage={(portfolioData.yearChange / portfolioData.totalValue) * 100}
                size="lg"
              />
            </div>
          </div>
        </CardContent>
</Card>

      {/* Performance Chart Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ApperIcon name="TrendingUp" size={20} />
            <span>Portfolio Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceChart />
        </CardContent>
      </Card>
      {/* Quick Goals Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>Goal Progress</span>
            <div className="w-2 h-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
          </CardTitle>
          <div className="text-sm text-slate-500">
            Top 3 goals
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              
              return (
                <div key={goal.Id} className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-sm">
                        <ApperIcon name="Target" className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{goal.name}</h4>
                        <p className="text-sm text-slate-600">
                          Target: {formatDate(goal.targetDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900 currency-display">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </p>
                      <p className="text-xs text-slate-500">{goal.category}</p>
                    </div>
                  </div>
                  <ProgressBar 
                    value={goal.currentAmount}
                    max={goal.targetAmount}
                    variant={progress >= 100 ? "success" : "primary"}
                    showPercentage={true}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;