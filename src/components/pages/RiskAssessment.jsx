import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ProgressBar from "@/components/atoms/ProgressBar";
import ApperIcon from "@/components/ApperIcon";
import { riskAssessmentService } from "@/services/api/riskAssessmentService";
import { toast } from "react-toastify";

const RiskAssessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const questions = riskAssessmentService.getQuestions();
  const totalSteps = questions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleAnswer = (questionId, answerId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      calculateRisk();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const calculateRisk = async () => {
    setIsLoading(true);
    try {
      const riskProfile = riskAssessmentService.calculateRiskProfile(answers);
      setResult(riskProfile);
      toast.success("Risk assessment completed successfully!");
    } catch (error) {
      toast.error("Failed to calculate risk profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAssessment = () => {
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
  };

  const currentQuestion = questions[currentStep];
  const hasAnswer = answers[currentQuestion?.Id];
  const canProceed = hasAnswer !== undefined;

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Risk Assessment Results
            </h1>
            <p className="text-slate-600 mt-1">Your personalized investment risk profile</p>
          </div>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            <span>Back to Dashboard</span>
          </Button>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-slate-50 to-blue-50">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-2xl ${result.profile === 'Conservative' ? 'bg-green-100' : 
                result.profile === 'Moderate' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <ApperIcon 
                  name={result.profile === 'Conservative' ? 'Shield' : 
                        result.profile === 'Moderate' ? 'TrendingUp' : 'Zap'} 
                  className={`h-8 w-8 ${result.profile === 'Conservative' ? 'text-green-600' : 
                    result.profile === 'Moderate' ? 'text-yellow-600' : 'text-red-600'}`} 
                />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  {result.profile} Risk Profile
                </CardTitle>
                <p className="text-slate-600 mt-1">Score: {result.score} out of {result.maxScore}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-white rounded-xl border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Profile Description</h3>
              <p className="text-slate-700 leading-relaxed">{result.description}</p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recommended Investment Strategy</h3>
              <div className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-1 bg-primary-100 rounded-full mt-1">
                      <ApperIcon name="Check" size={12} className="text-primary-600" />
                    </div>
                    <p className="text-slate-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Asset Allocation Suggestion</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(result.allocation).map(([asset, percentage]) => (
                  <div key={asset} className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{percentage}%</div>
                    <div className="text-sm text-slate-600 capitalize">{asset.replace(/([A-Z])/g, ' $1').trim()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={resetAssessment}
                variant="outline"
                className="flex items-center justify-center space-x-2"
              >
                <ApperIcon name="RotateCcw" size={16} />
                <span>Retake Assessment</span>
              </Button>
              <Button 
                onClick={() => navigate('/goals')}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
              >
                <ApperIcon name="Target" size={16} />
                <span>Set Investment Goals</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Calculating your risk profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Risk Assessment
          </h1>
          <p className="text-slate-600 mt-1">
            Question {currentStep + 1} of {totalSteps}
          </p>
        </div>
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ApperIcon name="X" size={16} />
          <span>Cancel</span>
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Progress</span>
          <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
        </div>
        <ProgressBar value={progress} className="h-2" />
      </div>

      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-slate-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {currentQuestion.answers.map((answer) => (
              <label
                key={answer.Id}
                className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  answers[currentQuestion.Id] === answer.Id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.Id}`}
                  value={answer.Id}
                  checked={answers[currentQuestion.Id] === answer.Id}
                  onChange={() => handleAnswer(currentQuestion.Id, answer.Id)}
                  className="mt-1 h-4 w-4 text-primary-600 border-slate-300 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <p className="text-slate-800 font-medium">{answer.text}</p>
                  {answer.description && (
                    <p className="text-sm text-slate-600 mt-1">{answer.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-between pt-6">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ApperIcon name="ChevronLeft" size={16} />
              <span>Previous</span>
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
            >
              <span>{currentStep === totalSteps - 1 ? 'Calculate Risk Profile' : 'Next'}</span>
              <ApperIcon name={currentStep === totalSteps - 1 ? 'Calculator' : 'ChevronRight'} size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAssessment;