import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./App.css";

function App() {
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [captureType, setCaptureType] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode:
      captureType === "selfie" ? "user"  : "environment" ,
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setShowCamera(false);
  };

  const handleButtonClick = (type) => {
    setCaptureType(type);
    setShowCamera(true);
    setCapturedImage(null);
  };

  return (
    <div className="App">
      <h1>Camera Capture App</h1>
      <div className="button-container">
        <button onClick={() => handleButtonClick("document")}>
          Verify Document
        </button>
        <button onClick={() => handleButtonClick("selfie")}>Selfie</button>
      </div>

      {showCamera && (
        <div className="camera-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={540}
            height={380}
            className="webcam"
            playsInline
            videoConstraints={videoConstraints}
           mirrored={true}
            onUserMediaError={(err) => {
              console.error("Camera access denied:", err);
             setErrorMessage("Camera permission was denied. Please allow access to use this feature.");
              setShowCamera(false); // hide camera UI if blocked
            }}
          />
          <button className="capture-btn" onClick={capturePhoto}>
            Capture {captureType}
          </button>
        </div>
      )}

      {capturedImage && (
        <div className="preview-container">
          <h3>Captured {captureType}</h3>
          <img src={capturedImage} alt="Captured" />
        </div>
      )}
      {/* {errorMessage && (
  <div className="error-modal">
    <div className="error-box">
      <p>{errorMessage}</p>
      <button onClick={() => setErrorMessage("")}>Close</button>
    </div>
  </div>
)} */}

{errorMessage && (
  <div className="error-modal">
    <div className="error-box">
      <p>{errorMessage}</p>
      <p style={{ marginTop: "1rem" }}>
        Please go to your browser settings and allow camera access.
        <br />
        If you're using Chrome:
        <ul style={{ textAlign: "left", margin: "0.5rem auto", maxWidth: "300px" }}>
          <li>Tap the 🔒 lock icon in the address bar</li>
          <li>Find "Camera" and set it to "Allow"</li>
          <li>Reload the page</li>
        </ul>
      </p>
      <button
        className="retry-btn"
        onClick={() => {
          // Optionally try re-requesting permission
          setErrorMessage("");
          setShowCamera(false); // Keeps the state clean
        }}
      >
        I’ve Allowed Access – Retry
      </button>
    </div>
  </div>
)}


    </div>
  );
}

export default App;
