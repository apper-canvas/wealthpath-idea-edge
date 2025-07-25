import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { formatPercentage } from '@/utils/formatters';

const RebalancingAlerts = ({ 
  alerts, 
  driftAnalysis, 
  onStartRebalancing, 
  onDismissAlert 
}) => {
  if (!alerts?.length && !driftAnalysis?.needsRebalancing) {
    return null;
  }

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return 'AlertTriangle';
      case 'warning': return 'AlertCircle';
      default: return 'Info';
    }
  };

  const getDriftSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Alerts */}
      {alerts.map((alert) => (
        <Card key={alert.Id} className={`border-l-4 ${
          alert.type === 'critical' ? 'border-l-red-500' : 
          alert.type === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getAlertColor(alert.type)}`}>
                  <ApperIcon name={getAlertIcon(alert.type)} className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{alert.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                  {alert.assets && alert.assets.length > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-slate-500">Affected assets:</span>
                      {alert.assets.map((asset, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                        >
                          {asset}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {alert.recommendedAction === 'immediate_rebalancing' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onStartRebalancing}
                  >
                    <ApperIcon name="Scale" className="h-3 w-3 mr-1" />
                    Rebalance Now
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismissAlert(alert.Id)}
                >
                  <ApperIcon name="X" className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Drift Analysis Summary */}
      {driftAnalysis && driftAnalysis.needsRebalancing && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ApperIcon name="TrendingUp" className="h-5 w-5 text-blue-600" />
                <span className="text-blue-900">Portfolio Drift Analysis</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                driftAnalysis.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                driftAnalysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {driftAnalysis.riskLevel.toUpperCase()} RISK
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">
                    {driftAnalysis.overallDrift.toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-700">Average Drift</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">
                    {driftAnalysis.assets.filter(a => a.needsAction).length}
                  </div>
                  <div className="text-sm text-blue-700">Assets Out of Balance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">
                    {driftAnalysis.driftThreshold}%
                  </div>
                  <div className="text-sm text-blue-700">Drift Threshold</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">
                    {driftAnalysis.recommendations.length}
                  </div>
                  <div className="text-sm text-blue-700">Recommendations</div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-blue-900">Asset Status:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {driftAnalysis.assets.map((asset, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 bg-white/60 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDriftSeverityColor(asset.severity)}`}>
                          {asset.asset}
                        </span>
                        <span className="text-sm text-slate-600">
                          {asset.current}% / {asset.target}%
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${
                        asset.needsAction ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {asset.drift.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                <p className="text-sm text-blue-700">
                  Portfolio rebalancing recommended to maintain target allocation
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onStartRebalancing}
                >
                  <ApperIcon name="Scale" className="h-4 w-4 mr-2" />
                  Start Rebalancing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RebalancingAlerts;