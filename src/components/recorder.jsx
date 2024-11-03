import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from 'react-speech-kit';
import axios from 'axios';
const AudioRecorderWithSpeechRecognition = () => {
  const [value, setValue] = useState('');
  const queryParams = new URLSearchParams(window.location.search);
    // Retrieve a specific query parameter
    const roomID = queryParams.get('roomID');
  const [isListening, setIsListening] = useState(false);
  const [score,setScore]=useState(0);
  const [audioChunks, setAudioChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [translatedtext,settranslatedtext]=useState([]);
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

  useEffect(()=>{
    const translatesentence = async () => {
      const url = 'https://deep-translate1.p.rapidapi.com/language/translate/v2';
    
      const options = {
          method: 'POST',
          headers: {
              'x-rapidapi-key': '',
              'x-rapidapi-host': 'deep-translate1.p.rapidapi.com',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              q: value,
              source: 'hi',
              target: 'en'
          })
      };
    
      try {
          const response = await fetch(url, options);
          let result = await response.text();
          // Check if the expected data structure exists
        // if (result?.data?.translations?.translatedText) {
        result=JSON.parse(result);
          const translatedText=result.data.translations.translatedText;
          console.log(translatedText);
          // translatedtext.push(result.data.translations.translatedText);
          settranslatedtext((prev) => [...prev, translatedText]);
        
          console.log("Sending translated text to server:", translatedText);
          
          try {
            if(translatedtext.length >10){
              let response = await axios.post('http://localhost:5000/predict', {
                text: translatedtext.join(),
                id: roomID
            });
            // / Access the fraud probability from response data
            const fraudProbability = response.data.fraud_probability; 
            setScore(fraudProbability); // Set the fraud probability score
            console.log("Prediction response:", fraudProbability);
            translatedtext.length = 0; 
            }
              
          } catch (axiosError) {
              console.error("Error posting to server:", axiosError.message);
              if (axiosError.code === 'ERR_NETWORK') {
                  alert("Network error: Could not reach the server. Please check if the backend is running.");
              } else {
                  alert(`An error occurred: ${axiosError.message}`);
              }
          }

      } catch (error) {
          console.error(error);
      }
    };
    translatesentence();
  },[value])

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
        onChange={(event) => {setValue(event.target.value)}}
        placeholder="Start speaking..."
        className="w-full h-40 mb-4 mx-[50px]"
      />
      <div className='w-[300px] h-[40px] bg-red-500 text-white'>{score}</div>
      <textarea  className='w-[400px] h-[200px]' value={translatedtext.join()} onChange={(event) => setValue(event.target.value)} placeholder='Translated text will appear here '/>
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
