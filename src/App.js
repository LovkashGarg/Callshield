import './App.css';
// import CallAppHome from './components/home';
import AudioRecorderWithSpeechRecognition from './components/recorder';
import Room from './components/room';

function App() {
  return (
    <div className="App flex flex-row-reverse">
     {/* <CallAppHome/> */}
     <Room/>
     <AudioRecorderWithSpeechRecognition/>
    </div>
  );
}

export default App;
