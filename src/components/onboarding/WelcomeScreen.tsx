import React from 'react';
import { Target, Zap, TrendingUp } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Hero Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-[#F08A3E] to-[#E17226] rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/30">
            <Target className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#6BD0D2] rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-[#F3F4F6] mb-4">
          FitTracker
        </h1>
        <p className="text-xl text-[#CBD5E1] mb-8 leading-relaxed">
          Your adaptive fitness companion with AI-powered recommendations and voice logging
        </p>

        {/* Features */}
        <div className="space-y-4 mb-10">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 bg-[#161B22] rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-[#F08A3E]" />
            </div>
            <div>
              <p className="font-medium text-[#F3F4F6]">Smart Goal Setting</p>
              <p className="text-sm text-[#CBD5E1]">Personalized fitness goals that adapt to your progress</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 bg-[#161B22] rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#6BD0D2]" />
            </div>
            <div>
              <p className="font-medium text-[#F3F4F6]">Voice Logging</p>
              <p className="text-sm text-[#CBD5E1]">Log your progress naturally with voice commands</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 bg-[#161B22] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#4BE0D1]" />
            </div>
            <div>
              <p className="font-medium text-[#F3F4F6]">AI Recommendations</p>
              <p className="text-sm text-[#CBD5E1]">Get personalized coaching based on your data</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="w-full bg-gradient-to-r from-[#F08A3E] to-[#E17226] text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          Get Started
        </button>
        
        <p className="text-xs text-[#CBD5E1] mt-4 opacity-75">
          Transform your fitness journey today
        </p>
      </div>
    </div>
  );
};