import React, { useState } from 'react';
import { User, ArrowRight, SkipForward } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: (profile: {
    weight?: number;
    weightUnit: 'kg' | 'pounds';
    height?: number;
    heightUnit: 'cm' | 'feet';
    age?: number;
    gender?: 'male' | 'female' | 'other';
  }) => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [weight, setWeight] = useState<string>('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'pounds'>('pounds');
  const [height, setHeight] = useState<string>('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'feet'>('feet');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('');

  const handleContinue = () => {
    if (!weight || !height || !age || !gender) {
      return; // Don't proceed if required fields are missing
    }

    onComplete({
      weight: Number(weight),
      weightUnit,
      height: Number(height),
      heightUnit,
      age: Number(age),
      gender
    });
  };


  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#6BD0D2] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">
            Complete Your Profile
          </h2>
          <p className="text-[#CBD5E1]">
            These details help us tailor personalized fitness goals and recommendations just for you
          </p>
        </div>

        <div className="bg-[#161B22] rounded-2xl p-6 border border-[#2B3440] space-y-6">
          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
              Current Weight *
            </label>
            <div className="flex space-x-3">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="150"
                className={`flex-1 px-4 py-3 bg-[#0D1117] border rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:outline-none transition-colors ${
                  !weight ? 'border-red-500 focus:border-red-400' : 'border-[#2B3440] focus:border-[#F08A3E]'
                }`}
                required
              />
              <select
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'pounds')}
                className="px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] focus:border-[#F08A3E] focus:outline-none transition-colors"
              >
                <option value="pounds">lbs</option>
                <option value="kg">kg</option>
              </select>
            </div>
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
              Height *
            </label>
            <div className="flex space-x-3">
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={heightUnit === 'feet' ? '5.8' : '175'}
                className={`flex-1 px-4 py-3 bg-[#0D1117] border rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:outline-none transition-colors ${
                  !height ? 'border-red-500 focus:border-red-400' : 'border-[#2B3440] focus:border-[#F08A3E]'
                }`}
                required
              />
              <select
                value={heightUnit}
                onChange={(e) => setHeightUnit(e.target.value as 'cm' | 'feet')}
                className="px-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] focus:border-[#F08A3E] focus:outline-none transition-colors"
              >
                <option value="feet">ft</option>
                <option value="cm">cm</option>
              </select>
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
              Age *
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="25"
              className={`w-full px-4 py-3 bg-[#0D1117] border rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:outline-none transition-colors ${
                !age ? 'border-red-500 focus:border-red-400' : 'border-[#2B3440] focus:border-[#F08A3E]'
              }`}
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-[#F3F4F6] mb-2">
              Gender *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['male', 'female', 'other'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGender(option)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all capitalize border ${
                    gender === option
                      ? 'bg-[#F08A3E] text-white border-[#F08A3E]'
                      : !gender 
                        ? 'bg-[#161B22] text-[#CBD5E1] hover:bg-[#2B3440] border-red-500'
                        : 'bg-[#161B22] text-[#CBD5E1] hover:bg-[#2B3440] border-[#2B3440]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Validation Message */}
          {(!weight || !height || !age || !gender) && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">
                Please fill in all required fields to continue
              </p>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!weight || !height || !age || !gender}
            className="w-full bg-[#F08A3E] hover:bg-[#E17226] disabled:bg-[#2B3440] disabled:text-[#CBD5E1] disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};