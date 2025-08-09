import { WeightLossProfile } from '../types/weightLoss';

export class CalorieCalculator {
  // Mifflin-St Jeor Equation for BMR calculation
  static calculateBMR(weight: number, height: number, age: number, gender: string): number {
    const baseCalories = 10 * weight + 6.25 * height - 5 * age;
    
    switch (gender) {
      case 'male':
        return baseCalories + 5;
      case 'female':
        return baseCalories - 161;
      case 'other':
        return baseCalories - 78; // Average of male/female
      default:
        return baseCalories - 78;
    }
  }

  // Activity level multipliers
  static getActivityMultiplier(activityLevel: string): number {
    const multipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };
    return multipliers[activityLevel as keyof typeof multipliers] || 1.2;
  }

  // Calculate Total Daily Energy Expenditure (TDEE)
  static calculateTDEE(bmr: number, activityLevel: string): number {
    return bmr * this.getActivityMultiplier(activityLevel);
  }

  // Calculate safe daily calorie target for weight loss
  static calculateDailyCalorieTarget(
    currentWeight: number,
    targetWeight: number,
    height: number,
    age: number,
    gender: string,
    activityLevel: string,
    timelineWeeks: number
  ): { dailyCalories: number; weeklyLossRate: number; isRealistic: boolean } {
    const bmr = this.calculateBMR(currentWeight, height, age, gender);
    const tdee = this.calculateTDEE(bmr, activityLevel);
    
    const totalWeightLoss = currentWeight - targetWeight;
    const weeklyLossRate = totalWeightLoss / timelineWeeks;
    
    // 1 pound = 3500 calories, so weekly deficit needed
    const weeklyDeficit = weeklyLossRate * 3500;
    const dailyDeficit = weeklyDeficit / 7;
    
    let dailyCalories = tdee - dailyDeficit;
    
    // Safety limits
    const minCalories = gender === 'female' ? 1200 : gender === 'male' ? 1500 : 1350;
    const maxDeficit = 750; // Maximum safe daily deficit
    
    // Check if realistic
    const isRealistic = weeklyLossRate <= 2 && dailyDeficit <= maxDeficit;
    
    // Apply safety limits
    if (dailyCalories < minCalories) {
      dailyCalories = minCalories;
    }
    
    // Recalculate actual weekly loss rate based on adjusted calories
    const actualDailyDeficit = tdee - dailyCalories;
    const actualWeeklyLossRate = (actualDailyDeficit * 7) / 3500;
    
    return {
      dailyCalories: Math.round(dailyCalories),
      weeklyLossRate: Math.round(actualWeeklyLossRate * 10) / 10,
      isRealistic
    };
  }

  // Calculate protein requirements (0.8-1.2g per kg body weight)
  static calculateProteinGoal(weight: number, activityLevel: string): number {
    const multipliers = {
      sedentary: 0.8,
      lightly_active: 0.9,
      moderately_active: 1.0,
      very_active: 1.1,
      extremely_active: 1.2
    };
    
    const multiplier = multipliers[activityLevel as keyof typeof multipliers] || 0.8;
    return Math.round(weight * multiplier);
  }

  // Distribute calories across meals
  static distributeMealCalories(totalCalories: number): {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  } {
    return {
      breakfast: Math.round(totalCalories * 0.25), // 25%
      lunch: Math.round(totalCalories * 0.35),     // 35%
      dinner: Math.round(totalCalories * 0.30),    // 30%
      snack: Math.round(totalCalories * 0.10)      // 10%
    };
  }

  // Calculate calories burned from exercise
  static calculateExerciseCalories(
    activityType: string,
    durationMinutes: number,
    weight: number,
    intensity: number
  ): number {
    // MET (Metabolic Equivalent) values for different activities
    const metValues: { [key: string]: number } = {
      walking: 3.5,
      jogging: 7.0,
      running: 9.8,
      cycling: 6.8,
      swimming: 8.0,
      weightlifting: 3.0,
      yoga: 2.5,
      dancing: 4.8,
      hiking: 6.0,
      elliptical: 5.0
    };

    const baseMET = metValues[activityType.toLowerCase()] || 4.0;
    const adjustedMET = baseMET * (intensity / 5); // Adjust for intensity (1-10 scale)
    
    // Calories = MET × weight(kg) × time(hours)
    return Math.round(adjustedMET * weight * (durationMinutes / 60));
  }

  // Detect weight loss plateau
  static detectPlateau(weightEntries: Array<{ weight: number; date: Date }>): {
    isPlateaued: boolean;
    stagnationDays: number;
    recommendation: string;
  } {
    if (weightEntries.length < 10) {
      return { isPlateaued: false, stagnationDays: 0, recommendation: '' };
    }

    // Sort by date
    const sortedEntries = weightEntries.sort((a, b) => a.date.getTime() - b.date.getTime());
    const recent10 = sortedEntries.slice(-10);
    
    const firstWeight = recent10[0].weight;
    const lastWeight = recent10[recent10.length - 1].weight;
    const weightChange = firstWeight - lastWeight;
    
    // Consider plateau if less than 0.5 lbs lost in 10 days
    const isPlateaued = weightChange < 0.5;
    
    if (isPlateaued) {
      const daysDiff = Math.floor(
        (recent10[recent10.length - 1].date.getTime() - recent10[0].date.getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      
      return {
        isPlateaued: true,
        stagnationDays: daysDiff,
        recommendation: this.getPlateauRecommendation(daysDiff)
      };
    }

    return { isPlateaued: false, stagnationDays: 0, recommendation: '' };
  }

  private static getPlateauRecommendation(days: number): string {
    if (days < 14) {
      return "Stay consistent! Short-term plateaus are normal. Your body may be retaining water or building muscle.";
    } else if (days < 21) {
      return "Consider a refeed day with higher carbs, or try changing your exercise routine to shock your metabolism.";
    } else {
      return "Time for a strategy change! Consider reducing calories by 100-150/day or adding 30 minutes of cardio 3x/week.";
    }
  }
}