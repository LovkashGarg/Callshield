import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from 'react-speech-kit';

const AudioRecorderWithSpeechRecognition = () => {
  const [value, setValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');

  const { listen, stop } = useSpeechRecognition({
    onResult: (result) => {
      setValue(result); // Update with recognized text
    },
    onStart: () => {
      setIsListening(true);
    },
    onEnd: () => {
      setIsListening(false);
    },
  });

  useEffect(() => {
    if (isListening) {
      // Start capturing audio
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        recorder.ondataavailable = (event) => {
          setAudioChunks((prev) => [...prev, event.data]);
        };

        recorder.onstop = () => {
          const blob = new Blob(audioChunks, { type: 'audio/wav' });
          setAudioUrl(URL.createObjectURL(blob));
          setAudioChunks([]); // Clear audio chunks after stopping
        };

        recorder.start();
      }).catch((err) => {
        console.error("Error accessing microphone:", err);
      });
    } else if (mediaRecorder) {
      mediaRecorder.stop(); // Stop recording when not listening
    }
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      stop(); // Stop speech recognition
    } else {
      listen(); // Start speech recognition
    }
  };

  return (
    <div>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Start speaking..."
        className="w-full h-40 mb-4 mx-[50px]"
      />
      <button onClick={toggleListening}>
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      {audioUrl && (
        <div>
          <h3>Recorded Audio:</h3>
          <audio src={audioUrl} controls />
        </div>
      )}
    </div>
  );
};

export default AudioRecorderWithSpeechRecognition;
