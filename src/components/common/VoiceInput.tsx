import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { parseVoiceInput } from '../../utils/voicePatterns';
import { GoalType } from '../../types';

interface VoiceInputProps {
  goalType: GoalType;
  onVoiceInput: (data: any) => void;
  placeholder?: string;
  className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  goalType,
  onVoiceInput,
  placeholder = "Tap to record your progress...",
  className = ""
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        
        const parsedData = parseVoiceInput(transcript, goalType);
        onVoiceInput(parsedData);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [goalType, onVoiceInput]);

  const startListening = () => {
    if (recognition && !isListening) {
      setTranscript('');
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  return (
    <div className={`voice-input ${className}`}>
      <button
        onClick={isListening ? stopListening : startListening}
        className={`
          relative flex items-center justify-center px-6 py-4 rounded-2xl font-medium transition-all duration-300 
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/30' 
            : 'bg-[#F08A3E] hover:bg-[#E17226] text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50'
          }
          transform hover:scale-105 active:scale-95
        `}
        disabled={!recognition}
      >
        <div className="flex items-center space-x-3">
          {isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
          <span className="font-semibold">
            {isListening ? 'Listening...' : 'Voice Log'}
          </span>
        </div>
        
        {isListening && (
          <div className="absolute -inset-1 bg-red-400 rounded-2xl opacity-30 animate-ping"></div>
        )}
      </button>

      {transcript && (
        <div className="mt-4 p-4 bg-[#161B22] rounded-xl border border-[#2B3440]">
          <div className="flex items-center space-x-2 mb-2">
            <Volume2 className="w-4 h-4 text-[#6BD0D2]" />
            <span className="text-sm font-medium text-[#6BD0D2]">Voice Input:</span>
          </div>
          <p className="text-[#F3F4F6] text-sm">{transcript}</p>
        </div>
      )}

      {!recognition && (
        <p className="text-xs text-[#CBD5E1] mt-2 text-center">
          Voice input not supported in this browser
        </p>
      )}
    </div>
  );
};