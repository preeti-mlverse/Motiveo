export const voiceInputPatterns = {
  weight_loss: [
    "I weigh {number} pounds",
    "My weight is {number}",
    "Logged {number} calories",
    "Exercised for {number} minutes",
    "Had {meal} with {number} calories"
  ],
  cardio_endurance: [
    "Ran {number} miles",
    "Exercised for {number} minutes", 
    "My pace was {number} minutes per mile",
    "Heart rate was {number}",
    "Completed {number} kilometers"
  ],
  strength_building: [
    "Did {number} sets of {number} {exercise}",
    "Bench pressed {number} pounds",
    "Completed {exercise} workout",
    "Lifted for {number} minutes",
    "Squatted {number} pounds"
  ],
  daily_steps: [
    "Walked {number} steps",
    "Walked for {number} minutes",
    "Took {number} steps today",
    "Hiked for {number} hours"
  ],
  workout_consistency: [
    "Completed workout",
    "Did {workout_type} for {number} minutes",
    "Finished today's exercise",
    "Rest day today",
    "Skipped workout today"
  ],
  sleep_tracking: [
    "Slept for {number} hours",
    "Went to bed at {time}",
    "Woke up at {time}",
    "Had {number} hours of sleep",
    "Sleep quality was {rating} out of 10"
  ]
};

export const parseVoiceInput = (text: string, goalType: keyof typeof voiceInputPatterns) => {
  const patterns = voiceInputPatterns[goalType];
  const lowerText = text.toLowerCase();
  
  // Extract numbers from the voice input
  const numbers = lowerText.match(/\d+/g)?.map(Number) || [];
  
  // Extract workout types or exercises
  const workoutTypes = ['cardio', 'strength', 'yoga', 'running', 'cycling', 'swimming'];
  const exercises = ['push-ups', 'squats', 'bench press', 'deadlift', 'pull-ups'];
  
  const foundWorkout = workoutTypes.find(type => lowerText.includes(type));
  const foundExercise = exercises.find(exercise => lowerText.includes(exercise));
  
  return {
    numbers,
    workoutType: foundWorkout,
    exercise: foundExercise,
    originalText: text
  };
};