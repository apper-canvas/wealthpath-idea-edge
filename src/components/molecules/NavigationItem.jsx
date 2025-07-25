import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const NavigationItem = ({ to, icon, label, className }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
          isActive
            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg border-l-4 border-primary-300"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:shadow-sm",
          className
        )
      }
    >
      {({ isActive }) => (
        <>
          <ApperIcon 
            name={icon} 
            className={cn(
              "h-5 w-5 transition-all duration-200",
              isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700"
            )} 
          />
          <span className="font-medium">{label}</span>
        </>
      )}
    </NavLink>
  );
};

export default NavigationItem;