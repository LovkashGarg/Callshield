import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from 'react-speech-kit';

const AudioRecorderWithSpeechRecognition = () => {
  const [value, setValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [translatedtext,settranslatedtext]=useState('');
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
              'x-rapidapi-key': '479b775b31mshe80751744e53a0ep19b1a8jsn9c3e879a0dbe',
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
          console.log(result.data.translations.translatedText);
          settranslatedtext(result.data.translations.translatedText);
      // } else {
      //     console.log("Unexpected response structure:", result);
      // }
          
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
      <textarea  value={translatedtext} onChange={(event) => setValue(event.target.value)} placeholder='Translated text will appear here '/>
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
