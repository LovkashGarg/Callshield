import { useState, useEffect } from 'react';
import { useSpeechRecognition } from 'react-speech-kit';

const Example = () => {
  const [value, setValue] = useState('');
  const [isListening, setIsListening] = useState(false);

  const { listen, stop } = useSpeechRecognition({
    onResult: (result) => {
      console.log("Result received:", result);
      setValue(result);  // Update value with the result from recognition
    },
    onStart: () => {
      console.log("Speech recognition started");
      setIsListening(true); // Set listening state to true
    },
    onEnd: () => {
      console.log("Speech recognition stopped");
      setIsListening(false); // Set listening state to false
    }
  });

  const toggleListening = () => {
    console.log("Toggle listening called, isListening:", isListening);
    if (isListening) {
      stop();
    } else {
      listen();
    }
  };

  // Use effect to track isListening changes for debugging
  useEffect(() => {
    console.log("isListening state changed to:", isListening);
  }, [isListening]);

  return (
    <div>
      <textarea
        className="w-[100%] h-[200px] mb-[20px]"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button onClick={toggleListening}>
        🎤 {isListening ? <>"Listening..." </>: <>"Press to Talk"</>}
      </button>
    </div>
  );
};

export default Example;
