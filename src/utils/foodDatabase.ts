import { FoodDatabase, FoodItem, CommonPortion } from '../types/weightLoss';

export const foodDatabase: FoodDatabase[] = [
  // Proteins
  {
    id: 'chicken-breast',
    foodName: 'Chicken Breast',
    caloriesPer100g: 165,
    proteinPer100g: 31,
    carbsPer100g: 0,
    fatPer100g: 3.6,
    category: 'protein',
    dietaryTags: ['non_vegetarian'],
    commonPortions: [
      { name: 'Small piece', grams: 85, description: '3 oz serving' },
      { name: 'Medium piece', grams: 113, description: '4 oz serving' },
      { name: 'Large piece', grams: 170, description: '6 oz serving' }
    ]
  },
  {
    id: 'eggs',
    foodName: 'Eggs',
    caloriesPer100g: 155,
    proteinPer100g: 13,
    carbsPer100g: 1.1,
    fatPer100g: 11,
    category: 'protein',
    dietaryTags: ['eggetarian'],
    commonPortions: [
      { name: '1 large egg', grams: 50, description: 'One large egg' },
      { name: '2 eggs', grams: 100, description: 'Two large eggs' },
      { name: '3 eggs', grams: 150, description: 'Three large eggs' }
    ]
  },
  {
    id: 'paneer',
    foodName: 'Paneer',
    caloriesPer100g: 265,
    proteinPer100g: 18,
    carbsPer100g: 1.2,
    fatPer100g: 20,
    category: 'protein',
    dietaryTags: ['vegetarian'],
    commonPortions: [
      { name: 'Small cube', grams: 30, description: '1 inch cube' },
      { name: 'Medium serving', grams: 50, description: '2-3 cubes' },
      { name: 'Large serving', grams: 100, description: '1/2 cup cubes' }
    ]
  },
  
  // Carbohydrates
  {
    id: 'brown-rice',
    foodName: 'Brown Rice',
    caloriesPer100g: 111,
    proteinPer100g: 2.6,
    carbsPer100g: 23,
    fatPer100g: 0.9,
    category: 'carbs',
    dietaryTags: ['vegetarian', 'vegan'],
    commonPortions: [
      { name: 'Small bowl', grams: 75, description: '1/3 cup cooked' },
      { name: 'Medium bowl', grams: 150, description: '2/3 cup cooked' },
      { name: 'Large bowl', grams: 200, description: '1 cup cooked' }
    ]
  },
  {
    id: 'chapati',
    foodName: 'Chapati',
    caloriesPer100g: 297,
    proteinPer100g: 11,
    carbsPer100g: 58,
    fatPer100g: 4,
    category: 'carbs',
    dietaryTags: ['vegetarian'],
    commonPortions: [
      { name: '1 small chapati', grams: 25, description: '6 inch diameter' },
      { name: '1 medium chapati', grams: 35, description: '7 inch diameter' },
      { name: '1 large chapati', grams: 50, description: '8 inch diameter' }
    ]
  },
  
  // Vegetables
  {
    id: 'broccoli',
    foodName: 'Broccoli',
    caloriesPer100g: 34,
    proteinPer100g: 2.8,
    carbsPer100g: 7,
    fatPer100g: 0.4,
    category: 'vegetables',
    dietaryTags: ['vegetarian', 'vegan'],
    commonPortions: [
      { name: 'Small serving', grams: 75, description: '1/2 cup' },
      { name: 'Medium serving', grams: 150, description: '1 cup' },
      { name: 'Large serving', grams: 200, description: '1.5 cups' }
    ]
  },
  
  // Fruits
  {
    id: 'apple',
    foodName: 'Apple',
    caloriesPer100g: 52,
    proteinPer100g: 0.3,
    carbsPer100g: 14,
    fatPer100g: 0.2,
    category: 'fruits',
    dietaryTags: ['vegetarian', 'vegan'],
    commonPortions: [
      { name: '1 small apple', grams: 150, description: 'Small apple' },
      { name: '1 medium apple', grams: 180, description: 'Medium apple' },
      { name: '1 large apple', grams: 220, description: 'Large apple' }
    ]
  },
  
  // Dairy
  {
    id: 'greek-yogurt',
    foodName: 'Greek Yogurt',
    caloriesPer100g: 59,
    proteinPer100g: 10,
    carbsPer100g: 3.6,
    fatPer100g: 0.4,
    category: 'dairy',
    dietaryTags: ['vegetarian'],
    commonPortions: [
      { name: 'Small cup', grams: 100, description: '1/2 cup' },
      { name: 'Medium cup', grams: 170, description: '3/4 cup' },
      { name: 'Large cup', grams: 225, description: '1 cup' }
    ]
  }
];

export class FoodParser {
  static parseVoiceInput(input: string): { foodItems: FoodItem[]; confidence: number } {
    const lowerInput = input.toLowerCase();
    const foodItems: FoodItem[] = [];
    let totalConfidence = 0;
    let matchCount = 0;

    // Common quantity patterns
    const quantityPatterns = [
      /(\d+)\s*(cups?|cup)\s+of\s+([a-zA-Z\s]+)/g,
      /(\d+)\s*(pieces?|piece)\s+of\s+([a-zA-Z\s]+)/g,
      /(\d+)\s*(slices?|slice)\s+of\s+([a-zA-Z\s]+)/g,
      /(\d+)\s*([a-zA-Z\s]+)/g,
      /(one|two|three|four|five)\s+([a-zA-Z\s]+)/g,
      /(a|an)\s+([a-zA-Z\s]+)/g
    ];

    // Try to match food items from database
    for (const food of foodDatabase) {
      const foodNameLower = food.foodName.toLowerCase();
      
      if (lowerInput.includes(foodNameLower)) {
        // Try to extract quantity
        let quantity = 100; // default 100g
        let unit = 'grams';
        let confidence = 0.8;

        // Look for quantity patterns
        for (const pattern of quantityPatterns) {
          const matches = [...lowerInput.matchAll(pattern)];
          for (const match of matches) {
            if (match[0].includes(foodNameLower)) {
              const numStr = match[1];
              const num = this.parseNumber(numStr);
              if (num > 0) {
                // Find appropriate portion
                const portion = this.findBestPortion(food, match[2] || 'serving', num);
                quantity = portion.grams;
                confidence = 0.9;
                break;
              }
            }
          }
        }

        const calories = Math.round((food.caloriesPer100g * quantity) / 100);
        const protein = Math.round((food.proteinPer100g * quantity) / 100);
        const carbs = Math.round((food.carbsPer100g * quantity) / 100);
        const fat = Math.round((food.fatPer100g * quantity) / 100);

        foodItems.push({
          id: food.id,
          name: food.foodName,
          quantity,
          unit,
          calories,
          protein,
          carbs,
          fat
        });

        totalConfidence += confidence;
        matchCount++;
      }
    }

    const averageConfidence = matchCount > 0 ? totalConfidence / matchCount : 0;

    return {
      foodItems,
      confidence: averageConfidence
    };
  }

  private static parseNumber(str: string): number {
    const numberWords: { [key: string]: number } = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'a': 1, 'an': 1
    };

    const num = parseInt(str);
    if (!isNaN(num)) return num;
    
    return numberWords[str.toLowerCase()] || 1;
  }

  private static findBestPortion(food: FoodDatabase, unit: string, quantity: number): CommonPortion {
    const unitLower = unit.toLowerCase();
    
    // Try to find matching portion
    for (const portion of food.commonPortions) {
      if (portion.name.toLowerCase().includes(unitLower) || 
          portion.description.toLowerCase().includes(unitLower)) {
        return { ...portion, grams: portion.grams * quantity };
      }
    }

    // Default to medium portion scaled by quantity
    const defaultPortion = food.commonPortions[1] || food.commonPortions[0];
    return { ...defaultPortion, grams: defaultPortion.grams * quantity };
  }

  static searchFood(query: string): FoodDatabase[] {
    const queryLower = query.toLowerCase();
    return foodDatabase.filter(food => 
      food.foodName.toLowerCase().includes(queryLower) ||
      food.category.toLowerCase().includes(queryLower)
    ).slice(0, 10);
  }

  static getFoodById(id: string): FoodDatabase | undefined {
    return foodDatabase.find(food => food.id === id);
  }

  static getFoodsByCategory(category: string): FoodDatabase[] {
    return foodDatabase.filter(food => food.category === category);
  }

  static getFoodsByDietaryPreference(preference: string): FoodDatabase[] {
    return foodDatabase.filter(food => 
      food.dietaryTags.includes(preference) || 
      (preference === 'non_vegetarian' && !food.dietaryTags.includes('vegetarian'))
    );
  }
}