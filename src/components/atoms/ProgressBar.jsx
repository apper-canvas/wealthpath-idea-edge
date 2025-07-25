import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const ProgressBar = forwardRef(({ 
  className, 
  value = 0, 
  max = 100, 
  variant = "primary",
  showPercentage = true,
  label,
  ...props 
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-500 to-primary-600",
    success: "bg-gradient-to-r from-success-500 to-success-600",
    warning: "bg-gradient-to-r from-warning-500 to-warning-600",
  };
  
  return (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-semibold text-slate-600">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out shadow-sm",
            variants[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = "ProgressBar";

export default ProgressBar;