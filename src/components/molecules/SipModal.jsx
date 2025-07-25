import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { formatCurrency } from "@/utils/formatters";

const SipModal = ({ isOpen, onClose, onSubmit, title, initialData = null, goals }) => {
  const [formData, setFormData] = useState({
    goalId: initialData?.goalId || "",
    amount: initialData?.amount || "",
    frequency: initialData?.frequency || "monthly",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        goalId: initialData.goalId || "",
        amount: initialData.amount || "",
        frequency: initialData.frequency || "monthly",
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
      });
    }
  }, [initialData]);

  const frequencies = [
    { value: "daily", label: "Daily", icon: "Sun" },
    { value: "weekly", label: "Weekly", icon: "Calendar" },
    { value: "monthly", label: "Monthly", icon: "CalendarDays" },
  ];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit({
        ...formData,
        goalId: parseInt(formData.goalId),
        amount: parseFloat(formData.amount),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedGoal = goals.find(goal => goal.Id === parseInt(formData.goalId));

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <ApperIcon name="Calendar" className="h-5 w-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ApperIcon name="X" className="h-5 w-5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Goal Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Select Goal
              </label>
              <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                {goals.map((goal) => (
                  <button
                    key={goal.Id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, goalId: goal.Id.toString() }))}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.goalId === goal.Id.toString()
                        ? "border-primary-500 bg-primary-50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <ApperIcon name={getCategoryIcon(goal.category)} size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{goal.name}</div>
                        <div className="text-sm text-slate-500">{goal.category}</div>
                        <div className="text-sm text-slate-600 mt-1">
                          Target: {formatCurrency(goal.targetAmount)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Investment Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500">$</span>
                </div>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Investment Frequency
              </label>
              <div className="grid grid-cols-3 gap-3">
                {frequencies.map((freq) => (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, frequency: freq.value }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.frequency === freq.value
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ApperIcon name={freq.icon} size={20} />
                      <span className="text-sm font-medium">{freq.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min={formData.startDate}
                />
              </div>
            </div>

            {/* Summary Preview */}
            {selectedGoal && formData.amount && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">Investment Summary</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Goal:</span>
                    <span className="font-medium">{selectedGoal.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount per {formData.frequency.slice(0, -2)}:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(formData.amount) || 0)}</span>
                  </div>
                  {formData.frequency === 'monthly' && (
                    <div className="flex justify-between">
                      <span>Monthly commitment:</span>
                      <span className="font-medium">{formatCurrency(parseFloat(formData.amount) || 0)}</span>
                    </div>
                  )}
                  {formData.frequency === 'weekly' && (
                    <div className="flex justify-between">
                      <span>Monthly commitment:</span>
                      <span className="font-medium">{formatCurrency((parseFloat(formData.amount) || 0) * 4.33)}</span>
                    </div>
                  )}
                  {formData.frequency === 'daily' && (
                    <div className="flex justify-between">
                      <span>Monthly commitment:</span>
                      <span className="font-medium">{formatCurrency((parseFloat(formData.amount) || 0) * 30)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || !formData.goalId || !formData.amount}
              >
                {loading ? "Saving..." : (initialData ? "Update SIP" : "Create SIP")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SipModal;