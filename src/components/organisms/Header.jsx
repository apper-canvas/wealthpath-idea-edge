import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Header = ({ onMenuToggle }) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <ApperIcon name="Menu" className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg">
              <ApperIcon name="TrendingUp" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-900 to-primary-700 bg-clip-text text-transparent">
                WealthPath
              </h1>
              <p className="text-sm text-slate-500">AI Investment Planner</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-slate-900">Welcome back</p>
            <p className="text-xs text-slate-500">Let's grow your wealth</p>
          </div>
          
          <div className="p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full">
            <ApperIcon name="User" className="h-5 w-5 text-slate-600" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;