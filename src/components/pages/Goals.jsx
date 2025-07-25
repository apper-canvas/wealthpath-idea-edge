import { useState, useEffect } from "react";
import GoalCard from "@/components/molecules/GoalCard";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { goalsService } from "@/services/api/goalsService";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  
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
          <Button variant="primary" className="inline-flex items-center space-x-2">
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
          icon="Target"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.Id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Goals;