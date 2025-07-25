const Loading = ({ className }) => {
  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-20 skeleton"></div>
              <div className="h-8 w-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg skeleton"></div>
            </div>
            <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-24 mb-2 skeleton"></div>
            <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-16 skeleton"></div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-32 mb-4 skeleton"></div>
          <div className="h-64 bg-gradient-to-r from-slate-200 to-slate-300 rounded skeleton"></div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-24 mb-4 skeleton"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-4 w-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded skeleton"></div>
                <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded flex-1 skeleton"></div>
                <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-16 skeleton"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;