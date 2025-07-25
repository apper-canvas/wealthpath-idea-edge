import { useState, useEffect } from "react";
import NavigationItem from "@/components/molecules/NavigationItem";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
  
const navigation = [
{ to: "/", icon: "LayoutDashboard", label: "Dashboard" },
{ to: "/goals", icon: "Target", label: "Goals & SIP" },
{ to: "/portfolio", icon: "PieChart", label: "Portfolio" },
{ to: "/risk-assessment", icon: "Shield", label: "Risk Assessment" },
{ to: "/market-news", icon: "Newspaper", label: "Market News" },
];
  
  // Desktop Sidebar - Static positioning
  const DesktopSidebar = () => (
    <div className="hidden lg:block w-64 bg-white/90 backdrop-blur-sm border-r border-slate-200/60 shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg">
            <ApperIcon name="TrendingUp" className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary-900 to-primary-700 bg-clip-text text-transparent">
              WealthPath
            </h2>
            <p className="text-xs text-slate-500">Investment Planner</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => (
            <NavigationItem key={item.to} {...item} />
          ))}
        </nav>
        
        <div className="mt-12 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg">
              <ApperIcon name="Lightbulb" className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900">Investment Tip</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Diversify your portfolio across different asset classes to minimize risk and maximize returns.
          </p>
        </div>
      </div>
    </div>
  );
  
  // Mobile Sidebar - Transform overlay pattern
  const MobileSidebar = () => (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div
        className={cn(
          "lg:hidden fixed left-0 top-0 h-full w-64 bg-white/95 backdrop-blur-sm shadow-2xl z-50 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg">
                <ApperIcon name="TrendingUp" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-primary-900 to-primary-700 bg-clip-text text-transparent">
                  WealthPath
                </h2>
                <p className="text-xs text-slate-500">Investment Planner</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ApperIcon name="X" className="h-5 w-5 text-slate-600" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {navigation.map((item) => (
              <NavigationItem key={item.to} {...item} />
            ))}
          </nav>
          
          <div className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg">
                <ApperIcon name="Lightbulb" className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-900">Tip</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Regular investing helps build wealth over time through compound growth.
            </p>
          </div>
        </div>
      </div>
    </>
  );
  
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;