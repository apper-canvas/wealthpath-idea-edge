export const formatCurrency = (amount, options = {}) => {
  const { showCents = false, compact = false } = options;
  
  if (compact && Math.abs(amount) >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  
  if (compact && Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);
};

export const formatPercentage = (value, options = {}) => {
  const { showSign = false, decimals = 1 } = options;
  const formatted = `${value.toFixed(decimals)}%`;
  
  if (showSign && value > 0) {
    return `+${formatted}`;
  }
  
  return formatted;
};

export const formatAnnualizedReturn = (value, options = {}) => {
  const { showSign = true, decimals = 2 } = options;
  const formatted = `${Math.abs(value).toFixed(decimals)}%`;
  
  if (showSign) {
    return value >= 0 ? `+${formatted}` : `-${formatted}`;
  }
  
  return formatted;
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

export const getChangeColor = (value) => {
  if (value > 0) return "text-success-600";
  if (value < 0) return "text-error-600";
  return "text-slate-600";
};

export const getChangeIcon = (value) => {
  if (value > 0) return "TrendingUp";
  if (value < 0) return "TrendingDown";
  return "Minus";
};

// Goal tracking utilities
export const calculateMonthsRemaining = (targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target - now;
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
  return Math.max(0, diffMonths);
};

export const calculateRequiredMonthlyContribution = (targetAmount, currentAmount, targetDate) => {
  const monthsRemaining = calculateMonthsRemaining(targetDate);
  if (monthsRemaining <= 0) return 0;
  const remainingAmount = targetAmount - currentAmount;
  return Math.max(0, remainingAmount / monthsRemaining);
};

export const calculateProjectedCompletionDate = (targetAmount, currentAmount, monthlyContribution) => {
  if (monthlyContribution <= 0) return null;
  const remainingAmount = targetAmount - currentAmount;
  if (remainingAmount <= 0) return new Date();
  const monthsNeeded = Math.ceil(remainingAmount / monthlyContribution);
  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + monthsNeeded);
  return completionDate;
};

export const generateProjectionData = (goal, monthlyContribution = 0) => {
  const data = [];
  const startDate = new Date();
  const targetDate = new Date(goal.targetDate);
  const monthsToTarget = calculateMonthsRemaining(goal.targetDate);
  
  let currentAmount = goal.currentAmount;
  
  for (let i = 0; i <= monthsToTarget; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    
    data.push({
      date: date.toISOString().slice(0, 7), // YYYY-MM format
      amount: Math.min(currentAmount, goal.targetAmount),
      projected: i > 0
    });
    
    currentAmount += monthlyContribution;
  }
  
  return data;
};

export const calculateMilestones = (goal) => {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const milestones = [
    { percentage: 25, title: "Quarter Way There!", icon: "Target", achieved: progress >= 25 },
    { percentage: 50, title: "Halfway Champion!", icon: "Award", achieved: progress >= 50 },
    { percentage: 75, title: "Almost There!", icon: "TrendingUp", achieved: progress >= 75 },
    { percentage: 100, title: "Goal Achieved!", icon: "Trophy", achieved: progress >= 100 }
  ];
  
  return milestones;
};