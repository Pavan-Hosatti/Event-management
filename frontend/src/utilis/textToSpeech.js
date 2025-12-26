// src/utils/textToSpeech.js
export const playKannadaVoice = (text) => {
  const audio = new Audio(
    "https://translate.google.com/translate_tts?ie=UTF-8&tl=kn&client=tw-ob&q=" + encodeURIComponent(text)
  );
  audio.play();
};
