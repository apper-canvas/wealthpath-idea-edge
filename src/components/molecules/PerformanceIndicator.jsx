import ApperIcon from "@/components/ApperIcon";
import { formatCurrency, formatPercentage, getChangeColor, getChangeIcon } from "@/utils/formatters";

const PerformanceIndicator = ({ value, percentage, label, size = "sm" }) => {
  const changeColor = getChangeColor(value);
  const changeIcon = getChangeIcon(value);
  
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };
  
  return (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center space-x-1 ${changeColor}`}>
        <ApperIcon name={changeIcon} className="h-4 w-4" />
        <span className={`font-semibold ${sizes[size]} currency-display`}>
          {value > 0 ? "+" : ""}{formatCurrency(value, { compact: true })}
        </span>
        {percentage !== undefined && (
          <span className={`${sizes[size]} font-medium`}>
            ({value > 0 ? "+" : ""}{formatPercentage(percentage, { showSign: false })})
          </span>
        )}
      </div>
      {label && (
        <span className="text-slate-500 text-sm">{label}</span>
      )}
    </div>
  );
};

export default PerformanceIndicator;