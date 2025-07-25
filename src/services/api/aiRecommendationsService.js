import { riskAssessmentService } from '@/services/api/riskAssessmentService';
import { goalsService } from '@/services/api/goalsService';
import { portfolioService } from '@/services/api/portfolioService';

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateRecommendations = (riskProfile, goals, currentAllocation, portfolioValue) => {
  const recommendations = {
    riskProfile: riskProfile.profile,
    targetAllocation: riskProfile.allocation,
    currentAllocation,
    rebalancingActions: [],
    explanations: [],
    estimatedImpact: {},
    confidence: 85
  };

  // Calculate allocation differences
  const allocationDiff = {};
  Object.keys(riskProfile.allocation).forEach(asset => {
    const target = riskProfile.allocation[asset];
    const current = currentAllocation[asset] || 0;
    allocationDiff[asset] = target - current;
  });

  // Generate rebalancing actions
  Object.entries(allocationDiff).forEach(([asset, diff]) => {
    if (Math.abs(diff) > 5) { // Only recommend changes > 5%
      const action = diff > 0 ? 'increase' : 'decrease';
      const amount = Math.abs(diff);
      const dollarAmount = (amount / 100) * portfolioValue;
      
      recommendations.rebalancingActions.push({
        asset: asset.charAt(0).toUpperCase() + asset.slice(1),
        action,
        currentPercentage: currentAllocation[asset] || 0,
        targetPercentage: riskProfile.allocation[asset],
        changePercentage: Math.abs(diff),
        dollarAmount,
        priority: Math.abs(diff) > 15 ? 'high' : Math.abs(diff) > 10 ? 'medium' : 'low'
      });
    }
  });

  // Generate explanations based on risk profile
  if (riskProfile.profile === 'Conservative') {
    recommendations.explanations.push({
      title: 'Capital Preservation Focus',
      description: 'Your conservative risk profile prioritizes protecting your principal while generating steady income through bonds and dividend-paying stocks.',
      reasoning: 'Conservative investors typically allocate 60-70% to bonds for stability and predictable income.'
    });
    
    if (allocationDiff.bonds > 10) {
      recommendations.explanations.push({
        title: 'Increase Bond Allocation',
        description: 'Consider increasing your bond allocation to better align with your risk tolerance and provide more stable returns.',
        reasoning: 'Bonds offer lower volatility and regular income, which matches your conservative investment approach.'
      });
    }
  } else if (riskProfile.profile === 'Moderate') {
    recommendations.explanations.push({
      title: 'Balanced Growth Strategy',
      description: 'Your moderate risk profile suggests a balanced approach between growth and stability, with 60% stocks and 30% bonds.',
      reasoning: 'This allocation provides growth potential while maintaining some stability through fixed-income investments.'
    });
    
    if (allocationDiff.stocks > 10) {
      recommendations.explanations.push({
        title: 'Optimize Stock Exposure',
        description: 'Increasing your stock allocation could help you achieve better long-term growth while staying within your risk tolerance.',
        reasoning: 'Moderate investors can benefit from higher equity exposure for long-term wealth building.'
      });
    }
  } else if (riskProfile.profile === 'Aggressive') {
    recommendations.explanations.push({
      title: 'Maximum Growth Potential',
      description: 'Your aggressive risk profile allows for 80% stock allocation to maximize long-term growth potential.',
      reasoning: 'Aggressive investors with long time horizons can benefit from higher equity exposure despite short-term volatility.'
    });
    
    if (allocationDiff.stocks > 5) {
      recommendations.explanations.push({
        title: 'Increase Equity Exposure',
        description: 'Consider increasing your stock allocation to fully capitalize on long-term growth opportunities.',
        reasoning: 'Higher equity allocation aligns with your aggressive risk tolerance and long-term investment horizon.'
      });
    }
  }

  // Add diversification recommendations
  if (currentAllocation.stocks > 70 && !currentAllocation.alternatives) {
    recommendations.explanations.push({
      title: 'Diversification Opportunity',
      description: 'Consider adding alternative investments like REITs or commodities to improve portfolio diversification.',
      reasoning: 'Alternative investments can provide additional diversification benefits and potentially reduce overall portfolio risk.'
    });
  }

  // Estimate potential impact
  const totalRebalanceAmount = recommendations.rebalancingActions.reduce((sum, action) => sum + action.dollarAmount, 0);
  recommendations.estimatedImpact = {
    potentialAnnualReturn: riskProfile.profile === 'Conservative' ? '4-6%' : 
                          riskProfile.profile === 'Moderate' ? '6-8%' : '8-12%',
    riskReduction: allocationDiff.bonds > 0 ? 'Medium' : allocationDiff.bonds < -10 ? 'Lower' : 'Maintained',
    rebalanceAmount: totalRebalanceAmount,
    timeToImplement: '1-2 business days'
  };

  return recommendations;
};

export const aiRecommendationsService = {
  async getPersonalizedRecommendations() {
    await delay(800); // Simulate AI processing time
    
    try {
      // Get user's risk assessment
      const assessmentHistory = riskAssessmentService.getAssessmentHistory();
      if (assessmentHistory.length === 0) {
        throw new Error('No risk assessment found. Please complete a risk assessment first.');
      }
      
      const latestAssessment = assessmentHistory[assessmentHistory.length - 1];
      
      // Get current portfolio data
      const [portfolioSummary, goals] = await Promise.all([
        portfolioService.getPortfolioSummary(),
        goalsService.getAll().catch(() => []) // Fallback if goals service fails
      ]);
      
      // Calculate current allocation percentages
      const totalValue = portfolioSummary.totalValue;
      const currentAllocation = {
        stocks: Math.round((portfolioSummary.allocation.stocks / 100) * 100) || 0,
        bonds: Math.round((portfolioSummary.allocation.bonds / 100) * 100) || 0,
        alternatives: Math.round((portfolioSummary.allocation.alternatives / 100) * 100) || 0,
        cash: Math.round((portfolioSummary.allocation.cash / 100) * 100) || 0
      };
      
      // Generate AI recommendations
      const recommendations = generateRecommendations(
        latestAssessment,
        goals,
        currentAllocation,
        totalValue
      );
      
      return {
        ...recommendations,
        generatedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Valid for 7 days
        userId: 'current-user' // In real app, would come from auth
      };
      
    } catch (error) {
      throw new Error(`Failed to generate recommendations: ${error.message}`);
    }
  },

  async refreshRecommendations() {
    // Same as getPersonalizedRecommendations but with different delay to simulate refresh
    await delay(600);
    return this.getPersonalizedRecommendations();
  }
};