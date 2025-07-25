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
  }
};