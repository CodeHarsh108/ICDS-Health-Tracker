import { useState, useEffect, useCallback, useRef } from 'react';

export const useVoiceInput = (onResult, language = 'en-IN') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);

  // Keep callback ref in sync without recreating recognition
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported. Use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }

      if (interim) setInterimTranscript(interim);

      if (final) {
        setTranscript(final);
        setInterimTranscript('');
        if (onResultRef.current) onResultRef.current(final);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Try again.');
      } else if (event.error === 'aborted') {
        // User aborted, no error needed
      } else {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.abort(); } catch (e) { /* ignore */ }
    };
  }, [language]);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    // Abort any ongoing session first
    try { recognition.abort(); } catch (e) { /* ignore */ }

    setError(null);
    setTranscript('');
    setInterimTranscript('');

    // Small delay to ensure abort completes
    setTimeout(() => {
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error('Failed to start recognition:', e);
        setError('Failed to start. Try again.');
      }
    }, 100);
  }, []);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition) {
      try { recognition.stop(); } catch (e) { /* ignore */ }
    }
    setIsListening(false);
  }, []);

  return { isListening, transcript, interimTranscript, error, startListening, stopListening };
};