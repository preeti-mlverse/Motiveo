import React, { useState } from 'react';
import { Mic, Plus, Search, Camera, Clock, Utensils, Sparkles } from 'lucide-react';
import { VoiceInput } from '../common/VoiceInput';
import { FoodParser } from '../../utils/foodDatabase';
import { MealLog, FoodItem } from '../../types/weightLoss';
import { MealSuggestionEngine } from '../../utils/mealSuggestions';
import { aiService, isAIReady } from '../../services/aiService';

interface MealLoggingProps {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  targetCalories: number;
  currentCalories: number;
  onMealLogged: (meal: MealLog) => void;
  onClose: () => void;
}

export const MealLogging: React.FC<MealLoggingProps> = ({
  mealType,
  targetCalories,
  currentCalories,
  onMealLogged,
  onClose
}) => {
  const [loggedFoods, setLoggedFoods] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [voiceConfirmation, setVoiceConfirmation] = useState<{
    foods: FoodItem[];
    confidence: number;
  } | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  const totalCalories = loggedFoods.reduce((sum, food) => sum + food.calories, 0);
  const totalProtein = loggedFoods.reduce((sum, food) => sum + food.protein, 0);
  const remainingCalories = targetCalories - totalCalories;

  // Generate AI suggestions when modal opens
  React.useEffect(() => {
    if (loggedFoods.length === 0) {
      generateAISuggestions();
    }
  }, [mealType, targetCalories]);

  const generateAISuggestions = async () => {
    console.log('🤖 Generating meal suggestions...');
    
    if (isAIReady()) {
      console.log('🤖 Using AI service for suggestions');
      try {
        const suggestions = await aiService.generateMealSuggestions({
          remainingCalories: targetCalories,
          mealType,
          dietaryPreferences: {
            type: 'vegetarian',
            allergies: [],
            dislikes: []
          },
          timeOfDay: new Date().getHours(),
          recentMeals: []
        });
        setAiSuggestions(suggestions);
      } catch (error) {
        console.warn('AI suggestions failed, using fallback:', error.message);
        // Fall back to static suggestions
        const fallbackSuggestions = MealSuggestionEngine.generateMealSuggestions(
          mealType,
          targetCalories,
          { type: 'vegetarian', allergies: [], dislikes: [], preferredFoods: [] },
          []
        );
        setAiSuggestions(fallbackSuggestions);
      }
    } else {
      console.log('🤖 AI not configured, using static suggestions');
      // Use static suggestions when AI is not configured
      const suggestions = MealSuggestionEngine.generateMealSuggestions(
        mealType,
        targetCalories,
        { type: 'vegetarian', allergies: [], dislikes: [], preferredFoods: [] },
        []
      );
      setAiSuggestions(suggestions);
    }
  };

  const handleVoiceInput = (data: any) => {
    if (isAIReady()) {
      handleAIVoiceInput(data);
    } else {
      handleFallbackVoiceInput(data);
    }
  };

  const handleAIVoiceInput = async (data: any) => {
    try {
      const parsed = await aiService.parseVoiceInput({
        voiceInput: data.originalText,
        confidence: 0.8
      });
      
      if (parsed.confidence > 0.7 && parsed.foodItems.length > 0) {
        setLoggedFoods(prev => [...prev, ...parsed.foodItems]);
      } else if (parsed.foodItems.length > 0) {
        setVoiceConfirmation({
          foods: parsed.foodItems,
          confidence: parsed.confidence
        });
      }
    } catch (error) {
      console.error('AI voice parsing failed:', error);
      handleFallbackVoiceInput(data);
    }
  };

  const handleFallbackVoiceInput = (data: any) => {
    const parsed = FoodParser.parseVoiceInput(data.originalText);
    
    if (parsed.confidence > 0.7 && parsed.foodItems.length > 0) {
      setLoggedFoods(prev => [...prev, ...parsed.foodItems]);
    } else if (parsed.foodItems.length > 0) {
      setVoiceConfirmation(parsed);
    }
  };

  const confirmVoiceInput = (confirmed: boolean) => {
    if (confirmed && voiceConfirmation) {
      setLoggedFoods(prev => [...prev, ...voiceConfirmation.foods]);
    }
    setVoiceConfirmation(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const results = FoodParser.searchFood(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const addFoodFromSearch = (food: any, portion: any) => {
    const calories = Math.round((food.caloriesPer100g * portion.grams) / 100);
    const protein = Math.round((food.proteinPer100g * portion.grams) / 100);
    const carbs = Math.round((food.carbsPer100g * portion.grams) / 100);
    const fat = Math.round((food.fatPer100g * portion.grams) / 100);

    const foodItem: FoodItem = {
      id: food.id,
      name: food.foodName,
      quantity: portion.grams,
      unit: 'grams',
      calories,
      protein,
      carbs,
      fat
    };

    setLoggedFoods(prev => [...prev, foodItem]);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const addAISuggestion = (suggestion: any) => {
    const foodItems: FoodItem[] = suggestion.ingredients.map((ingredient: string, index: number) => ({
      id: `ai-${suggestion.id}-${index}`,
      name: ingredient,
      quantity: 100, // Default portion
      unit: 'grams',
      calories: Math.round(suggestion.calories / suggestion.ingredients.length),
      protein: Math.round(suggestion.protein / suggestion.ingredients.length),
      carbs: 0,
      fat: 0
    }));
    
    setLoggedFoods(prev => [...prev, ...foodItems]);
    setShowAISuggestions(false);
  };

  const removeFoodItem = (index: number) => {
    setLoggedFoods(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveMeal = () => {
    if (loggedFoods.length === 0) {
      console.warn('⚠️ No foods to save');
      return;
    }
    
    console.log('🍽️ MealLogging: Saving meal with foods:', loggedFoods);
    console.log('🍽️ MealLogging: Total calories calculated:', totalCalories);
    
    const meal: MealLog = {
      id: Date.now().toString(),
      goalId: 'weight-loss-goal',
      mealType,
      loggedDate: new Date(), // This should be today's date
      plannedCalories: targetCalories,
      actualCalories: totalCalories,
      foodsConsumed: loggedFoods,
      aiSuggested: false,
      userFollowed: false,
      createdAt: new Date()
    };

    console.log('💾 MealLogging: Final meal object:', meal);
    
    // Call the parent handler to save the meal
    onMealLogged(meal);
  };

  const handleSave = () => {
    handleSaveMeal();
  };
  const getMealIcon = () => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
    }
  };

  const quickFoods = {
    breakfast: ['Oats', 'Eggs', 'Bread', 'Milk', 'Banana'],
    lunch: ['Rice', 'Chapati', 'Dal', 'Chicken', 'Vegetables'],
    dinner: ['Salad', 'Soup', 'Fish', 'Quinoa', 'Paneer'],
    snack: ['Apple', 'Nuts', 'Yogurt', 'Biscuits', 'Tea']
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#161B22] rounded-2xl border border-[#2B3440] w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#2B3440]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#F08A3E] rounded-xl flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F3F4F6] capitalize">
                  {getMealIcon()} {mealType}
                </h2>
                <p className="text-sm text-[#CBD5E1]">Target: {targetCalories} calories</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-[#2B3440] hover:bg-[#0D1117] rounded-lg flex items-center justify-center text-[#CBD5E1] transition-colors"
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#2B3440] rounded-full h-2 mb-2">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                totalCalories > targetCalories ? 'bg-[#F08A3E]' : 'bg-[#4BE0D1]'
              }`}
              style={{ width: `${Math.min((totalCalories / targetCalories) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#CBD5E1]">{totalCalories} / {targetCalories} cal</span>
            <span className="text-[#6BD0D2]">{totalProtein}g protein</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Voice Input */}
          <div className="mb-6">
            <VoiceInput
              goalType="weight_loss"
              onVoiceInput={handleVoiceInput}
              placeholder={`Say what you had for ${mealType}...`}
              className="w-full"
            />
          </div>

          {/* Voice Confirmation */}
          {voiceConfirmation && (
            <div className="mb-6 p-4 bg-[#F08A3E]/10 border border-[#F08A3E]/30 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#F08A3E]">
                  Confirm Voice Input ({Math.round(voiceConfirmation.confidence * 100)}% confidence)
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {voiceConfirmation.foods.map((food, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-[#F3F4F6]">{food.name} ({food.quantity}g)</span>
                    <span className="text-[#6BD0D2]">{food.calories} cal</span>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => confirmVoiceInput(true)}
                  className="flex-1 bg-[#4BE0D1] hover:bg-[#6BD0D2] text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => confirmVoiceInput(false)}
                  className="flex-1 bg-[#2B3440] hover:bg-[#0D1117] text-[#CBD5E1] py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && loggedFoods.length === 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[#F3F4F6] flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#F8B84E]" />
                  <span>AI Suggestions</span>
                </h3>
                <button
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                  className="text-xs text-[#6BD0D2] hover:text-[#4BE0D1]"
                >
                  {showAISuggestions ? 'Hide' : 'Show All'}
                </button>
              </div>
              
              <div className="space-y-2">
                {(showAISuggestions ? aiSuggestions : aiSuggestions.slice(0, 2)).map((suggestion) => (
                  <div key={suggestion.id} className="p-3 bg-[#F8B84E]/10 border border-[#F8B84E]/30 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-[#F3F4F6]">{suggestion.name}</h4>
                        <p className="text-sm text-[#CBD5E1] mb-1">{suggestion.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-[#CBD5E1]">
                          <span>{suggestion.calories} cal</span>
                          <span>{suggestion.protein}g protein</span>
                          <span>{suggestion.preparationTime} min</span>
                        </div>
                      </div>
                      <button
                        onClick={() => addAISuggestion(suggestion)}
                        className="px-3 py-1 bg-[#F8B84E] hover:bg-[#F8B84E]/80 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Add Options */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[#F3F4F6] mb-3">Quick Add</h3>
            <div className="flex flex-wrap gap-2">
              {quickFoods[mealType].map((food) => (
                <button
                  key={food}
                  onClick={() => handleSearch(food)}
                  className="px-3 py-2 bg-[#0D1117] hover:bg-[#2B3440] border border-[#2B3440] text-[#CBD5E1] rounded-lg text-sm transition-colors"
                >
                  {food}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#CBD5E1]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search foods..."
                  className="w-full pl-10 pr-4 py-3 bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#F3F4F6] placeholder-[#CBD5E1] focus:border-[#F08A3E] focus:outline-none"
                />
              </div>
              <button className="p-3 bg-[#2B3440] hover:bg-[#0D1117] border border-[#2B3440] rounded-xl text-[#CBD5E1] transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                {searchResults.map((food) => (
                  <div key={food.id} className="p-3 bg-[#0D1117] rounded-lg border border-[#2B3440]">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-[#F3F4F6]">{food.foodName}</span>
                      <span className="text-sm text-[#CBD5E1]">{food.caloriesPer100g} cal/100g</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {food.commonPortions.map((portion: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => addFoodFromSearch(food, portion)}
                          className="px-2 py-1 bg-[#F08A3E]/20 hover:bg-[#F08A3E]/30 text-[#F08A3E] rounded text-xs transition-colors"
                        >
                          {portion.name} ({Math.round((food.caloriesPer100g * portion.grams) / 100)} cal)
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logged Foods */}
          {loggedFoods.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-[#F3F4F6] mb-3">Added Foods</h3>
              <div className="space-y-2">
                {loggedFoods.map((food, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg border border-[#2B3440]">
                    <div className="flex-1">
                      <div className="font-medium text-[#F3F4F6]">{food.name}</div>
                      <div className="text-sm text-[#CBD5E1]">
                        {food.quantity}g • {food.calories} cal • {food.protein}g protein
                      </div>
                    </div>
                    <button
                      onClick={() => removeFoodItem(index)}
                      className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg flex items-center justify-center transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#2B3440]">
          {/* Summary before save */}
          {loggedFoods.length > 0 && (
            <div className="mb-4 p-3 bg-[#0D1117] rounded-xl">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#CBD5E1]">Total for this meal:</span>
                <div className="flex space-x-4">
                  <span className="text-[#F08A3E] font-semibold">{totalCalories} cal</span>
                  <span className="text-[#6BD0D2] font-semibold">{totalProtein}g protein</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-[#2B3440] hover:bg-[#0D1117] text-[#CBD5E1] font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loggedFoods.length === 0}
              className="flex-1 bg-[#F08A3E] hover:bg-[#E17226] disabled:bg-[#2B3440] disabled:text-[#CBD5E1] disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105 active:scale-95"
            >
              <span>{loggedFoods.length === 0 ? 'Add Foods First' : `Save ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`}</span>
              {totalCalories > 0 && (
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  {totalCalories} cal
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};