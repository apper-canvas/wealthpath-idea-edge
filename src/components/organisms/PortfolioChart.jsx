import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { portfolioService } from "@/services/api/portfolioService";

const PortfolioChart = () => {
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const loadAllocation = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await portfolioService.getAllocation();
      setAllocation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadAllocation();
  }, []);
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadAllocation} />;
  if (!allocation) return null;
  
  const chartOptions = {
    chart: {
      type: "donut",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
    labels: ["Stocks", "Bonds", "Cash", "Other"],
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "16px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              color: "#1e293b",
            },
            value: {
              show: true,
              fontSize: "24px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              color: "#0f172a",
              formatter: (val) => `${val}%`,
            },
            total: {
              show: true,
              showAlways: true,
              label: "Total Portfolio",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              color: "#64748b",
              formatter: () => "100%",
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0,
    },
    tooltip: {
      style: {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
      },
      y: {
        formatter: (val) => `${val}%`,
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };
  
  const series = [
    allocation.stocks,
    allocation.bonds,
    allocation.cash,
    allocation.other,
  ];
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Asset Allocation</span>
          <div className="w-2 h-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Chart
            options={chartOptions}
            series={series}
            type="donut"
            height="100%"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          {[
            { label: "Stocks", value: allocation.stocks, color: "bg-blue-500" },
            { label: "Bonds", value: allocation.bonds, color: "bg-green-500" },
            { label: "Cash", value: allocation.cash, color: "bg-yellow-500" },
            { label: "Other", value: allocation.other, color: "bg-purple-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${color} shadow-sm`}></div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  <span className="text-sm font-semibold text-slate-900">{value}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioChart;