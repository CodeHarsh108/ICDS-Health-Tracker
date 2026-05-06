import { useVoiceInput } from '../hooks/useVoiceInput';
import './VoiceInput.css';

export default function VoiceInput({ onResult, buttonText = '🎤', className = '', disabled = false }) {
  const { isListening, interimTranscript, error, startListening, stopListening } = useVoiceInput(onResult, 'en-IN');

  if (disabled) return null;

  return (
    <div className={`voice-input ${className}`}>
      <button
        type="button"
        className={`voice-btn ${isListening ? 'listening' : ''}`}
        onClick={isListening ? stopListening : startListening}
        title={isListening ? 'Click to stop' : 'Click and speak'}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          {isListening ? 'stop' : 'mic'}
        </span>
      </button>
      {isListening && (
        <div className="voice-feedback">
          <div className="voice-wave">
            <span /><span /><span /><span /><span />
          </div>
          <span className="voice-status">
            {interimTranscript || 'Listening...'}
          </span>
        </div>
      )}
      {error && <span className="voice-error">{error}</span>}
    </div>
  );
}