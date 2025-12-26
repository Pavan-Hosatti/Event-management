// src/components/VoiceBot.jsx - Using Web Speech API (FREE, Browser-based)

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2, Volume2, X, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ChatHistory from './ChatHistory';
import api from '../../utilis/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VoiceBot = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState(null);
  const [sessionId] = useState(`session_${Date.now()}`);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Initialize Web Speech API
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'kn-IN'; // Kannada language
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      
      console.log('📝 Transcript:', transcript);
      console.log('📊 Confidence:', confidence);
      
      setIsListening(false);
      await processUserInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        setError(t('No speech detected. Please try again.'));
      } else if (event.error === 'not-allowed') {
        setError(t('Microphone access denied. Please enable microphone permissions.'));
      } else {
        setError(t('Speech recognition error: ') + event.error);
      }
    };

    recognition.onend = () => {
      console.log('🛑 Speech recognition ended');
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [t]);

  // Handle starting listening
  const handleStartListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    try {
      setError(null);
      recognitionRef.current.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError(t('Failed to start speech recognition'));
    }
  };

  // Handle stopping listening
  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Process user input and get AI response
// ...existing code...
  const processUserInput = async (userText) => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log('🚀 Sending to backend:', userText);

      // Format conversation history for API
      const history = conversation.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // retrieve token safely (adjust key if your app uses a different key)
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

   // Option 1: Using the default api instance
 // Adjust path as needed

const response = await api.post('/voice/query', {
  text: userText,
  sessionId: sessionId,
  conversationHistory: history
});

      console.log('📨 Response status:', response.status);

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || t('Failed to process query'));
      }

      if (data.success) {
        // Add messages to conversation
        const userMessage = {
          role: 'user',
          text: data.data.userText || userText,
          timestamp: Date.now()
        };

        const aiMessage = {
          role: 'assistant',
          text: data.data.aiText || (data.data.response || ''),
          timestamp: Date.now()
        };

        setConversation(prev => [...prev, userMessage, aiMessage]);

        // Speak the response (if available)
        if (aiMessage.text) speakText(aiMessage.text);
      }
    } catch (err) {
      console.error('❌ API Error:', err);
      setError(err.message || t('Failed to process query'));
    } finally {
      setIsProcessing(false);
    }
  };
// ...existing code...

  // Text-to-Speech using Web Speech API
  const speakText = (text) => {
    try {
      // Cancel any ongoing speech
      synthRef.current.cancel();

      // Wait a bit for voices to load
      const speakWithVoice = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'kn-IN'; // Kannada
        utterance.rate = 0.85; // Slower for better Kannada pronunciation
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Get available voices
        const voices = synthRef.current.getVoices();
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
        
        // Try to find a Kannada voice (priority order)
        const kannadaVoice = voices.find(voice => 
          voice.lang === 'kn-IN' || 
          voice.lang === 'kn' ||
          voice.name.toLowerCase().includes('kannada')
        );
        
        // Fallback to Indian English or Hindi if Kannada not available
        const fallbackVoice = voices.find(voice => 
          voice.lang === 'en-IN' || 
          voice.lang === 'hi-IN' ||
          voice.lang.startsWith('en')
        );
        
        if (kannadaVoice) {
          utterance.voice = kannadaVoice;
          console.log('🔊 Using Kannada voice:', kannadaVoice.name);
        } else if (fallbackVoice) {
          utterance.voice = fallbackVoice;
          console.log('🔊 Using fallback voice:', fallbackVoice.name);
        } else {
          console.warn('⚠️ No suitable voice found, using default');
        }

        utterance.onstart = () => {
          console.log('🔊 Speaking started');
        };

        utterance.onend = () => {
          console.log('🔇 Speaking ended');
        };

        utterance.onerror = (event) => {
          console.error('❌ Speech synthesis error:', event.error);
        };

        synthRef.current.speak(utterance);
      };

      // Voices may not be loaded immediately, so wait if needed
      if (synthRef.current.getVoices().length === 0) {
        console.log('⏳ Waiting for voices to load...');
        synthRef.current.onvoiceschanged = () => {
          console.log('✅ Voices loaded');
          speakWithVoice();
        };
      } else {
        speakWithVoice();
      }
    } catch (err) {
      console.error('Speech synthesis error:', err);
    }
  };

  // Clear conversation
  const handleClearConversation = () => {
    setConversation([]);
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Voice Bot Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-40 w-[400px] h-[600px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-700 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  <h3 className="font-bold text-lg">{t('Voice Assistant')}</h3>
                </div>
                {conversation.length > 0 && (
                  <button
                    onClick={handleClearConversation}
                    className="text-sm px-3 py-1 bg-white/20 rounded-full hover:bg-white/30 transition"
                  >
                    {t('Clear')}
                  </button>
                )}
              </div>
              <p className="text-xs text-white/80 mt-1">
                {t('Ask me anything in Kannada')}
              </p>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto">
              <ChatHistory 
                conversation={conversation}
                onPlayAudio={speakText}
              />
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Recording Controls */}
            <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-center gap-4">
                {/* Mic Button */}
                <motion.button
                  onClick={isListening ? handleStopListening : handleStartListening}
                  disabled={isProcessing}
                  className={`relative p-6 rounded-full transition-all duration-300 ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-emerald-500 hover:bg-emerald-600'
                  } text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                  whileHover={{ scale: isProcessing ? 1 : 1.1 }}
                  whileTap={{ scale: isProcessing ? 1 : 0.95 }}
                >
                  {isListening && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping top-0 left-0"></span>
                  )}
                  {isProcessing ? (
                    <Loader2 className="w-8 h-8 animate-spin relative z-10" />
                  ) : isListening ? (
                    <MicOff className="w-8 h-8 relative z-10" />
                  ) : (
                    <Mic className="w-8 h-8 relative z-10" />
                  )}
                </motion.button>
              </div>

              {/* Status Text */}
              <div className="text-center mt-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {isProcessing
                    ? t('Processing...')
                    : isListening
                    ? t('Listening... Speak in Kannada')
                    : t('Tap to speak in Kannada')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceBot;
