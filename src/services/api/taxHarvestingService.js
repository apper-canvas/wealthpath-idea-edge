import portfolioData from '@/services/mockData/portfolio.json';

// Helper function for delays
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock tax harvesting opportunities data
const mockTaxHarvestingOpportunities = [
  {
    Id: 1,
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currentPrice: 185.50,
    costBasis: 220.00,
    shares: 50,
    unrealizedLoss: -1725.00,
    lossPercentage: -15.68,
    purchaseDate: '2023-08-15',
    holdingPeriod: 'Short-term',
    taxSavings: 517.50,
    harvestingPotential: 'High',
    washSaleRisk: 'Low',
    recommendedAction: 'Harvest'
  },
  {
    Id: 2,
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    currentPrice: 128.75,
    costBasis: 145.20,
    shares: 30,
    unrealizedLoss: -493.50,
    lossPercentage: -11.33,
    purchaseDate: '2023-06-10',
    holdingPeriod: 'Short-term',
    taxSavings: 148.05,
    harvestingPotential: 'Medium',
    washSaleRisk: 'Medium',
    recommendedAction: 'Consider'
  },
  {
    Id: 3,
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    currentPrice: 205.80,
    costBasis: 280.50,
    shares: 25,
    unrealizedLoss: -1867.50,
    lossPercentage: -26.64,
    purchaseDate: '2022-11-20',
    holdingPeriod: 'Long-term',
    taxSavings: 373.50,
    harvestingPotential: 'High',
    washSaleRisk: 'Low',
    recommendedAction: 'Harvest'
  }
];

// Mock alternative investments data
const mockAlternativeInvestments = [
  {
    Id: 1,
    originalSymbol: 'AAPL',
    symbol: 'QQQ',
    name: 'Invesco QQQ ETF',
    currentPrice: 385.20,
    similarity: 85,
    sectorMatch: 'Technology',
    correlationScore: 0.78,
    expenseRatio: 0.20,
    washSaleCompliant: true,
    description: 'Provides similar tech exposure without wash sale risk'
  },
  {
    Id: 2,
    originalSymbol: 'AAPL',
    symbol: 'VGT',
    name: 'Vanguard Information Technology ETF',
    currentPrice: 465.80,
    similarity: 82,
    sectorMatch: 'Technology',
    correlationScore: 0.75,
    expenseRatio: 0.10,
    washSaleCompliant: true,
    description: 'Low-cost tech sector exposure'
  },
  {
    Id: 3,
    originalSymbol: 'GOOGL',
    symbol: 'ARKK',
    name: 'ARK Innovation ETF',
    currentPrice: 48.75,
    similarity: 70,
    sectorMatch: 'Growth Technology',
    correlationScore: 0.65,
    expenseRatio: 0.75,
    washSaleCompliant: true,
    description: 'Innovation-focused growth exposure'
  },
  {
    Id: 4,
    originalSymbol: 'TSLA',
    symbol: 'IDRV',
    name: 'iShares Self-Driving EV and Tech ETF',
    currentPrice: 42.30,
    similarity: 75,
    sectorMatch: 'Electric Vehicles',
    correlationScore: 0.68,
    expenseRatio: 0.47,
    washSaleCompliant: true,
    description: 'Electric vehicle and autonomous driving exposure'
  }
];

// Mock tax calendar data
const mockTaxCalendar = [
  {
    Id: 1,
    date: '2024-01-15',
    title: 'Q4 Estimated Tax Payment Due',
    type: 'deadline',
    importance: 'high',
    description: 'Fourth quarter estimated tax payment deadline for 2023'
  },
  {
    Id: 2,
    date: '2024-01-31',
    title: 'Tax Documents Available',
    type: 'document',
    importance: 'medium',
    description: '1099 forms and tax documents typically available'
  },
  {
    Id: 3,
    date: '2024-03-15',
    title: 'Corporate Tax Return Due',
    type: 'deadline',
    importance: 'medium',
    description: 'C-Corporation tax return filing deadline'
  },
  {
    Id: 4,
    date: '2024-04-15',
    title: 'Individual Tax Return Due',
    type: 'deadline',
    importance: 'high',
    description: 'Individual income tax return and payment deadline'
  },
  {
    Id: 5,
    date: '2024-04-15',
    title: 'Q1 Estimated Tax Payment Due',
    type: 'deadline',
    importance: 'high',
    description: 'First quarter estimated tax payment for 2024'
  },
  {
    Id: 6,
    date: '2024-06-17',
    title: 'Q2 Estimated Tax Payment Due',
    type: 'deadline',
    importance: 'high',
    description: 'Second quarter estimated tax payment for 2024'
  },
  {
    Id: 7,
    date: '2024-09-16',
    title: 'Q3 Estimated Tax Payment Due',
    type: 'deadline',
    importance: 'high',
    description: 'Third quarter estimated tax payment for 2024'
  },
  {
    Id: 8,
    date: '2024-10-15',
    title: 'Extended Return Due',
    type: 'deadline',
    importance: 'medium',
    description: 'Extended individual tax return filing deadline'
  },
  {
    Id: 9,
    date: '2024-12-31',
    title: 'Tax-Loss Harvesting Cutoff',
    type: 'planning',
    importance: 'high',
    description: 'Last day to realize capital losses for current tax year'
  },
  {
    Id: 10,
    date: '2024-12-31',
    title: 'Retirement Contribution Deadline',
    type: 'planning',
    importance: 'high',
    description: 'Last day for current year 401(k) and other retirement contributions'
  }
];

export const taxHarvestingService = {
  // Get all tax-loss harvesting opportunities
  async getHarvestingOpportunities() {
    await delay(800);
    
    try {
      // Filter for positions with losses
      const opportunities = mockTaxHarvestingOpportunities.filter(opp => opp.unrealizedLoss < 0);
      
      return {
        success: true,
        data: opportunities,
        summary: {
          totalOpportunities: opportunities.length,
          totalPotentialLoss: opportunities.reduce((sum, opp) => sum + Math.abs(opp.unrealizedLoss), 0),
          totalTaxSavings: opportunities.reduce((sum, opp) => sum + opp.taxSavings, 0),
          highPotentialCount: opportunities.filter(opp => opp.harvestingPotential === 'High').length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load tax harvesting opportunities'
      };
    }
  },

  // Get alternative investment suggestions for a specific symbol
  async getAlternativeInvestments(originalSymbol) {
    await delay(600);
    
    try {
      const alternatives = mockAlternativeInvestments.filter(
        alt => alt.originalSymbol === originalSymbol
      );
      
      return {
        success: true,
        data: alternatives
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load alternative investments'
      };
    }
  },

  // Execute tax-loss harvesting for specific opportunities
  async executeTaxHarvesting(opportunities, alternativeInvestments = []) {
    await delay(1500);
    
    try {
      // Simulate execution logic
      const executionResults = opportunities.map(opp => ({
        Id: opp.Id,
        symbol: opp.symbol,
        action: 'sell',
        shares: opp.shares,
        estimatedProceeds: opp.shares * opp.currentPrice,
        realizedLoss: opp.unrealizedLoss,
        taxSavings: opp.taxSavings,
        status: 'executed',
        executionTime: new Date().toISOString()
      }));

      const alternativeResults = alternativeInvestments.map(alt => ({
        Id: alt.Id,
        symbol: alt.symbol,
        action: 'buy',
        estimatedShares: Math.floor(alt.estimatedInvestment / alt.currentPrice),
        estimatedCost: alt.estimatedInvestment,
        status: 'executed',
        executionTime: new Date().toISOString()
      }));

      return {
        success: true,
        data: {
          sales: executionResults,
          purchases: alternativeResults,
          summary: {
            totalRealizedLoss: executionResults.reduce((sum, result) => sum + Math.abs(result.realizedLoss), 0),
            totalTaxSavings: executionResults.reduce((sum, result) => sum + result.taxSavings, 0),
            transactionsExecuted: executionResults.length + alternativeResults.length
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to execute tax harvesting trades'
      };
    }
  },

  // Get tax calendar with important dates
  async getTaxCalendar() {
    await delay(400);
    
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      
      // Filter calendar events for current and next year
      const relevantEvents = mockTaxCalendar.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() >= currentYear;
      });

      return {
        success: true,
        data: relevantEvents
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load tax calendar'
      };
    }
  },

  // Get tax harvesting analysis for portfolio
  async getPortfolioTaxAnalysis() {
    await delay(1000);
    
    try {
      const opportunities = await this.getHarvestingOpportunities();
      
      if (!opportunities.success) {
        throw new Error('Failed to analyze portfolio');
      }

      const analysis = {
        totalUnrealizedLosses: opportunities.data.reduce((sum, opp) => sum + Math.abs(opp.unrealizedLoss), 0),
        totalPotentialSavings: opportunities.data.reduce((sum, opp) => sum + opp.taxSavings, 0),
        opportunitiesCount: opportunities.data.length,
        riskAssessment: {
          washSaleRisk: opportunities.data.filter(opp => opp.washSaleRisk === 'High').length,
          shortTermLosses: opportunities.data.filter(opp => opp.holdingPeriod === 'Short-term').length,
          longTermLosses: opportunities.data.filter(opp => opp.holdingPeriod === 'Long-term').length
        },
        recommendations: this.generateRecommendations(opportunities.data)
      };

      return {
        success: true,
        data: analysis
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to analyze portfolio for tax harvesting'
      };
    }
  },

  // Generate personalized tax harvesting recommendations
  generateRecommendations(opportunities) {
    const recommendations = [];

    if (opportunities.length === 0) {
      recommendations.push({
        type: 'info',
        title: 'No Current Opportunities',
        description: 'Your portfolio currently shows no significant tax-loss harvesting opportunities.',
        priority: 'low'
      });
    } else {
      const highPotential = opportunities.filter(opp => opp.harvestingPotential === 'High');
      
      if (highPotential.length > 0) {
        recommendations.push({
          type: 'action',
          title: 'High-Priority Harvesting',
          description: `${highPotential.length} positions show high harvesting potential with total savings of $${highPotential.reduce((sum, opp) => sum + opp.taxSavings, 0).toFixed(2)}.`,
          priority: 'high'
        });
      }

      const washSaleRisk = opportunities.filter(opp => opp.washSaleRisk === 'High');
      if (washSaleRisk.length > 0) {
        recommendations.push({
          type: 'warning',
          title: 'Wash Sale Risk',
          description: `${washSaleRisk.length} positions have high wash sale risk. Consider alternative investments.`,
          priority: 'medium'
        });
      }

      recommendations.push({
        type: 'planning',
        title: 'Year-End Planning',
        description: 'Consider executing harvesting strategies before December 31st to maximize current year benefits.',
        priority: 'medium'
      });
    }

    return recommendations;
  }
};