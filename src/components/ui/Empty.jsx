import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  message = "No data available", 
  description = "There's nothing to show here yet.", 
  actionLabel = "Get Started",
  onAction,
  icon = "Inbox",
  className 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 ${className}`}>
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
            <ApperIcon name={icon} className="h-8 w-8 text-slate-500" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {message}
        </h3>
        
        <p className="text-slate-600 mb-6 leading-relaxed">
          {description}
        </p>
        
        {onAction && (
          <Button 
            onClick={onAction}
            variant="primary"
            className="inline-flex items-center space-x-2"
          >
            <ApperIcon name="Plus" className="h-4 w-4" />
            <span>{actionLabel}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Empty;