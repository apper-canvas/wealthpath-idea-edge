import React, { useMemo } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { formatCurrency } from "@/utils/formatters";

const SipSummary = ({ sips, goals, onCreateSip, onEditSip, onToggleStatus }) => {
  const stats = useMemo(() => {
    const activeSips = sips.filter(sip => sip.status === 'active');
    const pausedSips = sips.filter(sip => sip.status === 'paused');
    
    const monthlyCommitment = activeSips.reduce((total, sip) => {
      if (sip.frequency === 'monthly') return total + sip.amount;
      if (sip.frequency === 'weekly') return total + (sip.amount * 4.33);
      if (sip.frequency === 'daily') return total + (sip.amount * 30);
      return total;
    }, 0);

    const yearlyCommitment = monthlyCommitment * 12;

    const goalCoverage = goals.map(goal => {
      const goalSips = activeSips.filter(sip => sip.goalId === goal.Id);
      const monthlyAmount = goalSips.reduce((total, sip) => {
        if (sip.frequency === 'monthly') return total + sip.amount;
        if (sip.frequency === 'weekly') return total + (sip.amount * 4.33);
        if (sip.frequency === 'daily') return total + (sip.amount * 30);
        return total;
      }, 0);
      
      return {
        ...goal,
        monthlyAmount,
        sipCount: goalSips.length
      };
    }).filter(goal => goal.sipCount > 0);

    return {
      totalSips: sips.length,
      activeSips: activeSips.length,
      pausedSips: pausedSips.length,
      monthlyCommitment,
      yearlyCommitment,
      goalCoverage
    };
  }, [sips, goals]);

  const getGoalById = (goalId) => {
    return goals.find(goal => goal.Id === goalId);
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Retirement': 'PiggyBank',
      'Emergency Fund': 'Shield',
      'Home Purchase': 'Home',
      'Education': 'GraduationCap',
      'Travel': 'Plane',
      'Investment': 'TrendingUp'
    };
    return iconMap[category] || 'Target';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <ApperIcon name="Calendar" className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total SIPs</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalSips}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <ApperIcon name="Play" className="h-5 w-5 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Active SIPs</p>
                <p className="text-2xl font-bold text-slate-900">{stats.activeSips}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <ApperIcon name="Pause" className="h-5 w-5 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Paused SIPs</p>
                <p className="text-2xl font-bold text-slate-900">{stats.pausedSips}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ApperIcon name="DollarSign" className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Monthly Commitment</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.monthlyCommitment)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goal Coverage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ApperIcon name="Target" size={20} />
              Goal Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.goalCoverage.length > 0 ? (
              <div className="space-y-4">
                {stats.goalCoverage.map(goal => (
                  <div key={goal.Id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <ApperIcon name={getCategoryIcon(goal.category)} size={16} className="text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{goal.name}</div>
                          <div className="text-sm text-slate-500">{goal.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900">
                          {formatCurrency(goal.monthlyAmount)}/mo
                        </div>
                        <div className="text-sm text-slate-500">
                          {goal.sipCount} SIP{goal.sipCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex justify-between text-sm text-slate-600 mb-1">
                        <span>Progress</span>
                        <span>{((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-slate-600 mt-1">
                        <span>{formatCurrency(goal.currentAmount)}</span>
                        <span>{formatCurrency(goal.targetAmount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <ApperIcon name="Target" size={48} className="mx-auto mb-4 text-slate-300" />
                <p>No goals have SIP investments yet</p>
                <Button
                  onClick={onCreateSip}
                  className="mt-4"
                  size="sm"
                >
                  Setup Your First SIP
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All SIPs List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ApperIcon name="List" size={20} />
                All SIPs
              </CardTitle>
              <Button onClick={onCreateSip} size="sm">
                <ApperIcon name="Plus" size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sips.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sips.map(sip => {
                  const goal = getGoalById(sip.goalId);
                  return (
                    <div key={sip.Id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          sip.status === 'active' ? 'bg-success-500' : 'bg-warning-500'
                        }`}></div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {goal?.name || 'Unknown Goal'}
                          </div>
                          <div className="text-sm text-slate-500">
                            {formatCurrency(sip.amount)} • {sip.frequency}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditSip(sip)}
                          className="p-2 text-slate-500 hover:text-primary-600 rounded-lg hover:bg-white"
                        >
                          <ApperIcon name="Edit2" size={14} />
                        </button>
                        <button
                          onClick={() => onToggleStatus(sip.Id)}
                          className={`p-2 rounded-lg hover:bg-white ${
                            sip.status === 'active' 
                              ? 'text-slate-500 hover:text-warning-600' 
                              : 'text-slate-500 hover:text-success-600'
                          }`}
                        >
                          <ApperIcon name={sip.status === 'active' ? 'Pause' : 'Play'} size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <ApperIcon name="Calendar" size={48} className="mx-auto mb-4 text-slate-300" />
                <p>No SIPs configured yet</p>
                <Button
                  onClick={onCreateSip}
                  className="mt-4"
                  size="sm"
                >
                  Setup Your First SIP
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Commitment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ApperIcon name="BarChart3" size={20} />
            Investment Commitment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {formatCurrency(stats.monthlyCommitment)}
              </div>
              <div className="text-sm text-slate-600">Monthly Commitment</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-r from-success-50 to-emerald-50 rounded-xl">
              <div className="text-3xl font-bold text-success-600 mb-2">
                {formatCurrency(stats.yearlyCommitment)}
              </div>
              <div className="text-sm text-slate-600">Yearly Commitment</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.goalCoverage.length}
              </div>
              <div className="text-sm text-slate-600">Goals with SIPs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SipSummary;