const questions = [
  {
    Id: 1,
    question: "What is your investment timeline?",
    answers: [
      { Id: 1, text: "Less than 2 years", description: "Short-term goals like emergency fund or near-term purchases", score: 1 },
      { Id: 2, text: "2-5 years", description: "Medium-term goals like home down payment or major purchase", score: 2 },
      { Id: 3, text: "5-10 years", description: "Long-term goals like children's education", score: 3 },
      { Id: 4, text: "More than 10 years", description: "Very long-term goals like retirement", score: 4 }
    ]
  },
  {
    Id: 2,
    question: "How comfortable are you with investment risk?",
    answers: [
      { Id: 1, text: "Very uncomfortable", description: "I prefer guaranteed returns even if they're lower", score: 1 },
      { Id: 2, text: "Somewhat uncomfortable", description: "I can accept small fluctuations for slightly higher returns", score: 2 },
      { Id: 3, text: "Moderately comfortable", description: "I can handle moderate ups and downs for better growth potential", score: 3 },
      { Id: 4, text: "Very comfortable", description: "I'm willing to accept significant volatility for maximum growth", score: 4 }
    ]
  },
  {
    Id: 3,
    question: "What is your primary financial goal?",
    answers: [
      { Id: 1, text: "Capital preservation", description: "Protect my money from inflation with minimal risk", score: 1 },
      { Id: 2, text: "Steady income", description: "Generate consistent returns for regular income", score: 2 },
      { Id: 3, text: "Balanced growth", description: "Grow my wealth at a moderate pace with some risk", score: 3 },
      { Id: 4, text: "Maximum growth", description: "Maximize long-term wealth accumulation", score: 4 }
    ]
  },
  {
    Id: 4,
    question: "How would you react if your portfolio lost 20% in a market downturn?",
    answers: [
      { Id: 1, text: "Panic and sell everything", description: "I would need to access my money immediately", score: 1 },
      { Id: 2, text: "Feel very anxious but hold", description: "I would be worried but not make immediate changes", score: 2 },
      { Id: 3, text: "Stay calm and wait", description: "I would view it as a temporary setback", score: 3 },
      { Id: 4, text: "Buy more investments", description: "I would see it as a buying opportunity", score: 4 }
    ]
  },
  {
    Id: 5,
    question: "What is your experience with investing?",
    answers: [
      { Id: 1, text: "No experience", description: "I'm completely new to investing", score: 1 },
      { Id: 2, text: "Basic knowledge", description: "I understand basic investment concepts", score: 2 },
      { Id: 3, text: "Moderate experience", description: "I've been investing for a few years", score: 3 },
      { Id: 4, text: "Very experienced", description: "I have extensive investment knowledge and experience", score: 4 }
    ]
  },
  {
    Id: 6,
    question: "Which investment approach appeals to you most?",
    answers: [
      { Id: 1, text: "Safe and predictable", description: "CDs, savings accounts, government bonds", score: 1 },
      { Id: 2, text: "Conservative growth", description: "Mix of bonds and stable dividend stocks", score: 2 },
      { Id: 3, text: "Balanced portfolio", description: "Diversified mix of stocks, bonds, and other assets", score: 3 },
      { Id: 4, text: "Aggressive growth", description: "Growth stocks, emerging markets, alternative investments", score: 4 }
    ]
  }
];

const riskProfiles = {
  conservative: {
    profile: "Conservative",
    minScore: 6,
    maxScore: 12,
    description: "You prefer stability and capital preservation over growth. Your investment approach focuses on minimizing risk and protecting your principal, even if it means accepting lower returns. This profile is suitable for investors with short-term goals or those who cannot afford significant losses.",
    recommendations: [
      "Focus on high-grade bonds and fixed-income securities",
      "Consider CDs and money market accounts for short-term goals",
      "Limit stock exposure to dividend-paying, established companies",
      "Maintain a larger emergency fund (6-12 months of expenses)",
      "Review and rebalance portfolio quarterly"
    ],
    allocation: {
      bonds: 60,
      stocks: 25,
      cash: 15
    }
  },
  moderate: {
    profile: "Moderate",
    minScore: 13,
    maxScore: 18,
    description: "You seek a balance between growth and stability. You're willing to accept some risk and volatility in exchange for potentially higher returns than conservative investments. This profile suits investors with medium-term goals who can weather moderate market fluctuations.",
    recommendations: [
      "Diversify across stocks, bonds, and other asset classes",
      "Consider index funds and ETFs for broad market exposure",
      "Include both domestic and international investments",
      "Rebalance portfolio semi-annually",
      "Consider dollar-cost averaging for regular investments"
    ],
    allocation: {
      stocks: 60,
      bonds: 30,
      alternatives: 10
    }
  },
  aggressive: {
    profile: "Aggressive",
    minScore: 19,
    maxScore: 24,
    description: "You prioritize long-term growth and are comfortable with significant volatility. You understand that higher potential returns come with higher risk, and you have the time horizon and risk tolerance to ride out market downturns. This profile is ideal for young investors or those with long-term investment goals.",
    recommendations: [
      "Focus heavily on growth stocks and equity investments",
      "Consider emerging markets and small-cap stocks",
      "Explore alternative investments like REITs or commodities",
      "Minimize bond allocation to maximize growth potential",
      "Take advantage of tax-advantaged retirement accounts"
    ],
    allocation: {
      stocks: 80,
      alternatives: 15,
      bonds: 5
    }
  }
};

export const riskAssessmentService = {
  getQuestions() {
    return [...questions];
  },

  calculateRiskProfile(answers) {
    const totalScore = Object.values(answers).reduce((sum, answerId) => {
      for (const question of questions) {
        const answer = question.answers.find(a => a.Id === answerId);
        if (answer) {
          return sum + answer.score;
        }
      }
      return sum;
    }, 0);

    const maxPossibleScore = questions.length * 4;

    let profile;
    if (totalScore <= riskProfiles.conservative.maxScore) {
      profile = riskProfiles.conservative;
    } else if (totalScore <= riskProfiles.moderate.maxScore) {
      profile = riskProfiles.moderate;
    } else {
      profile = riskProfiles.aggressive;
    }

    return {
      ...profile,
      score: totalScore,
      maxScore: maxPossibleScore,
      answers: answers,
      completedAt: new Date().toISOString()
    };
  },

  getRiskProfiles() {
    return { ...riskProfiles };
  },

  saveAssessment(assessmentResult) {
    // In a real application, this would save to a backend
    // For now, we'll use localStorage
    try {
      const assessments = JSON.parse(localStorage.getItem('riskAssessments') || '[]');
      assessments.push({
        ...assessmentResult,
        Id: assessments.length + 1,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('riskAssessments', JSON.stringify(assessments));
      return true;
    } catch (error) {
      console.error('Failed to save assessment:', error);
      return false;
    }
  },

  getAssessmentHistory() {
    try {
      return JSON.parse(localStorage.getItem('riskAssessments') || '[]');
    } catch (error) {
      console.error('Failed to load assessment history:', error);
      return [];
    }
  }
};