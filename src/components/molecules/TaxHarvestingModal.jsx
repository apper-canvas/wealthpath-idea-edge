import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { taxHarvestingService } from '@/services/api/taxHarvestingService';
import { toast } from 'react-toastify';

export default function TaxHarvestingModal({ isOpen, onClose }) {
  const [opportunities, setOpportunities] = useState([]);
  const [alternatives, setAlternatives] = useState({});
  const [selectedOpportunities, setSelectedOpportunities] = useState([]);
  const [selectedAlternatives, setSelectedAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('opportunities');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHarvestingData();
    }
  }, [isOpen]);

  const loadHarvestingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await taxHarvestingService.getHarvestingOpportunities();
      
      if (result.success) {
        setOpportunities(result.data);
        
        // Load alternatives for each opportunity
        const alternativePromises = result.data.map(async (opp) => {
          const altResult = await taxHarvestingService.getAlternativeInvestments(opp.symbol);
          return { symbol: opp.symbol, alternatives: altResult.success ? altResult.data : [] };
        });
        
        const alternativeResults = await Promise.all(alternativePromises);
        const alternativesMap = {};
        alternativeResults.forEach(result => {
          alternativesMap[result.symbol] = result.alternatives;
        });
        setAlternatives(alternativesMap);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load tax harvesting data');
    } finally {
      setLoading(false);
    }
  };

  const toggleOpportunitySelection = (opportunity) => {
    setSelectedOpportunities(prev => {
      const isSelected = prev.find(opp => opp.Id === opportunity.Id);
      if (isSelected) {
        return prev.filter(opp => opp.Id !== opportunity.Id);
      } else {
        return [...prev, opportunity];
      }
    });
  };

  const toggleAlternativeSelection = (alternative, originalSymbol) => {
    const alternativeWithOriginal = { ...alternative, originalSymbol };
    setSelectedAlternatives(prev => {
      const isSelected = prev.find(alt => alt.Id === alternative.Id);
      if (isSelected) {
        return prev.filter(alt => alt.Id !== alternative.Id);
      } else {
        return [...prev, alternativeWithOriginal];
      }
    });
  };

  const handleExecuteHarvesting = () => {
    if (selectedOpportunities.length === 0) {
      toast.warning('Please select at least one opportunity to harvest');
      return;
    }
    setShowConfirmation(true);
  };

  const confirmExecution = async () => {
    setExecuting(true);
    setShowConfirmation(false);
    
    try {
      const result = await taxHarvestingService.executeTaxHarvesting(
        selectedOpportunities,
        selectedAlternatives
      );
      
      if (result.success) {
        toast.success(`Successfully executed ${result.data.summary.transactionsExecuted} transactions`);
        toast.info(`Realized tax savings: ${formatCurrency(result.data.summary.totalTaxSavings)}`);
        onClose();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error('Failed to execute tax harvesting');
    } finally {
      setExecuting(false);
    }
  };

  const getTotalSavings = () => {
    return selectedOpportunities.reduce((sum, opp) => sum + opp.taxSavings, 0);
  };

  const getPotentialColor = (potential) => {
    switch (potential) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <ApperIcon name="Calculator" size={24} className="text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Tax-Loss Harvesting</h2>
              <p className="text-sm text-gray-600">Optimize your tax efficiency</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="X" size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-8">
              <Loading />
            </div>
          ) : error ? (
            <div className="p-8">
              <Error message={error} />
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('opportunities')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'opportunities'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Opportunities ({opportunities.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('alternatives')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'alternatives'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Alternative Investments
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'opportunities' && (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Total Opportunities</p>
                              <p className="text-2xl font-bold text-gray-900">{opportunities.length}</p>
                            </div>
                            <ApperIcon name="Target" size={24} className="text-primary-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Potential Savings</p>
                              <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(opportunities.reduce((sum, opp) => sum + opp.taxSavings, 0))}
                              </p>
                            </div>
                            <ApperIcon name="DollarSign" size={24} className="text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Selected Savings</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {formatCurrency(getTotalSavings())}
                              </p>
                            </div>
                            <ApperIcon name="CheckCircle" size={24} className="text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Opportunities Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Tax-Loss Harvesting Opportunities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Select
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Position
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Loss
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Tax Savings
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Potential
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Risk
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {opportunities.map((opportunity) => (
                                <tr
                                  key={opportunity.Id}
                                  className={`hover:bg-gray-50 ${
                                    selectedOpportunities.find(opp => opp.Id === opportunity.Id)
                                      ? 'bg-blue-50'
                                      : ''
                                  }`}
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                      type="checkbox"
                                      checked={!!selectedOpportunities.find(opp => opp.Id === opportunity.Id)}
                                      onChange={() => toggleOpportunitySelection(opportunity)}
                                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {opportunity.symbol}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {opportunity.shares} shares
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-red-600 font-medium">
                                      {formatCurrency(opportunity.unrealizedLoss)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {formatPercentage(opportunity.lossPercentage)}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                    {formatCurrency(opportunity.taxSavings)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPotentialColor(opportunity.harvestingPotential)}`}>
                                      {opportunity.harvestingPotential}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`text-sm font-medium ${getRiskColor(opportunity.washSaleRisk)}`}>
                                      {opportunity.washSaleRisk}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === 'alternatives' && (
                  <div className="space-y-6">
                    {Object.entries(alternatives).map(([symbol, symbolAlternatives]) => (
                      <Card key={symbol}>
                        <CardHeader>
                          <CardTitle>Alternative Investments for {symbol}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {symbolAlternatives.map((alternative) => (
                              <div
                                key={alternative.Id}
                                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                  selectedAlternatives.find(alt => alt.Id === alternative.Id)
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => toggleAlternativeSelection(alternative, symbol)}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{alternative.symbol}</h4>
                                    <p className="text-sm text-gray-600">{alternative.name}</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={!!selectedAlternatives.find(alt => alt.Id === alternative.Id)}
                                    onChange={() => toggleAlternativeSelection(alternative, symbol)}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  />
                                </div>
                                
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Price:</span>
                                    <span className="font-medium">{formatCurrency(alternative.currentPrice)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Similarity:</span>
                                    <span className="font-medium">{alternative.similarity}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Expense Ratio:</span>
                                    <span className="font-medium">{alternative.expenseRatio}%</span>
                                  </div>
                                </div>
                                
                                <p className="text-xs text-gray-500 mt-2">{alternative.description}</p>
                                
                                {alternative.washSaleCompliant && (
                                  <div className="flex items-center mt-2 text-green-600">
                                    <ApperIcon name="CheckCircle" size={14} className="mr-1" />
                                    <span className="text-xs">Wash Sale Compliant</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedOpportunities.length > 0 && (
                <>
                  {selectedOpportunities.length} opportunities selected • 
                  Potential savings: {formatCurrency(getTotalSavings())}
                </>
              )}
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={executing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExecuteHarvesting}
                disabled={selectedOpportunities.length === 0 || executing}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {executing ? (
                  <>
                    <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
                    Executing...
                  </>
                ) : (
                  'Execute Harvesting'
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <ApperIcon name="AlertTriangle" size={24} className="text-yellow-600" />
                <h3 className="text-lg font-semibold">Confirm Tax Harvesting</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                You are about to execute tax-loss harvesting for {selectedOpportunities.length} positions
                with potential tax savings of {formatCurrency(getTotalSavings())}.
              </p>
              
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmExecution}
                  className="flex-1 bg-primary-600 hover:bg-primary-700"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}