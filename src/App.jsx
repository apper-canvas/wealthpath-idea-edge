import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import GoalDetail from "./components/pages/GoalDetail";
import "@/index.css";
import Layout from "@/components/organisms/Layout";
import RiskAssessment from "@/components/pages/RiskAssessment";
import Portfolio from "@/components/pages/Portfolio";
import MarketNews from "@/components/pages/MarketNews";
import Dashboard from "@/components/pages/Dashboard";
import Goals from "@/components/pages/Goals";
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/goals/:id" element={<GoalDetail />} />
            <Route path="/news" element={<MarketNews />} />
            <Route path="/risk-assessment" element={<RiskAssessment />} />
</Routes>
        </Layout>
        <ToastContainer 
          position="top-right"
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="z-50"
        />
</div>
    </BrowserRouter>
  );
}

export default App;