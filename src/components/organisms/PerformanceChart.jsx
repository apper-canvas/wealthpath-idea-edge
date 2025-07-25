import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { portfolioService } from "@/services/api/portfolioService";
import { formatCurrency, formatPercentage, formatAnnualizedReturn } from "@/utils/formatters";

const PerformanceChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [performanceData, setPerformanceData] = useState(null);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [volatilityMetrics, setVolatilityMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const periods = [
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '6M', value: '6M' },
    { label: '1Y', value: '1Y' }
  ];

  const loadPerformanceData = async (period) => {
    try {
      setError(null);
      setLoading(true);
      
      const [performance, benchmark, volatility] = await Promise.all([
        portfolioService.getHistoricalPerformance(period),
        portfolioService.getBenchmarkData(period),
        portfolioService.getVolatilityMetrics(period)
      ]);
      
      setPerformanceData(performance);
      setBenchmarkData(benchmark);
      setVolatilityMetrics(volatility);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformanceData(selectedPeriod);
  }, [selectedPeriod]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={() => loadPerformanceData(selectedPeriod)} />;
  if (!performanceData || !benchmarkData || !volatilityMetrics) return null;

  // Normalize data for percentage comparison
  const portfolioStartValue = performanceData[0].value;
  const benchmarkStartValue = benchmarkData[0].value;

  const portfolioSeries = performanceData.map(point => ({
    x: new Date(point.date).getTime(),
    y: ((point.value - portfolioStartValue) / portfolioStartValue * 100).toFixed(2)
  }));

  const benchmarkSeries = benchmarkData.map(point => ({
    x: new Date(point.date).getTime(),
    y: ((point.value - benchmarkStartValue) / benchmarkStartValue * 100).toFixed(2)
  }));

  const chartOptions = {
    chart: {
      type: 'line',
      height: 400,
      zoom: {
        enabled: true,
        type: 'x',
        autoScaleYaxis: true
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    colors: ['#3b82f6', '#10b981'],
    stroke: {
      curve: 'smooth',
      width: [3, 2],
      dashArray: [0, 5]
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          colors: '#64748b'
        }
      },
      axisBorder: {
        color: '#e2e8f0'
      },
      axisTicks: {
        color: '#e2e8f0'
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => `${value}%`,
        style: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          colors: '#64748b'
        }
      },
      axisBorder: {
        color: '#e2e8f0'
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      style: {
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px'
      },
      x: {
        format: 'MMM dd, yyyy'
      },
      y: {
        formatter: (value, { seriesIndex }) => {
          const label = seriesIndex === 0 ? 'Portfolio' : 'S&P 500';
          return `${label}: ${value}%`;
        }
      }
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      fontWeight: 500,
      markers: {
        width: 12,
        height: 12,
        radius: 6
      }
    },
    markers: {
      size: 0,
      hover: {
        size: 6
      }
    }
  };

  const series = [
    {
      name: 'Portfolio',
      data: portfolioSeries
    },
    {
      name: 'S&P 500',
      data: benchmarkSeries
    }
  ];

  const currentPortfolioReturn = performanceData[performanceData.length - 1].return;
  const currentBenchmarkReturn = benchmarkData[benchmarkData.length - 1].return;
  const outperformance = currentPortfolioReturn - currentBenchmarkReturn;

  return (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
          {periods.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "default" : "ghost"}
              size="sm"
              onClick={() => handlePeriodChange(period.value)}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                selectedPeriod === period.value
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {period.label}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-slate-600">Portfolio</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-green-500" style={{borderStyle: 'dashed'}}></div>
            <span className="text-slate-600">S&P 500</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Return</p>
                <p className={`text-lg font-bold ${currentPortfolioReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatAnnualizedReturn(currentPortfolioReturn)}
                </p>
              </div>
              <ApperIcon 
                name={currentPortfolioReturn >= 0 ? "TrendingUp" : "TrendingDown"} 
                size={20} 
                className={currentPortfolioReturn >= 0 ? 'text-green-500' : 'text-red-500'}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Annualized Return</p>
                <p className={`text-lg font-bold ${volatilityMetrics.annualizedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatAnnualizedReturn(volatilityMetrics.annualizedReturn)}
                </p>
              </div>
              <ApperIcon name="Target" size={20} className="text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Volatility</p>
                <p className="text-lg font-bold text-slate-900">
                  {formatPercentage(volatilityMetrics.volatility)}
                </p>
              </div>
              <ApperIcon name="Activity" size={20} className="text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">vs S&P 500</p>
                <p className={`text-lg font-bold ${outperformance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatAnnualizedReturn(outperformance)}
                </p>
              </div>
              <ApperIcon 
                name={outperformance >= 0 ? "Award" : "AlertTriangle"} 
                size={20} 
                className={outperformance >= 0 ? 'text-green-500' : 'text-yellow-500'}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardContent className="p-6">
          <div className="h-96">
            <Chart
              options={chartOptions}
              series={series}
              type="line"
              height="100%"
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risk Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">Sharpe Ratio</span>
              <span className="text-sm font-semibold text-slate-900">{volatilityMetrics.sharpeRatio}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">Standard Deviation</span>
              <span className="text-sm font-semibold text-slate-900">{formatPercentage(volatilityMetrics.volatility)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">Max Drawdown</span>
              <span className="text-sm font-semibold text-red-600">-8.4%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Benchmark Comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">Portfolio Return</span>
              <span className={`text-sm font-semibold ${currentPortfolioReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAnnualizedReturn(currentPortfolioReturn)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">S&P 500 Return</span>
              <span className={`text-sm font-semibold ${currentBenchmarkReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAnnualizedReturn(currentBenchmarkReturn)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-sm font-medium text-slate-700">Outperformance</span>
              <span className={`text-sm font-bold ${outperformance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAnnualizedReturn(outperformance)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceChart;