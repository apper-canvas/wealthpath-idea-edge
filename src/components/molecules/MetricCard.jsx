import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { formatCurrency, formatPercentage, getChangeColor, getChangeIcon } from "@/utils/formatters";

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changePercent, 
  icon, 
  type = "currency",
  gradient = "from-blue-500 to-purple-600" 
}) => {
  const changeColor = getChangeColor(change);
  const changeIconName = getChangeIcon(change);
  
  const formatValue = () => {
    switch (type) {
      case "currency":
        return formatCurrency(value, { compact: true });
      case "percentage":
        return formatPercentage(value);
      default:
        return value?.toLocaleString() || "0";
    }
  };
  
  return (
    <Card className="group hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-600">
            {title}
          </CardTitle>
          {icon && (
            <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} shadow-lg`}>
              <ApperIcon name={icon} className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent currency-display`}>
            {formatValue()}
          </div>
          {(change !== undefined || changePercent !== undefined) && (
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 ${changeColor}`}>
                <ApperIcon name={changeIconName} className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {change !== undefined && formatCurrency(Math.abs(change), { compact: true })}
                  {changePercent !== undefined && ` (${formatPercentage(Math.abs(changePercent), { showSign: false })})`}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;