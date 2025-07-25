import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ message = "Something went wrong", onRetry, className }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 ${className}`}>
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-error-500 to-error-600 rounded-full flex items-center justify-center shadow-lg">
            <ApperIcon name="AlertCircle" className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Oops! Something went wrong
        </h3>
        
        <p className="text-slate-600 mb-6 leading-relaxed">
          {message}. Please try again or contact support if the problem persists.
        </p>
        
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="primary"
            className="inline-flex items-center space-x-2"
          >
            <ApperIcon name="RefreshCw" className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Error;