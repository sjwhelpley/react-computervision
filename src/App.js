import { useEffect, useState } from 'react';
import './App.css';
import * as faceapi from "face-api.js";
import Webcam from "react-webcam";
import axios from 'axios';

const http = axios.create({
  baseURL: "https://poemotion-api.herokuapp.com/api",
  // baseURL: "http://localhost:8080/api",
  headers: {
    "Content-type": "application/json"
  }
});

function App() {
  const [img, setImg] = useState(null);
  const [imgSelected, setImgSelected] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [poem, setPoem] = useState(null);
  const [exp, setExpression] = useState(null)

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    ]).then(() => {
      setModelLoaded(true)
    })
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  const WebcamCapture = () => (
    <Webcam
      audio={false}
      height={0.5 * window.innerHeight}
      screenshotFormat="image/jpeg"
      width={0.5 * window.innerWidth}
      videoConstraints={videoConstraints}
      className='webcam'
    >
      {({ getScreenshot }) => (
        <button
          className='button'
          onClick={() => {
            setImg(getScreenshot());
            setImgSelected(true);
          }}
          style={{ marginTop: '20px' }}
        >
          Capture Photo
        </button>
      )}
    </Webcam>
  );

  const getFaceExpression = async () => {
    const input = document.getElementById("faceInput");
    setLoading(true);
    const detectionsWithExpressions = await faceapi.detectAllFaces(input, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
    const expression = getExpression(detectionsWithExpressions)
    setExpression(expression);
    http.post('/getPoem', { expression }).then((response) => {
      console.log(response.data.result);
      setPoem(response.data.result);
      setLoading(false);
    })
  }

  const getExpression = (obj) => {
    const expressionsObj = obj[0].expressions;
    return Object.keys(expressionsObj).reduce((a, b) => expressionsObj[a] > expressionsObj[b] ? a : b);
  }

  const getColors = () => {
    switch (exp) {
      case 'happy':
        return { background: '#fdd85d', button: '#99d6ea' };
      case 'sad':
        return { background: '#669bbc', button: '#003049' };
      case 'angry':
        return { background: '#ad2831', button: '#38040e' };
      case 'disgusted':
        return { background: '#606c38', button: '#283618' };
      case 'neutral':
        return { background: '#bcb8b1', button: '#463f3a' };
      default:
        return { background: '#f2e9e4', button: '#4a4e69' }
    }
  }

  // const getEmoji = () => {
  //   switch (exp) {
  //     case 'happy':
  //       return 😄;
  //     case 'sad':
  //       return 😔;
  //     case 'angry':
  //       return 😠;
  //     case 'disgusted':
  //       return 🤢;
  //     case 'neutral':
  //       return 😐;
  //     default:
  //       return 🙂;
  //   }
  // }

  return (
    <div className="app" style={{ backgroundColor: getColors().background }}>
      {loading &&
        <div className="loading-spinner">
        </div>}
      <h1 style={{ color: '#22223b', marginBottom: '10px' }}>POEMOTION</h1>
      <p>Feeling a certain type of way? Take a picture of yourself to generate a poem based on your emotion!</p>
      {modelLoaded ?
        <div>
          {!poem ?
            <div className='main'>
              {imgSelected ?
                <div className='main'>
                  <img id="faceInput" src={img} />
                  <div className='row'>
                    <button
                      onClick={() => {
                        setImgSelected(false);
                      }}
                    >
                      Try Again
                    </button>
                    <button
                      onClick={
                        getFaceExpression
                      }
                    >
                      All Set!
                    </button>
                  </div>
                </div> : <WebcamCapture />}
            </div> : null}
        </div> : <p>Loading...</p>}
      {poem &&
        <div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <img id="faceInput" src={img} style={{ width: '100%' }} />
            </div>
            <div className='poem' style={{ flex: 1 }}>
              <h2 style={{ marginBottom: '-30px' }}>{exp} poem</h2>
              <div style={{ whiteSpace: 'pre-line' }}>
                <p>{poem}</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button
              onClick={() => {
                setImgSelected(false);
                setPoem(null);
                setExpression(null);
              }}
              style={{ backgroundColor: getColors().button }}
            >
              Try Again
            </button>
          </div>
        </div>}
    </div>
  );
}

export default App;
