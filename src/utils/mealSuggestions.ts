import { MealSuggestion, DietaryPreferences } from '../types/weightLoss';
import { FoodParser } from './foodDatabase';

export class MealSuggestionEngine {
  private static vegetarianMeals: { [key: string]: MealSuggestion[] } = {
    breakfast: [
      {
        id: 'veg-oats',
        mealType: 'breakfast',
        name: 'Vegetable Oats',
        description: 'Nutritious oats cooked with mixed vegetables and spices',
        calories: 250,
        protein: 8,
        ingredients: ['Oats (40g)', 'Mixed vegetables (100g)', 'Milk (100ml)', 'Spices'],
        preparationTime: 15,
        difficulty: 'easy',
        dietaryTags: ['vegetarian']
      },
      {
        id: 'paneer-paratha',
        mealType: 'breakfast',
        name: 'Paneer Paratha',
        description: 'Whole wheat flatbread stuffed with spiced cottage cheese',
        calories: 320,
        protein: 15,
        ingredients: ['Whole wheat flour (60g)', 'Paneer (50g)', 'Spices', 'Oil (1 tsp)'],
        preparationTime: 25,
        difficulty: 'medium',
        dietaryTags: ['vegetarian']
      },
      {
        id: 'fruit-yogurt',
        mealType: 'breakfast',
        name: 'Fruit Yogurt Bowl',
        description: 'Greek yogurt topped with fresh fruits and nuts',
        calories: 200,
        protein: 12,
        ingredients: ['Greek yogurt (150g)', 'Mixed fruits (100g)', 'Almonds (10g)', 'Honey (1 tsp)'],
        preparationTime: 5,
        difficulty: 'easy',
        dietaryTags: ['vegetarian']
      }
    ],
    lunch: [
      {
        id: 'dal-rice',
        mealType: 'lunch',
        name: 'Dal Rice Bowl',
        description: 'Protein-rich lentils with brown rice and vegetables',
        calories: 380,
        protein: 18,
        ingredients: ['Brown rice (75g)', 'Mixed dal (50g)', 'Vegetables (100g)', 'Spices'],
        preparationTime: 30,
        difficulty: 'medium',
        dietaryTags: ['vegetarian']
      },
      {
        id: 'quinoa-salad',
        mealType: 'lunch',
        name: 'Quinoa Vegetable Salad',
        description: 'Nutritious quinoa mixed with fresh vegetables and herbs',
        calories: 350,
        protein: 14,
        ingredients: ['Quinoa (60g)', 'Mixed vegetables (150g)', 'Olive oil (1 tbsp)', 'Herbs'],
        preparationTime: 20,
        difficulty: 'easy',
        dietaryTags: ['vegetarian']
      }
    ],
    dinner: [
      {
        id: 'veg-curry',
        mealType: 'dinner',
        name: 'Mixed Vegetable Curry',
        description: 'Seasonal vegetables cooked in aromatic spices with chapati',
        calories: 300,
        protein: 10,
        ingredients: ['Mixed vegetables (200g)', 'Chapati (2 small)', 'Spices', 'Oil (1 tsp)'],
        preparationTime: 25,
        difficulty: 'medium',
        dietaryTags: ['vegetarian']
      }
    ],
    snack: [
      {
        id: 'roasted-chana',
        mealType: 'snack',
        name: 'Roasted Chickpeas',
        description: 'Crunchy roasted chickpeas with spices',
        calories: 120,
        protein: 6,
        ingredients: ['Chickpeas (30g)', 'Spices', 'Lemon juice'],
        preparationTime: 5,
        difficulty: 'easy',
        dietaryTags: ['vegetarian']
      }
    ]
  };

  private static nonVegetarianMeals: { [key: string]: MealSuggestion[] } = {
    breakfast: [
      {
        id: 'egg-toast',
        mealType: 'breakfast',
        name: 'Scrambled Eggs with Toast',
        description: 'Protein-rich scrambled eggs with whole grain toast',
        calories: 280,
        protein: 20,
        ingredients: ['Eggs (2 large)', 'Whole grain bread (2 slices)', 'Butter (1 tsp)', 'Spices'],
        preparationTime: 10,
        difficulty: 'easy',
        dietaryTags: ['non_vegetarian']
      },
      {
        id: 'chicken-sandwich',
        mealType: 'breakfast',
        name: 'Grilled Chicken Sandwich',
        description: 'Lean grilled chicken breast in whole wheat bread',
        calories: 350,
        protein: 25,
        ingredients: ['Chicken breast (80g)', 'Whole wheat bread (2 slices)', 'Vegetables', 'Mustard'],
        preparationTime: 15,
        difficulty: 'medium',
        dietaryTags: ['non_vegetarian']
      }
    ],
    lunch: [
      {
        id: 'chicken-rice',
        mealType: 'lunch',
        name: 'Chicken Rice Bowl',
        description: 'Grilled chicken with brown rice and steamed vegetables',
        calories: 420,
        protein: 35,
        ingredients: ['Chicken breast (100g)', 'Brown rice (75g)', 'Steamed vegetables (100g)', 'Herbs'],
        preparationTime: 25,
        difficulty: 'medium',
        dietaryTags: ['non_vegetarian']
      },
      {
        id: 'fish-curry',
        mealType: 'lunch',
        name: 'Fish Curry with Rice',
        description: 'Fresh fish cooked in coconut curry with rice',
        calories: 400,
        protein: 30,
        ingredients: ['Fish (120g)', 'Brown rice (60g)', 'Coconut milk (50ml)', 'Spices'],
        preparationTime: 30,
        difficulty: 'medium',
        dietaryTags: ['non_vegetarian']
      }
    ],
    dinner: [
      {
        id: 'grilled-chicken',
        mealType: 'dinner',
        name: 'Grilled Chicken Salad',
        description: 'Lean grilled chicken with mixed green salad',
        calories: 320,
        protein: 28,
        ingredients: ['Chicken breast (100g)', 'Mixed greens (150g)', 'Olive oil (1 tbsp)', 'Lemon'],
        preparationTime: 20,
        difficulty: 'easy',
        dietaryTags: ['non_vegetarian']
      }
    ],
    snack: [
      {
        id: 'boiled-eggs',
        mealType: 'snack',
        name: 'Boiled Eggs',
        description: 'Simple boiled eggs with a pinch of salt and pepper',
        calories: 140,
        protein: 12,
        ingredients: ['Eggs (2 medium)', 'Salt', 'Black pepper'],
        preparationTime: 10,
        difficulty: 'easy',
        dietaryTags: ['non_vegetarian']
      }
    ]
  };

  private static eggetarianMeals: { [key: string]: MealSuggestion[] } = {
    breakfast: [
      {
        id: 'egg-paratha',
        mealType: 'breakfast',
        name: 'Egg Paratha',
        description: 'Whole wheat flatbread with scrambled egg filling',
        calories: 300,
        protein: 18,
        ingredients: ['Whole wheat flour (60g)', 'Eggs (2 medium)', 'Spices', 'Oil (1 tsp)'],
        preparationTime: 20,
        difficulty: 'medium',
        dietaryTags: ['eggetarian']
      },
      {
        id: 'egg-omelette',
        mealType: 'breakfast',
        name: 'Vegetable Omelette',
        description: 'Fluffy omelette with mixed vegetables',
        calories: 220,
        protein: 16,
        ingredients: ['Eggs (2 large)', 'Mixed vegetables (50g)', 'Spices', 'Oil (1 tsp)'],
        preparationTime: 12,
        difficulty: 'easy',
        dietaryTags: ['eggetarian']
      }
    ],
    lunch: [
      {
        id: 'egg-curry-rice',
        mealType: 'lunch',
        name: 'Egg Curry with Rice',
        description: 'Spiced egg curry served with brown rice',
        calories: 380,
        protein: 22,
        ingredients: ['Eggs (2 large)', 'Brown rice (75g)', 'Onion-tomato gravy', 'Spices'],
        preparationTime: 25,
        difficulty: 'medium',
        dietaryTags: ['eggetarian']
      }
    ],
    dinner: [
      {
        id: 'egg-fried-rice',
        mealType: 'dinner',
        name: 'Egg Fried Rice',
        description: 'Healthy fried rice with scrambled eggs and vegetables',
        calories: 340,
        protein: 15,
        ingredients: ['Brown rice (80g)', 'Eggs (1 large)', 'Mixed vegetables (100g)', 'Soy sauce'],
        preparationTime: 18,
        difficulty: 'easy',
        dietaryTags: ['eggetarian']
      }
    ],
    snack: [
      {
        id: 'egg-bhurji',
        mealType: 'snack',
        name: 'Egg Bhurji',
        description: 'Spiced scrambled eggs Indian style',
        calories: 160,
        protein: 14,
        ingredients: ['Eggs (2 medium)', 'Onions', 'Tomatoes', 'Spices'],
        preparationTime: 10,
        difficulty: 'easy',
        dietaryTags: ['eggetarian']
      }
    ]
  };

  static generateMealSuggestions(
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    targetCalories: number,
    preferences: DietaryPreferences,
    previousMeals: string[] = []
  ): MealSuggestion[] {
    let mealPool: MealSuggestion[] = [];

    // Select meal pool based on dietary preference
    switch (preferences.type) {
      case 'vegetarian':
        mealPool = this.vegetarianMeals[mealType] || [];
        break;
      case 'non_vegetarian':
        mealPool = [...(this.nonVegetarianMeals[mealType] || []), ...(this.vegetarianMeals[mealType] || [])];
        break;
      case 'eggetarian':
        mealPool = [...(this.eggetarianMeals[mealType] || []), ...(this.vegetarianMeals[mealType] || [])];
        break;
    }

    // Filter out recently consumed meals
    const availableMeals = mealPool.filter(meal => !previousMeals.includes(meal.id));

    // Sort by calorie proximity to target
    const sortedMeals = availableMeals.sort((a, b) => {
      const diffA = Math.abs(a.calories - targetCalories);
      const diffB = Math.abs(b.calories - targetCalories);
      return diffA - diffB;
    });

    // Return top 3 suggestions
    return sortedMeals.slice(0, 3);
  }

  static generatePersonalizedSuggestion(
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    remainingCalories: number,
    preferences: DietaryPreferences,
    recentFoods: string[],
    timeOfDay: number
  ): string {
    const suggestions = this.generateMealSuggestions(mealType, remainingCalories, preferences, recentFoods);
    
    if (suggestions.length === 0) {
      return `You have ${remainingCalories} calories remaining for ${mealType}. Try a light, balanced meal with protein and vegetables.`;
    }

    const topSuggestion = suggestions[0];
    const alternatives = suggestions.slice(1, 3);

    let message = `You have ${remainingCalories} calories left for ${mealType}. Here's what I recommend:\n\n`;
    message += `🍽️ **${topSuggestion.name}** (${topSuggestion.calories} cal)\n`;
    message += `${topSuggestion.description}\n`;
    message += `⏱️ ${topSuggestion.preparationTime} minutes | 💪 ${topSuggestion.protein}g protein\n\n`;

    if (alternatives.length > 0) {
      message += `**Other options:**\n`;
      alternatives.forEach(meal => {
        message += `• ${meal.name} (${meal.calories} cal)\n`;
      });
    }

    // Add contextual advice based on time and remaining calories
    if (remainingCalories < 200) {
      message += `\n💡 Since you're close to your calorie goal, focus on protein-rich, low-calorie options.`;
    } else if (remainingCalories > 500) {
      message += `\n💡 You have room for a substantial meal. Include healthy fats and complex carbs for sustained energy.`;
    }

    return message;
  }

  static getEmergencyMealSuggestion(caloriesOver: number, nextMealType: string): string {
    const suggestions = [
      "Have a large salad with lean protein and light dressing",
      "Try vegetable soup with a small portion of whole grains",
      "Opt for grilled vegetables with a palm-sized portion of protein",
      "Consider a protein smoothie with spinach and berries",
      "Have steamed vegetables with tofu or paneer"
    ];

    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

    return `You're ${caloriesOver} calories over today's target. For ${nextMealType}, try: ${randomSuggestion}. This will help balance your daily intake while keeping you satisfied.`;
  }

  static generateWeeklyMealPlan(
    dailyCalories: number,
    preferences: DietaryPreferences
  ): { [day: string]: { [meal: string]: MealSuggestion } } {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const meals = ['breakfast', 'lunch', 'dinner', 'snack'];
    const mealCalories = {
      breakfast: Math.round(dailyCalories * 0.25),
      lunch: Math.round(dailyCalories * 0.35),
      dinner: Math.round(dailyCalories * 0.30),
      snack: Math.round(dailyCalories * 0.10)
    };

    const weeklyPlan: { [day: string]: { [meal: string]: MealSuggestion } } = {};
    const usedMeals: string[] = [];

    days.forEach(day => {
      weeklyPlan[day] = {};
      meals.forEach(meal => {
        const suggestions = this.generateMealSuggestions(
          meal as any,
          mealCalories[meal as keyof typeof mealCalories],
          preferences,
          usedMeals
        );
        
        if (suggestions.length > 0) {
          weeklyPlan[day][meal] = suggestions[0];
          usedMeals.push(suggestions[0].id);
          
          // Reset used meals every 3 days to allow variety
          if (usedMeals.length > 15) {
            usedMeals.splice(0, 5);
          }
        }
      });
    });

    return weeklyPlan;
  }
}