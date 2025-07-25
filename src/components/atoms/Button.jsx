import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  children, 
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:from-primary-700 hover:to-primary-800 hover:shadow-xl transform hover:scale-[1.02]",
    secondary: "bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:shadow-md transform hover:scale-[1.01]",
    success: "bg-gradient-to-r from-success-500 to-success-600 text-white shadow-lg hover:from-success-600 hover:to-success-700 hover:shadow-xl transform hover:scale-[1.02]",
    ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  
  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;