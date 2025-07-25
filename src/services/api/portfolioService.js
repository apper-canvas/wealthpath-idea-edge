import portfolioData from "@/services/mockData/portfolio.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const portfolioService = {
  async getPortfolioSummary() {
    await delay(300);
    return { ...portfolioData.summary };
  },
  
  async getAllocation() {
    await delay(250);
    return { ...portfolioData.allocation };
  },
  
  async getHoldings() {
    await delay(400);
    return portfolioData.holdings.map(holding => ({ ...holding }));
  },
  
  async getHoldingById(id) {
    await delay(200);
    const holding = portfolioData.holdings.find(h => h.Id === parseInt(id));
    if (!holding) {
      throw new Error(`Holding with Id ${id} not found`);
    }
    return { ...holding };
  },
  
  async updateHolding(id, data) {
    await delay(300);
    const index = portfolioData.holdings.findIndex(h => h.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Holding with Id ${id} not found`);
    }
    
    portfolioData.holdings[index] = { ...portfolioData.holdings[index], ...data };
    return { ...portfolioData.holdings[index] };
  },
  
  async addHolding(holding) {
    await delay(350);
    const newId = Math.max(...portfolioData.holdings.map(h => h.Id)) + 1;
    const newHolding = { Id: newId, ...holding };
    portfolioData.holdings.push(newHolding);
    return { ...newHolding };
  },
  
  async deleteHolding(id) {
    await delay(250);
    const index = portfolioData.holdings.findIndex(h => h.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Holding with Id ${id} not found`);
    }
    
const deleted = portfolioData.holdings.splice(index, 1)[0];
    return { ...deleted };
  },

async getPerformanceMetrics() {
    await delay(200);
    const totalValue = portfolioData.holdings.reduce((sum, h) => sum + h.totalValue, 0);
    const totalCostBasis = portfolioData.holdings.reduce((sum, h) => sum + (h.quantity * (h.currentPrice - (h.dayChange / h.quantity))), 0);
    const totalUnrealizedGain = totalValue - totalCostBasis;
    const totalReturnPercent = (totalUnrealizedGain / totalCostBasis) * 100;
    
    return {
      totalValue,
      totalCostBasis,
      totalUnrealizedGain,
      totalReturnPercent,
      bestPerformer: portfolioData.holdings.reduce((best, current) => 
        current.dayChange > best.dayChange ? current : best
      ),
      worstPerformer: portfolioData.holdings.reduce((worst, current) => 
        current.dayChange < worst.dayChange ? current : worst
      )
    };
  },

  async getHistoricalPerformance(period = '1Y') {
    await delay(300);
    const currentValue = portfolioData.summary.totalValue;
    const periods = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365
    };
    
    const days = periods[period] || 365;
    const data = [];
    const startValue = currentValue * (0.85 + Math.random() * 0.15); // Random starting value
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic portfolio growth with some volatility
      const progress = (days - i) / days;
      const growth = 1 + (progress * 0.12) + (Math.sin(progress * Math.PI * 8) * 0.02);
      const dailyVolatility = (Math.random() - 0.5) * 0.015;
      const value = startValue * growth * (1 + dailyVolatility);
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value),
        return: ((value - startValue) / startValue) * 100
      });
    }
    
    return data;
  },

  async getBenchmarkData(period = '1Y') {
    await delay(250);
    const periods = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365
    };
    
    const days = periods[period] || 365;
    const data = [];
    const startValue = 100;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const progress = (days - i) / days;
      // S&P 500 typical growth with lower volatility than individual portfolio
      const growth = 1 + (progress * 0.08) + (Math.sin(progress * Math.PI * 6) * 0.01);
      const dailyVolatility = (Math.random() - 0.5) * 0.01;
      const value = startValue * growth * (1 + dailyVolatility);
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100,
        return: ((value - startValue) / startValue) * 100
      });
    }
    
    return data;
  },

  async getVolatilityMetrics(period = '1Y') {
    await delay(200);
    const historicalData = await this.getHistoricalPerformance(period);
    
    // Calculate daily returns
    const dailyReturns = [];
    for (let i = 1; i < historicalData.length; i++) {
      const prevValue = historicalData[i - 1].value;
      const currentValue = historicalData[i].value;
      const dailyReturn = (currentValue - prevValue) / prevValue;
      dailyReturns.push(dailyReturn);
    }
    
    // Calculate volatility (standard deviation of returns)
    const avgReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized volatility
    
    const totalReturn = historicalData[historicalData.length - 1].return;
    const annualizedReturn = period === '1Y' ? totalReturn : 
      (Math.pow(1 + totalReturn / 100, 365 / (historicalData.length - 1)) - 1) * 100;
    
    return {
      volatility: Math.round(volatility * 100) / 100,
      totalReturn: Math.round(totalReturn * 100) / 100,
      annualizedReturn: Math.round(annualizedReturn * 100) / 100,
sharpeRatio: Math.round((annualizedReturn / volatility) * 100) / 100
    };
  },
async getDetailedAllocation() {
    await delay(250);
    const totalValue = portfolioData.holdings.reduce((sum, h) => sum + h.totalValue, 0);
    
    const stockHoldings = portfolioData.holdings.filter(h => 
      !['BND', 'GLD'].includes(h.symbol)
    );
    const bondHoldings = portfolioData.holdings.filter(h => h.symbol === 'BND');
    const otherHoldings = portfolioData.holdings.filter(h => h.symbol === 'GLD');
    
    return {
      ...portfolioData.allocation,
      breakdown: {
        stocks: stockHoldings.map(h => ({
          ...h,
          percentage: (h.totalValue / totalValue) * 100
        })),
        bonds: bondHoldings.map(h => ({
          ...h,
          percentage: (h.totalValue / totalValue) * 100
        })),
        other: otherHoldings.map(h => ({
          ...h,
          percentage: (h.totalValue / totalValue) * 100
        }))
      }
    };
  },

  async applyRecommendations(recommendations) {
    await delay(1500); // Simulate processing time for rebalancing
    
    try {
      // In a real application, this would trigger actual rebalancing transactions
      // For mock purposes, we'll simulate the rebalancing by updating the allocation
      
      const currentTotal = portfolioData.totalValue;
      const newAllocation = { ...recommendations.targetAllocation };
      
      // Update the portfolio data allocation to match recommendations
      portfolioData.allocation = {
        stocks: newAllocation.stocks || 0,
        bonds: newAllocation.bonds || 0,
        alternatives: newAllocation.alternatives || 0,
        cash: newAllocation.cash || 0
      };
      
      // Simulate updating holdings based on new allocation
      const totalValue = portfolioData.holdings.reduce((sum, h) => sum + h.totalValue, 0);
      
      // Update individual holdings proportionally (simplified simulation)
      portfolioData.holdings = portfolioData.holdings.map(holding => {
        let newValue = holding.totalValue;
        
        // Simulate rebalancing effects
        if (!['BND', 'GLD'].includes(holding.symbol)) {
          // Stock holdings
          const targetStockValue = (newAllocation.stocks / 100) * totalValue;
          const currentStockValue = portfolioData.holdings
            .filter(h => !['BND', 'GLD'].includes(h.symbol))
            .reduce((sum, h) => sum + h.totalValue, 0);
          const adjustmentFactor = targetStockValue / currentStockValue;
          newValue = holding.totalValue * adjustmentFactor;
        } else if (holding.symbol === 'BND') {
          // Bond holdings
          const targetBondValue = (newAllocation.bonds / 100) * totalValue;
          newValue = targetBondValue;
        } else if (holding.symbol === 'GLD') {
          // Alternative holdings
          const targetAltValue = ((newAllocation.alternatives || 0) / 100) * totalValue;
          newValue = targetAltValue;
        }
        
        return {
          ...holding,
          totalValue: newValue,
          shares: Math.floor(newValue / holding.currentPrice),
          dayChange: holding.dayChange * 0.98, // Slight adjustment due to rebalancing
          percentChange: holding.percentChange * 0.98
        };
      });
      
      // Update total value (may change slightly due to transaction costs simulation)
      portfolioData.totalValue = portfolioData.holdings.reduce((sum, h) => sum + h.totalValue, 0);
      portfolioData.dayChange = portfolioData.totalValue - (portfolioData.totalValue * 0.999); // Minimal change
      portfolioData.percentChange = (portfolioData.dayChange / portfolioData.totalValue) * 100;
      
      return {
        success: true,
        message: 'Portfolio rebalanced successfully',
        newAllocation: portfolioData.allocation,
        transactionCost: Math.round(totalValue * 0.001), // 0.1% transaction cost
        estimatedCompletionTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      };
      
} catch (error) {
      throw new Error(`Failed to apply recommendations: ${error.message}`);
    }
  },

  async getTargetAllocation() {
    await delay(200);
    return {
      stocks: 65,
      bonds: 25,
      cash: 7,
      alternatives: 3
    };
  },

  async updateTargetAllocation(allocation) {
    await delay(300);
    // In real app, would save to user preferences
    return { ...allocation };
  },

  async getRebalancingHistory() {
    await delay(250);
    return [
      {
        Id: 1,
        date: '2024-01-15',
        type: 'automatic',
        changes: [
          { asset: 'Stocks', from: 68.2, to: 65.0 },
          { asset: 'Bonds', from: 22.1, to: 25.0 }
        ],
        status: 'completed'
      }
    ];
}
};