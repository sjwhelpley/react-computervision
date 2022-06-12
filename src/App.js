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
        >
          Capture photo
        </button>
      )}
    </Webcam>
  );

  const getFaceExpression = async () => {
    const input = document.getElementById("faceInput");
    // loading
    const detectionsWithExpressions = await faceapi.detectAllFaces(input, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
    console.log(detectionsWithExpressions);
    const expression = getExpression(detectionsWithExpressions)
    setExpression(expression);
    http.post('/getPoem', { expression }).then((response) => { console.log(response.data.result); setPoem(response.data.result) })
    // stop loading
  }

  const getExpression = (obj) => {
    const expressionsObj = obj[0].expressions;
    return Object.keys(expressionsObj).reduce((a, b) => expressionsObj[a] > expressionsObj[b] ? a : b);
  }

  return (
    <div className="app">
      <h1>POEMOTION</h1>
      {modelLoaded ?
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
                  Recapture photo
                </button>
                <button
                  onClick={
                    getFaceExpression
                  }
                >
                  Continue...
                </button>
              </div>
            </div> : <WebcamCapture />}
        </div> : <p>Loading...</p>}
      {poem &&
        <div style={{ whiteSpace: 'pre-line' }}>
          <h2>{exp}</h2>
          {poem}
        </div>}
    </div>
  );
}

export default App;
