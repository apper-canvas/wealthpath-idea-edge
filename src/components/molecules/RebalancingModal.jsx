import React, { useState } from "react";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import ApperIcon from "@/components/ApperIcon";
import Portfolio from "@/components/pages/Portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const RebalancingModal = ({ 
  isOpen, 
  onClose, 
  plan, 
  onExecute, 
  isExecuting = false 
}) => {
  const [step, setStep] = useState(1);

  if (!isOpen || !plan) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return 'AlertTriangle';
      case 'medium': return 'AlertCircle';
      case 'low': return 'Info';
      default: return 'Circle';
    }
  };

  const getActionIcon = (action) => {
    return action === 'buy' ? 'TrendingUp' : 'TrendingDown';
  };

  const getActionColor = (action) => {
    return action === 'buy' ? 'text-green-600' : 'text-red-600';
const getActionColor = (action) => {
    return action === 'buy' ? 'text-green-600' : 'text-red-600';
  };

  const getDriftIcon = (severity) => {
    switch (severity) {
      case 'high': return 'AlertTriangle';
      case 'medium': return 'AlertCircle';
      case 'low': return 'Info';
      default: return 'Circle';
    }
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ApperIcon name="Scale" className="h-5 w-5 text-primary-600" />
              <span>Portfolio Rebalancing Plan</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isExecuting}
            >
              <ApperIcon name="X" className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {!plan.needsRebalancing ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <ApperIcon name="CheckCircle" className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Portfolio is Well Balanced
              </h3>
              <p className="text-slate-600">
                Your portfolio is currently within target allocation ranges.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step Navigation */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                  step === 1 ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>Review Plan</span>
                </div>
                <div className="w-8 h-px bg-slate-200"></div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                  step === 2 ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span>Confirm</span>
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-6">
                  {/* Analysis Summary */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-3">Analysis Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">
                          {plan.analysis.assets.filter(a => a.needsAction).length}
                        </div>
                        <div className="text-sm text-slate-600">Assets to Rebalance</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">
                          {plan.analysis.overallDrift.toFixed(1)}%
                        </div>
                        <div className="text-sm text-slate-600">Average Drift</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">
                          {formatCurrency(plan.estimatedCosts.total)}
                        </div>
                        <div className="text-sm text-slate-600">Est. Costs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">
                          {plan.timeframe}
                        </div>
                        <div className="text-sm text-slate-600">Timeframe</div>
                      </div>
                    </div>
                  </div>

                  {/* Asset Analysis */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Asset Allocation Analysis</h4>
                    <div className="space-y-3">
                      {plan.analysis.assets.map((asset, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${
                          asset.needsAction ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <ApperIcon 
                                name={getDriftIcon(asset.severity)} 
                                className={`h-5 w-5 ${
                                  asset.severity === 'high' ? 'text-red-600' : 
                                  asset.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                                }`} 
                              />
                              <div>
                                <div className="font-medium text-slate-900 capitalize">
                                  {asset.asset}
                                </div>
                                <div className="text-sm text-slate-600">
                                  Current: {asset.current}% | Target: {asset.target}%
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-medium ${
                                asset.drift > plan.analysis.driftThreshold ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {asset.drift.toFixed(1)}% drift
                              </div>
                              {asset.needsAction && (
                                <div className="text-sm text-slate-600">
                                  {formatCurrency(asset.recommendedAmount)} to {asset.recommendedAction}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Transactions */}
                  {plan.transactions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Recommended Transactions</h4>
                      <div className="space-y-2">
                        {plan.transactions.map((transaction, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded ${getPriorityColor(transaction.priority)}`}>
                                <ApperIcon name={getPriorityIcon(transaction.priority)} className="h-4 w-4" />
                              </div>
                              <div>
                                <div className={`font-medium ${getActionColor(transaction.action)}`}>
                                  {transaction.action === 'buy' ? 'Buy' : 'Sell'} {transaction.asset}
                                </div>
                                <div className="text-sm text-slate-600">
                                  {transaction.description}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-slate-900">
                                {formatCurrency(transaction.amount)}
                              </div>
                              <div className="text-sm text-slate-600">
                                Fee: {formatCurrency(transaction.estimatedFee)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center py-6">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <ApperIcon name="AlertCircle" className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Confirm Rebalancing
                    </h3>
                    <p className="text-slate-600 mb-6">
                      Please review the summary below and confirm to proceed with rebalancing.
                    </p>

                    <div className="bg-slate-50 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Total Transactions:</span>
                          <span className="font-semibold text-slate-900 ml-2">
                            {plan.transactions.length}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Estimated Costs:</span>
                          <span className="font-semibold text-slate-900 ml-2">
                            {formatCurrency(plan.estimatedCosts.total)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Settlement Time:</span>
                          <span className="font-semibold text-slate-900 ml-2">
                            {plan.timeframe}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Risk Level:</span>
                          <span className={`font-semibold ml-2 ${
                            plan.analysis.riskLevel === 'high' ? 'text-red-600' :
                            plan.analysis.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {plan.analysis.riskLevel.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={isExecuting}
                >
                  Cancel
                </Button>
                
                <div className="flex items-center space-x-3">
                  {step === 2 && (
                    <Button
                      variant="secondary"
                      onClick={() => setStep(1)}
                      disabled={isExecuting}
                    >
                      <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  )}
                  
                  {step === 1 ? (
                    <Button
                      variant="primary"
                      onClick={() => setStep(2)}
                    >
                      Continue
                      <ApperIcon name="ArrowRight" className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      onClick={onExecute}
                      disabled={isExecuting}
                    >
                      {isExecuting ? (
                        <>
                          <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <ApperIcon name="Play" className="h-4 w-4 mr-2" />
                          Execute Rebalancing
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RebalancingModal;