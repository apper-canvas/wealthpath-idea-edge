import React from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import ProgressBar from "@/components/atoms/ProgressBar";
import { formatCurrency, formatDate } from "@/utils/formatters";

const GoalCard = ({ goal, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  
  const getCategoryIcon = (category) => {
    const iconMap = {
      "Retirement": "PiggyBank",
      "Emergency Fund": "Shield",
      "Home Purchase": "Home",
      "Education": "GraduationCap",
      "Travel": "Plane",
      "Investment": "TrendingUp"
    };
    return iconMap[category] || "Target";
  };
  
  const getCategoryGradient = (category) => {
    const gradientMap = {
      "Retirement": "from-purple-500 to-pink-600",
      "Emergency Fund": "from-red-500 to-orange-600",
      "Home Purchase": "from-green-500 to-emerald-600",
      "Education": "from-blue-500 to-indigo-600",
      "Travel": "from-yellow-500 to-orange-600",
      "Investment": "from-emerald-500 to-teal-600"
    };
    return gradientMap[category] || "from-slate-500 to-slate-600";
  };
  
  return (
<Card className="group hover:shadow-2xl transition-all duration-300 relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-slate-900">
              {goal.name}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">Target:</span>
              <span className="text-sm font-medium text-slate-700">
                {formatDate(goal.targetDate)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${getCategoryGradient(goal.category)} shadow-lg`}>
              <ApperIcon name={getCategoryIcon(goal.category)} className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

{/* Action Buttons - Hidden by default, shown on hover */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1 bg-white rounded-lg shadow-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/goals/${goal.Id}`)}
            className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
            title="View details"
          >
            <ApperIcon name="Eye" className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
            title="Edit goal"
          >
            <ApperIcon name="Edit" className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
            title="Delete goal"
          >
            <ApperIcon name="Trash2" className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Progress</span>
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
        
        {remainingAmount > 0 && (
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg">
            <span className="text-sm text-slate-600">Remaining</span>
            <span className="text-sm font-semibold text-slate-900 currency-display">
              {formatCurrency(remainingAmount)}
            </span>
          </div>
        )}
        
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <ApperIcon name="Tag" className="h-3 w-3" />
          <span>{goal.category}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalCard;