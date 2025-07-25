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
  }
};