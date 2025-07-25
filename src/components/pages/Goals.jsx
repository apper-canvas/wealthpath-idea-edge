import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { goalsService } from "@/services/api/goalsService";
import ApperIcon from "@/components/ApperIcon";
import GoalCard from "@/components/molecules/GoalCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { formatCurrency } from "@/utils/formatters";

const Goals = () => {
const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  
  const loadGoals = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await goalsService.getAll();
      setGoals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadGoals();
  }, []);
  
  const categories = ["all", "Retirement", "Emergency Fund", "Home Purchase", "Education", "Travel", "Investment"];
  
  const filteredGoals = goals.filter(goal => 
    filter === "all" || goal.category === filter
  );
  
  const getFilterStats = () => {
    const totalGoals = filteredGoals.length;
    const completedGoals = filteredGoals.filter(goal => 
      goal.currentAmount >= goal.targetAmount
    ).length;
    const totalTarget = filteredGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrent = filteredGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    
return { totalGoals, completedGoals, totalTarget, totalCurrent };
  };

  const handleCreateGoal = async (goalData) => {
    try {
      const newGoal = await goalsService.create(goalData);
      setGoals(prev => [...prev, newGoal]);
      setShowCreateModal(false);
      toast.success("Goal created successfully!");
    } catch (err) {
      toast.error("Failed to create goal. Please try again.");
    }
  };

  const handleEditGoal = async (goalData) => {
    try {
      const updatedGoal = await goalsService.update(selectedGoal.Id, goalData);
      setGoals(prev => prev.map(goal => 
        goal.Id === selectedGoal.Id ? updatedGoal : goal
      ));
      setShowEditModal(false);
      setSelectedGoal(null);
      toast.success("Goal updated successfully!");
    } catch (err) {
      toast.error("Failed to update goal. Please try again.");
    }
  };

  const handleDeleteGoal = async () => {
    try {
      await goalsService.delete(selectedGoal.Id);
      setGoals(prev => prev.filter(goal => goal.Id !== selectedGoal.Id));
      setShowDeleteModal(false);
      setSelectedGoal(null);
      toast.success("Goal deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete goal. Please try again.");
    }
  };

  const openEditModal = (goal) => {
    setSelectedGoal(goal);
    setShowEditModal(true);
  };

const openDeleteModal = (goal) => {
    setSelectedGoal(goal);
    setShowDeleteModal(true);
  };
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadGoals} />;
  
  const stats = getFilterStats();
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Investment Goals
          </h1>
          <p className="text-slate-600 mt-1">
            Track progress toward your financial objectives
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-slate-500">Total Progress</p>
            <p className="text-sm font-semibold text-slate-900">
              {stats.totalGoals > 0 ? Math.round((stats.totalCurrent / stats.totalTarget) * 100) : 0}%
            </p>
          </div>
<Button 
            variant="primary" 
            className="inline-flex items-center space-x-2"
            onClick={() => setShowCreateModal(true)}
          >
            <ApperIcon name="Plus" className="h-4 w-4" />
            <span>Add Goal</span>
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl p-6 border border-blue-100 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm">
              <ApperIcon name="Target" className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Goals</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalGoals}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-white to-green-50 rounded-xl p-6 border border-green-100 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm">
              <ApperIcon name="CheckCircle" className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Completed</p>
              <p className="text-2xl font-bold text-slate-900">{stats.completedGoals}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-white to-purple-50 rounded-xl p-6 border border-purple-100 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-sm">
              <ApperIcon name="DollarSign" className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Target</p>
              <p className="text-2xl font-bold text-slate-900 currency-display">
                ${(stats.totalTarget / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-white to-orange-50 rounded-xl p-6 border border-orange-100 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-sm">
              <ApperIcon name="TrendingUp" className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Current Total</p>
              <p className="text-2xl font-bold text-slate-900 currency-display">
                ${(stats.totalCurrent / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={filter === category ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilter(category)}
            className="capitalize"
          >
            {category === "all" ? "All Goals" : category}
          </Button>
        ))}
      </div>
      
      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
<Empty 
          message="No goals found"
          description={filter === "all" 
            ? "Start building your financial future by creating your first investment goal."
            : `No goals found in the ${filter} category. Try a different filter or create a new goal.`
          }
          actionLabel="Create Goal"
          onAction={() => setShowCreateModal(true)}
          icon="Target"
        />
      ) : (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard 
              key={goal.Id} 
              goal={goal} 
              onEdit={() => openEditModal(goal)}
              onDelete={() => openDeleteModal(goal)}
            />
          ))}
        </div>
)}

      {/* Create Goal Modal */}
      {showCreateModal && (
        <GoalModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGoal}
          title="Create New Goal"
        />
      )}

      {/* Edit Goal Modal */}
      {showEditModal && selectedGoal && (
        <GoalModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedGoal(null);
          }}
          onSubmit={handleEditGoal}
          title="Edit Goal"
          initialData={selectedGoal}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedGoal && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedGoal(null);
          }}
          onConfirm={handleDeleteGoal}
          goalName={selectedGoal.name}
        />
      )}
    </div>
  );
};

// Goal Creation/Edit Modal Component
const GoalModal = ({ isOpen, onClose, onSubmit, title, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    targetAmount: initialData?.targetAmount || "",
    targetDate: initialData?.targetDate || "",
    category: initialData?.category || "Retirement",
    currentAmount: initialData?.currentAmount || 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: "Retirement", label: "Retirement", icon: "PiggyBank" },
    { value: "Emergency Fund", label: "Emergency Fund", icon: "Shield" },
    { value: "Home Purchase", label: "Home Purchase", icon: "Home" },
    { value: "Education", label: "Education", icon: "GraduationCap" },
    { value: "Travel", label: "Travel", icon: "Plane" },
    { value: "Investment", label: "Investment", icon: "TrendingUp" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.targetAmount || !formData.targetDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900">
              {title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-slate-100"
            >
              <ApperIcon name="X" className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Goal Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Goal Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Dream Vacation Fund"
                  required
                />
              </div>

              {/* Goal Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Goal Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center space-x-2 ${
                        formData.category === category.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <ApperIcon name={category.icon} className="h-4 w-4" />
                      <span className="text-sm font-medium">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Target Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10000"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Current Amount (for editing) */}
              {initialData && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Current Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.currentAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              {/* Target Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Target Date *
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Loader2" className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    initialData ? "Update Goal" : "Create Goal"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, goalName }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ApperIcon name="Trash2" className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-slate-900">
              Delete Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete <strong>"{goalName}"</strong>? 
              This action cannot be undone and all progress will be lost.
            </p>
            
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                className="flex-1"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="Loader2" className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </div>
                ) : (
                  <>
                    <ApperIcon name="Trash2" className="h-4 w-4 mr-2" />
                    Delete Goal
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Goals;