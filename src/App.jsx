import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import "./App.css";

function App() {
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [captureType, setCaptureType] = useState(""); // 'selfie' or 'document'
  const [capturedImage, setCapturedImage] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  // Detect iOS (for fallback)
  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    const isiOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    setIsIOS(isiOSDevice);
  }, []);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: captureType === "selfie" ? "user" : "environment",
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

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="App">
      <h1>Camera Capture App</h1>

      <div className="button-container">
        <button onClick={() => handleButtonClick("document")}>Verify Document</button>
        <button onClick={() => handleButtonClick("selfie")}>Selfie</button>
      </div>

      {showCamera && (
        <div className="camera-container">
          {!isIOS ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={540}
              height={380}
              className="webcam"
              mirrored={false}
              playsInline
              videoConstraints={videoConstraints}
            />
          ) : (
            <input
              type="file"
              accept="image/*"
              capture={captureType === "selfie" ? "user" : "environment"}
              onChange={handleFileInput}
            />
          )}

          {!isIOS && (
            <button className="capture-btn" onClick={capturePhoto}>
              Capture {captureType}
            </button>
          )}
        </div>
      )}

      {capturedImage && (
        <div className="preview-container">
          <h3>Captured {captureType}</h3>
          <img src={capturedImage} alt="Captured" />
        </div>
      )}
    </div>
  );
}

export default App;
