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