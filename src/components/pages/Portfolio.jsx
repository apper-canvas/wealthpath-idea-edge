import React, { useEffect, useState } from "react";
import RebalancingAlerts from "@/components/molecules/RebalancingAlerts";
import RebalancingModal from "@/components/molecules/RebalancingModal";
import { toast } from "react-toastify";
import { aiRecommendationsService } from "@/services/api/aiRecommendationsService";
import { portfolioService } from "@/services/api/portfolioService";
import ApperIcon from "@/components/ApperIcon";
import PerformanceChart from "@/components/organisms/PerformanceChart";
import HoldingsTable from "@/components/organisms/HoldingsTable";
import PortfolioChart from "@/components/organisms/PortfolioChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import MetricCard from "@/components/molecules/MetricCard";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
const Portfolio = () => {
const [portfolioData, setPortfolioData] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [applyingRecommendations, setApplyingRecommendations] = useState(false);
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

  const loadRecommendations = async () => {
    try {
      setRecommendationsLoading(true);
      const recommendationsData = await aiRecommendationsService.getPersonalizedRecommendations();
      setRecommendations(recommendationsData);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      // Don't show error toast for recommendations as it's not critical
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleApplyRecommendations = async () => {
    if (!recommendations) return;
    
    setApplyingRecommendations(true);
    try {
      await portfolioService.applyRecommendations(recommendations);
      toast.success("Recommendations applied successfully! Your portfolio is being rebalanced.");
      
      // Reload portfolio data to reflect changes
      await loadPortfolioData();
      
      // Refresh recommendations
      await loadRecommendations();
    } catch (err) {
      toast.error("Failed to apply recommendations. Please try again.");
    } finally {
      setApplyingRecommendations(false);
    }
  };

  const handleRefreshRecommendations = async () => {
    try {
      setRecommendationsLoading(true);
      const refreshedRecommendations = await aiRecommendationsService.refreshRecommendations();
      setRecommendations(refreshedRecommendations);
      toast.success("Recommendations updated successfully!");
    } catch (err) {
      toast.error("Failed to refresh recommendations.");
    } finally {
      setRecommendationsLoading(false);
    }
  };
  
const [rebalancingAlerts, setRebalancingAlerts] = useState([]);
  const [driftAnalysis, setDriftAnalysis] = useState(null);
  const [showRebalancingModal, setShowRebalancingModal] = useState(false);
  const [rebalancingPlan, setRebalancingPlan] = useState(null);
  const [isExecutingRebalancing, setIsExecutingRebalancing] = useState(false);

  useEffect(() => {
    loadPortfolioData();
    loadRebalancingAlerts();
  }, []);

  useEffect(() => {
    if (portfolioData) {
      loadRecommendations();
      loadDriftAnalysis();
    }
  }, [portfolioData]);

  const loadRebalancingAlerts = async () => {
    try {
      const { rebalancingService } = await import('@/services/api/rebalancingService');
      const alerts = await rebalancingService.getRebalancingAlerts();
      setRebalancingAlerts(alerts);
      
      // Show toast notification for new alerts
      if (alerts.length > 0) {
        const criticalAlerts = alerts.filter(a => a.type === 'critical');
        if (criticalAlerts.length > 0) {
          toast.warning('Portfolio rebalancing required - significant drift detected', {
            position: 'top-right',
            autoClose: 5000
          });
        }
      }
    } catch (error) {
      console.error('Failed to load rebalancing alerts:', error);
    }
  };

  const loadDriftAnalysis = async () => {
    try {
      const { rebalancingService } = await import('@/services/api/rebalancingService');
      const analysis = await rebalancingService.analyzePortfolioDrift();
      setDriftAnalysis(analysis);
    } catch (error) {
      console.error('Failed to load drift analysis:', error);
    }
  };

  const handleStartRebalancing = async () => {
    try {
      const { rebalancingService } = await import('@/services/api/rebalancingService');
      const plan = await rebalancingService.generateRebalancingPlan();
      setRebalancingPlan(plan);
      setShowRebalancingModal(true);
    } catch (error) {
      toast.error('Failed to generate rebalancing plan');
    }
  };

  const handleExecuteRebalancing = async () => {
    if (!rebalancingPlan) return;

    setIsExecutingRebalancing(true);
    try {
      const { rebalancingService } = await import('@/services/api/rebalancingService');
      const result = await rebalancingService.executeRebalancing(rebalancingPlan);
      
      toast.success('Rebalancing initiated successfully', {
        position: 'top-right',
        autoClose: 4000
      });
      
      setShowRebalancingModal(false);
      setRebalancingPlan(null);
      
      // Refresh data
      loadPortfolioData();
      loadRebalancingAlerts();
      
    } catch (error) {
      toast.error('Failed to execute rebalancing');
    } finally {
      setIsExecutingRebalancing(false);
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      const { rebalancingService } = await import('@/services/api/rebalancingService');
      await rebalancingService.dismissAlert(alertId);
      setRebalancingAlerts(alerts => alerts.filter(a => a.Id !== alertId));
      toast.info('Alert dismissed');
    } catch (error) {
      toast.error('Failed to dismiss alert');
    }
  };

  const getDriftColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getDriftIcon = (severity) => {
    switch (severity) {
      case 'high': return 'AlertTriangle';
      case 'medium': return 'AlertCircle';
      default: return 'CheckCircle';
    }
  };
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
          <PerformanceChart data={performanceMetrics} />
        </CardContent>
      </Card>

      {/* Rebalancing Alerts */}
      <RebalancingAlerts
        alerts={rebalancingAlerts}
        driftAnalysis={driftAnalysis}
        onStartRebalancing={handleStartRebalancing}
        onDismissAlert={handleDismissAlert}
      />

      {/* Portfolio Charts and Holdings */}
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
      
{/* AI Recommendations Section */}
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <ApperIcon name="Brain" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-1">
                AI Portfolio Recommendations
              </h3>
              <p className="text-sm text-slate-600">
                Personalized suggestions based on your risk profile and goals
              </p>
            </div>
          </div>
          <Button
            onClick={handleRefreshRecommendations}
            variant="outline"
            disabled={recommendationsLoading}
            className="flex items-center space-x-2 text-sm"
          >
            <ApperIcon 
              name="RefreshCw" 
              size={14} 
              className={recommendationsLoading ? "animate-spin" : ""} 
            />
            <span>Refresh</span>
          </Button>
        </div>

        {recommendationsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-3 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-3"></div>
              <p className="text-slate-600">Analyzing your portfolio...</p>
            </div>
          </div>
        ) : recommendations ? (
          <div className="space-y-6">
            {/* Asset Allocation Recommendations */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                <ApperIcon name="PieChart" size={18} className="text-purple-600" />
                <span>Recommended Asset Allocation</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(recommendations.targetAllocation).map(([asset, percentage]) => (
                  <div key={asset} className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{percentage}%</div>
                    <div className="text-sm font-medium text-slate-700 capitalize mb-1">
                      {asset.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-xs text-slate-500">
</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="TrendingUp" size={16} className="text-purple-600" />
                  <span className="text-sm font-medium text-slate-700">Confidence Score</span>
                </div>
                <div className="text-lg font-bold text-purple-600">{recommendations.confidence}%</div>
              </div>
            </div>

            {/* Rebalancing Actions */}
            {recommendations.rebalancingActions.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                  <ApperIcon name="ArrowRightLeft" size={18} className="text-blue-600" />
                  <span>Suggested Rebalancing Actions</span>
                </h4>
                <div className="space-y-3">
                  {recommendations.rebalancingActions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          action.priority === 'high' ? 'bg-red-100 text-red-600' :
                          action.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <ApperIcon 
                            name={action.action === 'increase' ? 'TrendingUp' : 'TrendingDown'} 
                            size={14} 
                          />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {action.action === 'increase' ? 'Increase' : 'Decrease'} {action.asset}
                          </p>
                          <p className="text-sm text-slate-600">
                            {action.currentPercentage}% → {action.targetPercentage}% 
                            ({action.action === 'increase' ? '+' : '-'}{action.changePercentage.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900">
                          ${action.dollarAmount.toLocaleString()}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          action.priority === 'high' ? 'bg-red-100 text-red-700' :
                          action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {action.priority} priority
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explanations */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                <ApperIcon name="MessageCircle" size={18} className="text-green-600" />
                <span>Why These Recommendations?</span>
              </h4>
              <div className="space-y-4">
                {recommendations.explanations.map((explanation, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <h5 className="font-semibold text-slate-900 mb-1">{explanation.title}</h5>
                    <p className="text-slate-700 mb-2">{explanation.description}</p>
                    <p className="text-sm text-slate-600 italic">{explanation.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Impact */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                <ApperIcon name="Target" size={18} className="text-indigo-600" />
                <span>Expected Impact</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-lg font-bold text-indigo-600 mb-1">
                    {recommendations.estimatedImpact.potentialAnnualReturn}
                  </div>
                  <div className="text-sm text-slate-600">Expected Annual Return</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600 mb-1">
                    {recommendations.estimatedImpact.riskReduction}
                  </div>
                  <div className="text-sm text-slate-600">Risk Level</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600 mb-1">
                    ${recommendations.estimatedImpact.rebalanceAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">Total Rebalance</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600 mb-1">
                    {recommendations.estimatedImpact.timeToImplement}
                  </div>
                  <div className="text-sm text-slate-600">Implementation Time</div>
                </div>
              </div>
            </div>

            {/* One-Tap Accept Button */}
            {recommendations.rebalancingActions.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-1">
                      Ready to optimize your portfolio?
                    </h4>
                    <p className="text-slate-600 text-sm">
                      Apply all recommendations with one click. Changes will take effect within {recommendations.estimatedImpact.timeToImplement}.
                    </p>
                  </div>
                  <Button
                    onClick={handleApplyRecommendations}
                    disabled={applyingRecommendations}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 flex items-center space-x-2 min-w-[160px]"
                  >
                    {applyingRecommendations ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Applying...</span>
                      </>
                    ) : (
                      <>
                        <ApperIcon name="CheckCircle" size={18} />
                        <span>Apply All</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ApperIcon name="AlertCircle" size={24} className="text-slate-500" />
            </div>
            <p className="text-slate-600 mb-2">No recommendations available</p>
            <p className="text-sm text-slate-500">
              Complete a risk assessment to get personalized recommendations
            </p>
          </div>
        )}
</div>

      {/* Rebalancing Modal */}
      <RebalancingModal
        isOpen={showRebalancingModal}
        onClose={() => setShowRebalancingModal(false)}
        plan={rebalancingPlan}
        onExecute={handleExecuteRebalancing}
        isExecuting={isExecutingRebalancing}
      />
    </div>
  );
};

export default Portfolio;