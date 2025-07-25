import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { sipService } from "@/services/api/sipService";
import SipCalendar from "@/components/molecules/SipCalendar";
import SipSummary from "@/components/molecules/SipSummary";
import SipModal from "@/components/molecules/SipModal";
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
  const [sips, setSips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("goals");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSipModal, setShowSipModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedSip, setSelectedSip] = useState(null);
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

  const loadSips = async () => {
    try {
      const data = await sipService.getAll();
      setSips(data);
    } catch (err) {
      console.error("Failed to load SIPs:", err);
    }
  };
  
  useEffect(() => {
    loadGoals();
    loadSips();
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

  const handleCreateSip = async (sipData) => {
    try {
      const newSip = await sipService.create(sipData);
      setSips(prev => [...prev, newSip]);
      setShowSipModal(false);
      setSelectedSip(null);
      toast.success("SIP created successfully!");
    } catch (err) {
      toast.error("Failed to create SIP. Please try again.");
    }
  };

  const handleEditSip = async (sipData) => {
    try {
      const updatedSip = await sipService.update(selectedSip.Id, sipData);
      setSips(prev => prev.map(sip => 
        sip.Id === selectedSip.Id ? updatedSip : sip
      ));
      setShowSipModal(false);
      setSelectedSip(null);
      toast.success("SIP updated successfully!");
    } catch (err) {
      toast.error("Failed to update SIP. Please try again.");
    }
  };

  const handleToggleSipStatus = async (sipId) => {
    try {
      const updatedSip = await sipService.toggleStatus(sipId);
      setSips(prev => prev.map(sip => 
        sip.Id === sipId ? updatedSip : sip
      ));
      toast.success(`SIP ${updatedSip.status === 'active' ? 'activated' : 'paused'} successfully!`);
    } catch (err) {
      toast.error("Failed to update SIP status. Please try again.");
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

  const openSipModal = (sip = null) => {
    setSelectedSip(sip);
    setShowSipModal(true);
  };
  
if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadGoals} />;

  const stats = getFilterStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Goals & SIP</h1>
          <p className="text-slate-600 mt-1">Track your progress and automate investments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" size={16} />
            Add Goal
          </Button>
          <Button
            onClick={() => openSipModal()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ApperIcon name="Calendar" size={16} />
            Setup SIP
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("goals")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "goals"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <ApperIcon name="Target" size={16} />
              Goals ({goals.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("sips")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "sips"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <ApperIcon name="Calendar" size={16} />
              SIP Calendar
            </div>
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "summary"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <ApperIcon name="BarChart3" size={16} />
              SIP Summary
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "goals" && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <ApperIcon name="Target" className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Goals</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalGoals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-success-100 rounded-lg">
                    <ApperIcon name="CheckCircle" className="h-5 w-5 text-success-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Completed</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.completedGoals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-warning-100 rounded-lg">
                    <ApperIcon name="DollarSign" className="h-5 w-5 text-warning-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Target Amount</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalTarget)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ApperIcon name="TrendingUp" className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Current Amount</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalCurrent)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Bar */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === category
                        ? "bg-primary-100 text-primary-700 border border-primary-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                    }`}
                  >
                    {category === "all" ? "All Categories" : category}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goals Grid */}
          {filteredGoals.length === 0 ? (
            <Empty 
              message="No goals found"
              description={filter === "all" ? "Create your first financial goal to get started." : `No goals found in ${filter} category.`}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.Id}
                  goal={goal}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "sips" && (
        <SipCalendar 
          sips={sips} 
          goals={goals} 
          onCreateSip={() => openSipModal()}
          onEditSip={openSipModal}
          onToggleStatus={handleToggleSipStatus}
        />
      )}

      {activeTab === "summary" && (
        <SipSummary 
          sips={sips} 
          goals={goals} 
          onCreateSip={() => openSipModal()}
onEditSip={openSipModal}
          onToggleStatus={handleToggleSipStatus}
        />
      )}
      {/* Modals */}
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

      {/* SIP Modal */}
      {showSipModal && (
        <SipModal
          isOpen={showSipModal}
          onClose={() => {
            setShowSipModal(false);
            setSelectedSip(null);
          }}
          onSubmit={selectedSip ? handleEditSip : handleCreateSip}
          title={selectedSip ? "Edit SIP" : "Setup New SIP"}
          initialData={selectedSip}
          goals={goals}
        />
      )}
    </div>
  );
};

const GoalModal = ({ isOpen, onClose, onSubmit, title, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    targetAmount: initialData?.targetAmount || "",
    currentAmount: initialData?.currentAmount || "",
    targetDate: initialData?.targetDate || "",
    category: initialData?.category || "Investment",
  });

  const [loading, setLoading] = useState(false);

  const categories = [
    { value: "Retirement", label: "Retirement", icon: "PiggyBank" },
    { value: "Emergency Fund", label: "Emergency Fund", icon: "Shield" },
    { value: "Home Purchase", label: "Home Purchase", icon: "Home" },
    { value: "Education", label: "Education", icon: "GraduationCap" },
    { value: "Travel", label: "Travel", icon: "Plane" },
    { value: "Investment", label: "Investment", icon: "TrendingUp" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit({
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ApperIcon name="X" className="h-5 w-5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Goal Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Emergency Fund"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.category === category.value
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <ApperIcon name={category.icon} size={16} />
                      <span className="text-xs font-medium">{category.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Amount
              </label>
              <input
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Amount
              </label>
              <input
                type="number"
                value={formData.currentAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Date
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

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
                disabled={loading}
              >
                {loading ? "Saving..." : (initialData ? "Update Goal" : "Create Goal")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, goalName }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-error-100 rounded-lg">
                <ApperIcon name="AlertTriangle" className="h-5 w-5 text-error-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Delete Goal</h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete "{goalName}"? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="error"
                onClick={handleConfirm}
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Goal"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Goals;