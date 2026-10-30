// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
}

class VoiceService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  public isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.isSupported = true;
      }
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      }
    }
  }

  /**
   * Starts listening to user's microphone.
   */
  startListening(
    onResult: (finalText: string, interimText: string) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ) {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser. Please use Google Chrome or type your message.');
      return;
    }

    // Stop ongoing speech synthesis when user starts speaking
    this.stopSpeaking();

    let fullTranscript = '';

    this.recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          fullTranscript += (fullTranscript ? ' ' : '') + transcriptPart;
        } else {
          interim += transcriptPart;
        }
      }
      onResult(fullTranscript, interim);
    };

    this.recognition.onerror = (event: any) => {
      let message = 'Microphone error: ' + event.error;
      if (event.error === 'not-allowed') {
        message = 'Microphone permission denied. Please allow microphone access in your browser or use the typed input box.';
      } else if (event.error === 'no-speech') {
        message = 'No speech detected. Please speak closer to your microphone.';
      }
      onError(message);
    };

    this.recognition.onend = () => {
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (e: any) {
      // If already started, stop and restart
      try {
        this.recognition.stop();
        setTimeout(() => this.recognition.start(), 150);
      } catch (err) {
        onError('Could not start microphone session.');
      }
    }
  }

  /**
   * Stops listening to microphone.
   */
  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore stop error
      }
    }
  }

  /**
   * Speaks AI participant's text aloud with configurable personality pitch/rate.
   */
  speak(
    text: string, 
    options: {
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    } = {}
  ) {
    if (!this.synthesis) {
      options.onEnd?.();
      return;
    }

    // Cancel any currently speaking utterance
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.lang = 'en-US';

    // Pick a natural voice if available
    const voices = this.synthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      options.onError?.(e);
      options.onEnd?.();
    };

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
  }

  /**
   * Interrupts or stops any currently speaking audio.
   */
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Checks if audio is currently playing.
   */
  isSpeaking(): boolean {
    return Boolean(this.synthesis && this.synthesis.speaking);
  }
}

export const voiceService = new VoiceService();
