import * as React from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
// import { useRef } from 'react';

function randomID(len) {
  let result = '';
  if (result) return result;
  const chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
    maxPos = chars.length;
  len = len || 5;
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export function getUrlParams(url = window.location.href) {
  const urlStr = url.split('?')[1];
  return new URLSearchParams(urlStr);
}


// const startrecord = async () => {
//     // Call ZegoCloud's recording API
//     const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
//     const endTime = currentTime + 30; // Add 30 seconds

//     try {
//       const response = await fetch(`https://rtc-api.zego.im/?Action=StartCDNRecord&StreamId[]=cdn01&StreamId[]=cdn02&Vendor=Tencent&EndTime=${endTime}`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       console.log("Recording started:", data);
//     } catch (error) {
//       console.error("Error starting recording:", error);
//     }
//   };


export default function App() {
  const roomID = getUrlParams().get('roomID') || randomID(5);

  let myMeeting = async (element) => {
    // generate Kit Token
    const appID = +process.env.REACT_APP_ZEGOCLOUD_APP_ID;
    const serverSecret = process.env.REACT_APP_ZEGOCLOUD_SERVER_SECRET;
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, randomID(5), randomID(5));

    console.log("App ID:", process.env.REACT_APP_ZEGOCLOUD_APP_ID);
    console.log("Server Secret:", process.env.REACT_APP_ZEGOCLOUD_SERVER_SECRET);

   

    // Create instance object from Kit Token.
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    // start the call
    zp.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: 'Personal link',
          url:
            window.location.protocol + '//' + 
            window.location.host + window.location.pathname +
            '?roomID=' + roomID,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall, // To implement 1-on-1 calls, modify the parameter here to [ZegoUIKitPrebuilt.OneONoneCall].
      },
    });
  };

  return (
    <>
      <div
        className="myCallContainer"
        ref={myMeeting}
        style={{ width: '100vw', height: '100vh' }}
      ></div>
      {/* <button onClick={startrecord} className=''>Start Recording</button> */}
    </>
  );
}
