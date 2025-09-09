import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./App.css";
import Tesseract from "tesseract.js";
 import axios from "axios";
const aadhaarRegex = {
  aadhaar: /\d{4}\s\d{4}\s\d{4}/,
  dob: /(DOB|D\.O\.B\.|Year of Birth)[:\s]*\d{4}/i,
  gender: /(MALE|FEMALE|TRANSGENDER)/i,
  name: /^[A-Z][A-Z ]{3,}$/m,
};

const panRegex = {
  pan: /[A-Z]{5}[0-9]{4}[A-Z]{1}/,
  dob: /\d{2}\/\d{2}\/\d{4}/,
  name: /(?<=INCOME TAX DEPARTMENT\s)([A-Z ]+)/, // or customize
};

function App() {
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [captureType, setCaptureType] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [isOcrLoading, setIsOcrLoading] = useState(false);

  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: captureType === "selfie" ? "user" : "environment",
  };



const capturePhoto = async () => {
  const imageSrc = webcamRef.current.getScreenshot();
  setCapturedImage(imageSrc);
  setShowCamera(false);

  if (captureType === "document") {
    setIsOcrLoading(true);
    setOcrText("");

    try {
      const base64Data = imageSrc.replace(/^data:image\/png;base64,/, "");

      const response = await axios.post("http://127.0.0.1:5000/ocr", {
        image: base64Data,
      });

      setOcrText(response.data.text || "No text found.");
   } catch (err) {
  console.error("OCR error:", err);
  setOcrText("Error: " + (err?.response?.data?.error || "Failed to extract text."));
}
 finally {
      setIsOcrLoading(false);
    }
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
    <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageSrc = reader.result;
        setCapturedImage(imageSrc);
        setOcrText("");
        setIsOcrLoading(true);

        try {
          const base64Data = imageSrc.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
          const response = await axios.post("http://127.0.0.1:5000/ocr", {
            image: base64Data,
          });
          setOcrText(response.data.text || "No text found.");
        } catch (err) {
          console.error("OCR error:", err);
          setOcrText("Error: " + (err?.response?.data?.error || "Failed to extract text."));
        } finally {
          setIsOcrLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  }}
/>

      {showCamera && (
        <div className="camera-container">
               <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/png"
            width={540}
            height={380}
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
