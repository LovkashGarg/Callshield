import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from 'react-speech-kit';
import classNames from 'classnames';
import { io } from 'socket.io-client';

// const API_URL = process.env.BACKEND_API_URL || "https://callshield-backend.onrender.com" || "http://localhost:5000";
const API_URL =  "https://callshield-backend.onrender.com" ;
const socket = io(API_URL); // Initialize socket connection

const AudioRecorderWithSpeechRecognition = () => {
  const [value, setValue] = useState('');
  const queryParams = new URLSearchParams(window.location.search);
  const roomID = queryParams.get('roomID');
  const [isListening, setIsListening] = useState(false);
  const [score, setScore] = useState(0);
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
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        recorder.ondataavailable = (event) => {
          setAudioChunks((prev) => [...prev, event.data]);
        };

        recorder.onstop = () => {
          const blob = new Blob(audioChunks, { type: 'audio/wav' });
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

  useEffect(() => {
    if (value) {
      socket.emit('predict', {
        text: value,
        id: roomID,
      });
    }
  }, [value]);

  // Handle incoming predictions from the server
  useEffect(() => {
    socket.on('prediction', (data) => {
      const fraudProbability = data.fraud_probability;
      setScore(fraudProbability);
    });

    // Clean up the socket connection on unmount
    return () => {
      socket.off('prediction');
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stop(); // Stop speech recognition
      setIsListening(false);
    } else {
      listen(); // Start speech recognition
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-100 transition-colors">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Start speaking..."
        style={{ height: "calc(100vh - 300px)" }}
        className="w-full h-32 mt-8 mb-4 p-3 resize-none rounded-md shadow-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-400 transition-colors"
      />
      <div className="fixed bottom-0 p-3">
        <div 
          className={classNames(
            "rounded-md text-center font-semibold transition-all duration-300 ease-in-out shadow-lg mb-3 py-4 px-2",
            {
              "bg-green-400 dark:bg-green-500": score < 40,
              "bg-yellow-400 dark:bg-yellow-500": score >= 40 && score < 70,
              "bg-red-400 dark:bg-red-500": score >= 70,
            }
          )}
          style={{ fontSize: '1.2em' }}
        >
          Fraud Probability: {score}%
        </div>
        <div className="flex items-center justify-between w-full">
          <button
            onClick={toggleListening}
            className="flex-1 py-2 px-4 rounded-md text-white bg-indigo-500 dark:bg-indigo-700 hover:bg-indigo-600 dark:hover:bg-indigo-800 transition-colors"
          >
            {isListening ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioRecorderWithSpeechRecognition;
