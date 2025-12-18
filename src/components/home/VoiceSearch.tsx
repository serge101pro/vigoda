import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VoiceSearchProps {
  onResult: (text: string) => void;
  className?: string;
}

// Declare SpeechRecognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function VoiceSearch({ onResult, className }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'ru-RU';
      
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Доступ к микрофону запрещён. Разрешите доступ в настройках браузера.');
        } else if (event.error === 'no-speech') {
          toast.info('Речь не обнаружена. Попробуйте ещё раз.');
        } else {
          toast.error('Ошибка распознавания речи');
        }
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognition) {
      toast.error('Голосовой поиск не поддерживается вашим браузером');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
        toast.info('Говорите...');
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast.error('Не удалось запустить голосовой поиск');
      }
    }
  }, [recognition, isListening]);

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={`hover:bg-primary/10 ${className}`}
      onClick={toggleListening}
      type="button"
    >
      {isListening ? (
        <div className="relative">
          <Mic className="h-4 w-4 text-accent animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-ping" />
        </div>
      ) : (
        <Mic className="h-4 w-4 text-primary" />
      )}
    </Button>
  );
}
