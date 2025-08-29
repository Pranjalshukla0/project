import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./App.css";
import Tesseract from "tesseract.js";



function App() {
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [captureType, setCaptureType] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
 const [ocrText, setOcrText] = useState(""); // to hold extracted text
const [isOcrLoading, setIsOcrLoading] = useState(false); // loader
const videoConstraints = {
  width: { ideal: 640 },
  height: { ideal: 480 },
  facingMode: captureType === "selfie" ? "user" : "environment",
};


const capturePhoto = async () => {
  const imageSrc = webcamRef.current.getScreenshot();
  setCapturedImage(imageSrc);
  setShowCamera(false);

  if (captureType === "document") {
    setIsOcrLoading(true);
    setOcrText("");

    // Run OCR
    Tesseract.recognize(
      imageSrc,
      "eng+hin",
      {
        logger: (m) => console.log(m),
      }
    ).then(({ data: { text } }) => {
      setOcrText(text);
      setIsOcrLoading(false);
    }).catch(err => {
      console.error("OCR error:", err);
      setOcrText("Failed to extract text.");
      setIsOcrLoading(false);
    });
  }
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
  screenshotFormat="image/png"
  className="webcam"
  playsInline
  videoConstraints={videoConstraints}
  mirrored={captureType === "selfie"}
  onUserMediaError={(err) => {
    console.error("Camera access denied:", err);
    setErrorMessage("Camera permission was denied. Please allow access to use this feature.");
    setShowCamera(false);
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
      {captureType === "document" && capturedImage && (
  <div className="ocr-output">
    <h3>Extracted Text:</h3>
    {isOcrLoading ? (
      <p>Processing...</p>
    ) : (
      <textarea
        value={ocrText}
        readOnly
        rows={10}
        style={{ width: "100%", maxWidth: "500px" }}
      />
    )}
  </div>
)}

      {errorMessage && (
  <div className="error-modal">
    <div className="error-box">
      <p>{errorMessage}</p>
      <button onClick={() => setErrorMessage("")}>Close</button>
    </div>
  </div>
)}

    </div>
  );
}

export default App;
