import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from 'react-speech-kit';
import axios from 'axios';
import classNames from 'classnames';

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

  async function predictTheScore(){
    try {
      let sendToServer = await axios.post(API_URL+'/predict', {
        text: value,
        id: roomID
      });
      const fraudProbability = sendToServer.data.fraud_probability;
      setScore(fraudProbability); // Set the fraud probability score
    } catch (axiosError) {
      console.error("Error posting to server:", axiosError.message);
      if (axiosError.code === 'ERR_NETWORK') {
        console.log("Network error: Could not reach the server. Please check if the backend is running.");
      } else {
        console.log(`An error occurred: ${axiosError.message}`);
      }
    }
  }

  useEffect(() => {
    if (value) {
      predictTheScore();
    }
  }, [value]);

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
