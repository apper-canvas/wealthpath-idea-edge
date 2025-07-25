import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Chart from "react-apexcharts";
import { goalsService } from "@/services/api/goalsService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import ProgressBar from "@/components/atoms/ProgressBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { 
  formatCurrency, 
  formatDate, 
  calculateMonthsRemaining,
  calculateRequiredMonthlyContribution,
  calculateProjectedCompletionDate,
  generateProjectionData,
  calculateMilestones
} from "@/utils/formatters";

const GoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [customMonthlyAmount, setCustomMonthlyAmount] = useState(0);

  useEffect(() => {
    loadGoal();
  }, [id]);

  const loadGoal = async () => {
    try {
      setLoading(true);
      const goalData = await goalsService.getById(parseInt(id));
      setGoal(goalData);
      
      // Calculate suggested monthly contribution
      const suggested = calculateRequiredMonthlyContribution(
        goalData.targetAmount,
        goalData.currentAmount,
        goalData.targetDate
      );
      setCustomMonthlyAmount(suggested);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustGoal = async (adjustmentData) => {
    try {
      const updatedGoal = await goalsService.update(goal.Id, {
        ...goal,
        ...adjustmentData
      });
      setGoal(updatedGoal);
      setShowAdjustModal(false);
      toast.success("Goal updated successfully!");
    } catch (err) {
      toast.error("Failed to update goal");
    }
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

  const getCategoryGradient = (category) => {
    const gradientMap = {
      'Retirement': 'from-purple-500 to-purple-700',
      'Emergency Fund': 'from-red-500 to-orange-600',
      'Home Purchase': 'from-green-500 to-emerald-600',
      'Education': 'from-blue-500 to-indigo-600',
      'Travel': 'from-yellow-500 to-orange-500',
      'Investment': 'from-emerald-500 to-teal-600'
    };
    return gradientMap[category] || 'from-gray-500 to-gray-700';
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!goal) return <Error message="Goal not found" />;

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
  const monthsRemaining = calculateMonthsRemaining(goal.targetDate);
  const requiredMonthly = calculateRequiredMonthlyContribution(
    goal.targetAmount,
    goal.currentAmount,
    goal.targetDate
  );
  const projectedCompletion = calculateProjectedCompletionDate(
    goal.targetAmount,
    goal.currentAmount,
    customMonthlyAmount
  );
  const milestones = calculateMilestones(goal);
  const projectionData = generateProjectionData(goal, customMonthlyAmount);

  // Chart configuration
  const chartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      background: 'transparent'
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#3b82f6', '#10b981'],
    xaxis: {
      categories: projectionData.map(d => d.date),
      labels: {
        style: { colors: '#64748b' }
      }
    },
    yaxis: {
      labels: {
        style: { colors: '#64748b' },
        formatter: (value) => formatCurrency(value)
      }
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 3
    },
    legend: {
      labels: { colors: '#64748b' }
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => formatCurrency(value)
      }
    }
  };

  const chartSeries = [
    {
      name: 'Current Progress',
      data: projectionData.filter(d => !d.projected).map(d => d.amount)
    },
    {
      name: 'Projected Growth',
      data: projectionData.map(d => d.amount)
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/goals')}
            className="p-2"
          >
            <ApperIcon name="ArrowLeft" className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${getCategoryGradient(goal.category)} shadow-lg`}>
              <ApperIcon name={getCategoryIcon(goal.category)} className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{goal.name}</h1>
              <p className="text-slate-600">{goal.category}</p>
            </div>
          </div>
        </div>
        <Button onClick={() => setShowAdjustModal(true)}>
          <ApperIcon name="Settings" className="h-4 w-4 mr-2" />
          Adjust Goal
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Current Progress</p>
                <p className="text-2xl font-bold text-slate-900">{progress.toFixed(1)}%</p>
              </div>
              <ApperIcon name="TrendingUp" className="h-8 w-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Amount Saved</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(goal.currentAmount)}</p>
              </div>
              <ApperIcon name="DollarSign" className="h-8 w-8 text-success-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Remaining</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(remainingAmount)}</p>
              </div>
              <ApperIcon name="Target" className="h-8 w-8 text-warning-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Months Left</p>
                <p className="text-2xl font-bold text-slate-900">{monthsRemaining}</p>
              </div>
              <ApperIcon name="Calendar" className="h-8 w-8 text-error-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="line"
            height={300}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Contribution Calculator */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Contribution Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Required Monthly Contribution
              </label>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(requiredMonthly)}
                </span>
                <span className="text-sm text-slate-600 ml-2">
                  to meet target on time
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Custom Monthly Amount
              </label>
              <input
                type="number"
                value={customMonthlyAmount}
                onChange={(e) => setCustomMonthlyAmount(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter custom amount"
              />
            </div>

            {projectedCompletion && (
              <div className="p-3 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-700">
                  With {formatCurrency(customMonthlyAmount)}/month, you'll reach your goal by{" "}
                  <span className="font-semibold">
                    {formatDate(projectedCompletion)}
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    milestone.achieved
                      ? 'bg-success-50 border border-success-200'
                      : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      milestone.achieved
                        ? 'bg-success-500 text-white'
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    <ApperIcon name={milestone.icon} className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      milestone.achieved ? 'text-success-700' : 'text-slate-700'
                    }`}>
                      {milestone.title}
                    </p>
                    <p className="text-sm text-slate-600">
                      {milestone.percentage}% Complete
                    </p>
                  </div>
                  {milestone.achieved && (
                    <ApperIcon name="Check" className="h-5 w-5 text-success-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goal Progress Details */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">Overall Progress</span>
              <span className="text-sm font-semibold text-slate-900">
                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
              </span>
            </div>
            <ProgressBar 
              value={goal.currentAmount} 
              max={goal.targetAmount}
              variant={progress >= 100 ? "success" : "primary"}
              showPercentage={true}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <p className="text-sm text-slate-600">Target Date</p>
              <p className="text-lg font-semibold text-slate-900">{formatDate(goal.targetDate)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Category</p>
              <p className="text-lg font-semibold text-slate-900">{goal.category}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adjust Goal Modal */}
      {showAdjustModal && (
        <AdjustGoalModal
          goal={goal}
          onClose={() => setShowAdjustModal(false)}
          onSubmit={handleAdjustGoal}
        />
      )}
    </div>
  );
};

const AdjustGoalModal = ({ goal, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    targetAmount: goal.targetAmount,
    targetDate: goal.targetDate.split('T')[0],
    currentAmount: goal.currentAmount
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Adjust Goal</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <ApperIcon name="X" className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Target Amount
              </label>
              <input
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Current Amount
              </label>
              <input
                type="number"
                value={formData.currentAmount}
                onChange={(e) => setFormData({ ...formData, currentAmount: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Update Goal
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoalDetail;