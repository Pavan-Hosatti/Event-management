// src/components/ChatHistory.jsx
import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";

const ChatHistory = ({ conversation }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // ✅ Simple Kannada Text-to-Speech (no API key required)
  // ✅ Kannada Text-to-Speech using CORS proxy
  const playKannadaVoice = async (text) => {
    if (!text) return;
    
    try {
      // Using a free CORS proxy to bypass the restriction
      const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=kn&client=tw-ob&q=${encodeURIComponent(text)}`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(googleTTSUrl)}`;
      
      const audio = new Audio(proxyUrl);
      await audio.play();
    } catch (err) {
      console.error("Audio playback failed:", err);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {conversation.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <p className="text-lg">ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ</p>
          <p className="text-sm mt-2">
            Start your voice conversation in Kannada
          </p>
          <p className="text-xs mt-4 text-gray-400">
            ಬೆಳೆಗಳು, ಬೆಲೆಗಳು ಮತ್ತು ಕೃಷಿ ಬಗ್ಗೆ ಕೇಳಿ
          </p>
        </div>
      )}

      {conversation.map((message, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-xl shadow-md ${
              message.role === "user"
                ? "bg-emerald-500 text-white rounded-br-none"
                : "bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-tl-none"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>

            {/* 🎧 Play Audio Button for AI responses */}
            {message.role === "assistant" && (
              <button
                onClick={() => playKannadaVoice(message.text)}
                className="mt-2 text-xs flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
              >
                <Volume2 className="w-3 h-3" />
                ಕೇಳಿ (Listen)
              </button>
            )}
          </div>
        </motion.div>
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatHistory;
