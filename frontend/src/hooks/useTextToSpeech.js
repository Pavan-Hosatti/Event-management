import { useEffect, useState, useCallback } from 'react';

const useTextToSpeech = (langCode) => {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    const isSupported = !!synth;

    const [availableVoices, setAvailableVoices] = useState([]);
    const [voicesLoaded, setVoicesLoaded] = useState(false);

    // Use specific BCP-47 codes
    const preferredLangCode = langCode === 'kn' ? 'kn-IN' : 'en-US';

    // Function to load and store voices
    const loadVoices = useCallback(() => {
        if (synth) {
            const voices = synth.getVoices();
            if (voices.length > 0) {
                setAvailableVoices(voices);
                setVoicesLoaded(true);
            }
        }
    }, [synth]);

    useEffect(() => {
        if (!isSupported) return;

        // Load voices immediately if they are already available
        loadVoices(); 

        // Add event listener for when voices change (critical for initial load in Chrome)
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = loadVoices;
        }

        // Cleanup the event listener
        return () => {
            if (synth.onvoiceschanged === loadVoices) {
                synth.onvoiceschanged = null;
            }
        };
    }, [isSupported, synth, loadVoices]);


    // Function to stop current speech
    const stop = useCallback(() => {
        if (synth && synth.speaking) {
            synth.cancel();
        }
    }, [synth]);

    // Function to handle the actual speech synthesis
    const speak = useCallback((text) => {
        if (!isSupported || !text || !voicesLoaded) {
            console.log("TTS not ready or supported.");
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        let selectedVoice = null;
        
        if (langCode === 'kn') {
            // *** ENHANCED KANNADA VOICE SELECTION LOGIC ***
            
            // 1. Try to find the specific Indian Kannada voice (kn-IN)
            selectedVoice = availableVoices.find(voice => 
                voice.lang === 'kn-IN' || voice.lang.startsWith('kn-')
            );

            // 2. If not found, try finding a generic Kannada voice (e.g., 'kn')
            if (!selectedVoice) {
                selectedVoice = availableVoices.find(voice => 
                    voice.lang.startsWith('kn')
                );
            }

            // 3. If still not found, fallback to a common Indian voice like Hindi (hi-IN)
            // This is a common practice for TTS engines that lack smaller regional language voices.
            if (!selectedVoice) {
                selectedVoice = availableVoices.find(voice => 
                    voice.lang === 'hi-IN' || voice.lang.startsWith('hi-')
                );
                if (selectedVoice) {
                    console.warn("Using Hindi (hi-IN) voice as a regional fallback for Kannada.");
                }
            }

        } else {
            // For English, use the preferred code or the first matching 'en' voice
            selectedVoice = availableVoices.find(voice => 
                voice.lang === preferredLangCode || voice.lang.startsWith('en-')
            );
        }

        // Apply the voice or use system language fallback
        if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang; // Use the language of the chosen voice
        } else {
            // FINAL FALLBACK: Set the lang attribute and let the browser use the default voice
            utterance.lang = preferredLangCode; 
            console.warn(`No specific voice found for ${preferredLangCode}. Using system default.`);
        }
        
        // Ensure consistent settings
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        // Critical Chrome Fix: Cancel any ongoing speech before speaking
        synth.cancel(); 
        
        synth.speak(utterance);

    }, [isSupported, synth, availableVoices, voicesLoaded, langCode, preferredLangCode]);


    return { 
        speak, 
        stop, 
        isSupported 
    };
};

export default useTextToSpeech;