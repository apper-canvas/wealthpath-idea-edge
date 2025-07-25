import portfolioData from "@/services/mockData/portfolio.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Default target allocation
const defaultTargetAllocation = {
  stocks: 65,
  bonds: 25,
  cash: 7,
  alternatives: 3
};

// Store target allocation (in real app, this would be in database)
let targetAllocation = { ...defaultTargetAllocation };

// Store rebalancing history
let rebalancingHistory = [
  {
    Id: 1,
    date: '2024-01-15',
    type: 'automatic',
    reason: 'Quarterly rebalancing',
    changes: [
      { asset: 'Stocks', from: 68.2, to: 65.0, action: 'sell', amount: 15640 },
      { asset: 'Bonds', from: 22.1, to: 25.0, action: 'buy', amount: 14120 },
      { asset: 'Cash', from: 6.7, to: 7.0, action: 'buy', amount: 1520 }
    ],
    transactionCost: 156,
    status: 'completed'
  }
];

export const rebalancingService = {
  async getTargetAllocation() {
    await delay(200);
    return { ...targetAllocation };
  },

  async updateTargetAllocation(newAllocation) {
    await delay(300);
    targetAllocation = { ...newAllocation };
    return { ...targetAllocation };
  },

  async analyzePortfolioDrift(driftThreshold = 5) {
    await delay(400);
    
    const currentAllocation = portfolioData.allocation;
    const target = targetAllocation;
    
    const analysis = {
      totalValue: portfolioData.summary.totalValue,
      driftThreshold,
      overallDrift: 0,
      needsRebalancing: false,
      riskLevel: 'low', // low, medium, high
      assets: [],
      recommendations: []
    };

    // Calculate drift for each asset class
    const assetClasses = ['stocks', 'bonds', 'cash', 'alternatives'];
    let totalDrift = 0;

    assetClasses.forEach(asset => {
      const current = currentAllocation[asset] || 0;
      const targetValue = target[asset] || 0;
      const drift = Math.abs(current - targetValue);
      const driftDirection = current > targetValue ? 'overweight' : 'underweight';
      
      totalDrift += drift;
      
      const assetAnalysis = {
        asset,
        current,
        target: targetValue,
        drift,
        driftDirection,
        driftPercentage: targetValue > 0 ? (drift / targetValue) * 100 : 0,
        needsAction: drift > driftThreshold,
        severity: drift > driftThreshold * 2 ? 'high' : drift > driftThreshold ? 'medium' : 'low',
        recommendedAction: null,
        recommendedAmount: 0
      };

      if (assetAnalysis.needsAction) {
        const targetAmount = (targetValue / 100) * analysis.totalValue;
        const currentAmount = (current / 100) * analysis.totalValue;
        const difference = targetAmount - currentAmount;
        
        assetAnalysis.recommendedAction = difference > 0 ? 'buy' : 'sell';
        assetAnalysis.recommendedAmount = Math.abs(difference);
      }

      analysis.assets.push(assetAnalysis);
    });

    analysis.overallDrift = totalDrift / assetClasses.length;
    analysis.needsRebalancing = analysis.assets.some(a => a.needsAction);
    
    // Determine risk level
    if (analysis.overallDrift > driftThreshold * 2) {
      analysis.riskLevel = 'high';
    } else if (analysis.overallDrift > driftThreshold) {
      analysis.riskLevel = 'medium';
    }

    // Generate specific recommendations
    if (analysis.needsRebalancing) {
      const assetsNeedingAction = analysis.assets.filter(a => a.needsAction);
      
      analysis.recommendations = assetsNeedingAction.map(asset => ({
        asset: asset.asset,
        action: asset.recommendedAction,
        amount: asset.recommendedAmount,
        currentAllocation: asset.current,
        targetAllocation: asset.target,
        priority: asset.severity,
        description: `${asset.recommendedAction === 'buy' ? 'Increase' : 'Decrease'} ${asset.asset} allocation by ${asset.drift.toFixed(1)}% to reach target`
      }));
    }

    return analysis;
  },

  async generateRebalancingPlan(customThreshold) {
    await delay(500);
    
    const driftAnalysis = await this.analyzePortfolioDrift(customThreshold);
    
    if (!driftAnalysis.needsRebalancing) {
      return {
        needsRebalancing: false,
        message: 'Portfolio is well-balanced within target ranges',
        analysis: driftAnalysis
      };
    }

    const plan = {
      needsRebalancing: true,
      analysis: driftAnalysis,
      transactions: [],
      estimatedCosts: {
        transactionFees: 0,
        taxImplications: 0,
        total: 0
      },
      executionSteps: [],
      timeframe: '2-3 business days'
    };

    // Generate specific transactions
    let sellTransactions = [];
    let buyTransactions = [];

    driftAnalysis.recommendations.forEach(rec => {
      const transaction = {
        asset: rec.asset,
        action: rec.action,
        amount: rec.amount,
        description: rec.description,
        priority: rec.priority,
        estimatedFee: Math.round(rec.amount * 0.001) // 0.1% fee
      };

      if (rec.action === 'sell') {
        sellTransactions.push(transaction);
      } else {
        buyTransactions.push(transaction);
      }

      plan.transactions.push(transaction);
    });

    // Calculate costs
    plan.estimatedCosts.transactionFees = plan.transactions.reduce((sum, t) => sum + t.estimatedFee, 0);
    plan.estimatedCosts.total = plan.estimatedCosts.transactionFees;

    // Generate execution steps
    plan.executionSteps = [
      'Review and approve rebalancing plan',
      'Execute sell orders for overweight assets',
      'Wait for settlement (T+2)',
      'Execute buy orders for underweight assets',
      'Monitor and confirm new allocation'
    ];

    return plan;
  },

  async executeRebalancing(plan) {
    await delay(2000); // Simulate execution time
    
    try {
      // In real app, this would execute actual trades
      const executionResult = {
        success: true,
        executionId: `RB_${Date.now()}`,
        startTime: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        transactions: plan.transactions.map(t => ({
          ...t,
          status: 'pending',
          orderId: `ORD_${Math.random().toString(36).substr(2, 9)}`
        })),
        totalCost: plan.estimatedCosts.total
      };

      // Add to history
      const historyEntry = {
        Id: rebalancingHistory.length + 1,
        date: new Date().toISOString().split('T')[0],
        type: 'manual',
        reason: 'User-initiated rebalancing',
        changes: plan.transactions.map(t => ({
          asset: t.asset,
          action: t.action,
          amount: t.amount
        })),
        transactionCost: plan.estimatedCosts.total,
        status: 'in_progress',
        executionId: executionResult.executionId
      };

      rebalancingHistory.push(historyEntry);

      return executionResult;
    } catch (error) {
      throw new Error(`Failed to execute rebalancing: ${error.message}`);
    }
  },

  async getRebalancingHistory() {
    await delay(300);
    return rebalancingHistory.map(entry => ({ ...entry }));
  },

  async getRebalancingAlerts() {
    await delay(250);
    
    const driftAnalysis = await this.analyzePortfolioDrift();
    const alerts = [];

    if (driftAnalysis.needsRebalancing) {
      const highPriorityAssets = driftAnalysis.assets.filter(a => a.severity === 'high');
      const mediumPriorityAssets = driftAnalysis.assets.filter(a => a.severity === 'medium');

      if (highPriorityAssets.length > 0) {
        alerts.push({
          Id: 1,
          type: 'critical',
          title: 'Critical Portfolio Drift Detected',
          message: `${highPriorityAssets.length} asset class(es) significantly out of balance`,
          assets: highPriorityAssets.map(a => a.asset),
          recommendedAction: 'immediate_rebalancing',
          createdAt: new Date().toISOString()
        });
      }

      if (mediumPriorityAssets.length > 0) {
        alerts.push({
          Id: 2,
          type: 'warning',
          title: 'Portfolio Rebalancing Recommended',
          message: `${mediumPriorityAssets.length} asset class(es) approaching drift threshold`,
          assets: mediumPriorityAssets.map(a => a.asset),
          recommendedAction: 'schedule_rebalancing',
          createdAt: new Date().toISOString()
        });
      }
    }

    return alerts;
  },

  async dismissAlert(alertId) {
    await delay(200);
    // In real app, would mark alert as dismissed in database
    return { success: true, alertId };
  },

  async getRebalancingSettings() {
    await delay(200);
    return {
      driftThreshold: 5,
      autoRebalancing: false,
      rebalancingFrequency: 'quarterly',
      notificationsEnabled: true,
      minTransactionAmount: 1000
    };
  },

  async updateRebalancingSettings(settings) {
    await delay(300);
    // In real app, would save to database
    return { ...settings, updatedAt: new Date().toISOString() };
  }
};