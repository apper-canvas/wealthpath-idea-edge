import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { portfolioService } from "@/services/api/portfolioService";

const PortfolioChart = () => {
  const [allocation, setAllocation] = useState(null);
  const [detailedAllocation, setDetailedAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const loadAllocation = async () => {
    try {
      setError(null);
      setLoading(true);
      const [basicData, detailedData] = await Promise.all([
        portfolioService.getAllocation(),
        portfolioService.getDetailedAllocation()
      ]);
      setAllocation(basicData);
      setDetailedAllocation(detailedData);
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
  if (!allocation || !detailedAllocation) return null;
  
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
        
<div className="space-y-4 mt-6">
          {/* Asset Class Summary */}
          <div className="grid grid-cols-2 gap-4">
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

          {/* Top Holdings Breakdown */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Top Holdings</h4>
            <div className="space-y-2">
              {detailedAllocation.breakdown.stocks
                .sort((a, b) => b.totalValue - a.totalValue)
                .slice(0, 5)
                .map((holding) => (
                  <div key={holding.Id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-medium text-slate-700">{holding.symbol}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-900">
                      {holding.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioChart;