import React, { useState } from 'react';
import { Dumbbell, Watch, Smartphone, Scale, Bluetooth, CheckCircle, AlertCircle, SkipForward } from 'lucide-react';
import { EquipmentType } from '../../types/strength';

interface StrengthDevicePairingScreenProps {
  onComplete: (equipment: EquipmentType[]) => void;
  onSkip: () => void;
}

const availableEquipment = [
  {
    type: 'gym_access' as const,
    name: 'Gym Access',
    icon: Dumbbell,
    description: 'Full gym with all equipment available',
    color: '#EF4444',
    recommended: true
  },
  {
    type: 'dumbbells' as const,
    name: 'Dumbbells',
    icon: Dumbbell,
    description: 'Adjustable or fixed weight dumbbells',
    color: '#3B82F6',
    recommended: true
  },
  {
    type: 'resistance_bands' as const,
    name: 'Resistance Bands',
    icon: Dumbbell,
    description: 'Portable resistance training equipment',
    color: '#10B981',
    recommended: true
  },
  {
    type: 'barbell' as const,
    name: 'Barbell',
    icon: Dumbbell,
    description: 'Olympic barbell with weight plates',
    color: '#F59E0B',
    recommended: false
  },
  {
    type: 'kettlebells' as const,
    name: 'Kettlebells',
    icon: Dumbbell,
    description: 'Various weight kettlebells',
    color: '#8B5CF6',
    recommended: false
  },
  {
    type: 'pull_up_bar' as const,
    name: 'Pull-up Bar',
    icon: Dumbbell,
    description: 'Doorway or wall-mounted pull-up bar',
    color: '#06B6D4',
    recommended: false
  },
  {
    type: 'bodyweight_only' as const,
    name: 'Bodyweight Only',
    icon: Dumbbell,
    description: 'No equipment needed - use your body weight',
    color: '#84CC16',
    recommended: true
  }
];

export const StrengthDevicePairingScreen: React.FC<StrengthDevicePairingScreenProps> = ({
  onComplete,
  onSkip
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType[]>([]);

  const toggleEquipment = (equipmentType: EquipmentType) => {
    if (selectedEquipment.includes(equipmentType)) {
      setSelectedEquipment(prev => prev.filter(e => e !== equipmentType));
    } else {
      setSelectedEquipment(prev => [...prev, equipmentType]);
    }
  };

  const handleComplete = () => {
    onComplete(selectedEquipment);
  };

  return (
    <div className="min-h-screen bg-[#0D1117] py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#EF4444] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Available Equipment</h2>
          <p className="text-[#CBD5E1]">
            Select the equipment you have access to for strength training
          </p>
        </div>

        {/* Equipment Selection */}
        <div className="space-y-4 mb-8">
          {availableEquipment.map((equipment) => {
            const Icon = equipment.icon;
            const isSelected = selectedEquipment.includes(equipment.type);
            
            return (
              <button
                key={equipment.type}
                onClick={() => toggleEquipment(equipment.type)}
                className={`
                  w-full p-4 rounded-2xl border-2 transition-all text-left relative
                  ${isSelected 
                    ? 'border-[#EF4444] bg-[#EF4444]/10' 
                    : 'border-[#2B3440] bg-[#161B22] hover:border-[#EF4444]/50'
                  }
                `}
              >
                {/* Recommended Badge */}
                {equipment.recommended && (
                  <div className="absolute top-2 right-2 bg-[#F59E0B] text-white px-2 py-1 rounded-full text-xs font-medium">
                    Popular
                  </div>
                )}

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-8 h-8 bg-[#EF4444] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  <div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center`}
                    style={{ backgroundColor: `${equipment.color}20`, color: equipment.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#F3F4F6]">{equipment.name}</h3>
                    <p className="text-sm text-[#CBD5E1]">{equipment.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Equipment Summary */}
        {selectedEquipment.length > 0 && (
          <div className="bg-[#161B22] rounded-2xl p-4 border border-[#2B3440] mb-6">
            <h3 className="text-sm font-medium text-[#F3F4F6] mb-3">Selected Equipment</h3>
            <div className="flex flex-wrap gap-2">
              {selectedEquipment.map((equipment) => {
                const equipmentData = availableEquipment.find(e => e.type === equipment);
                return (
                  <span
                    key={equipment}
                    className="px-3 py-1 bg-[#EF4444]/20 text-[#EF4444] rounded-full text-sm font-medium"
                  >
                    {equipmentData?.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {selectedEquipment.length > 0 && (
            <button
              onClick={handleComplete}
              className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Dumbbell className="w-5 h-5" />
              <span>Continue with Selected Equipment</span>
            </button>
          )}

          <button
            onClick={onSkip}
            className="w-full text-[#CBD5E1] font-medium py-3 px-4 rounded-xl hover:bg-[#161B22] transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <SkipForward className="w-4 h-4" />
            <span>Skip Equipment Setup</span>
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-[#161B22] rounded-xl border border-[#2B3440]">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-[#F59E0B] mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-[#F3F4F6] mb-1">Equipment Tips</h4>
              <ul className="text-xs text-[#CBD5E1] space-y-1">
                <li>• Select all equipment you have access to</li>
                <li>• Bodyweight exercises work great for beginners</li>
                <li>• You can update equipment availability anytime</li>
                <li>• More equipment = more exercise variety</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};