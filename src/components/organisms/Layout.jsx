import { useState } from "react";
import Header from "@/components/organisms/Header";
import Sidebar from "@/components/organisms/Sidebar";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };
  
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={handleMenuToggle} />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;