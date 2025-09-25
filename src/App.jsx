import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import "./App.css";

// Regex patterns for Aadhaar and PAN
const aadhaarRegex = {
  aadhaar: /\d{4}\s\d{4}\s\d{4}/,
  dob: /(DOB|D\.O\.B\.|Year of Birth)[:\s]*\d{4}/i,
  gender: /(MALE|FEMALE|TRANSGENDER)/i,
  name: /^[A-Z][A-Z ]{3,}$/m,
};

const panRegex = {
  pan: /[A-Z]{5}[0-9]{4}[A-Z]{1}/,
  dob: /\d{2}\/\d{2}\/\d{4}/,
  name: /(?<=INCOME TAX DEPARTMENT\s)([A-Z ]+)/,
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
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: captureType === "selfie" ? "user" : "environment",
  };

  const parseDocumentDetails = (text) => {
    const aadhaar = aadhaarRegex.aadhaar.test(text);
    const pan = panRegex.pan.test(text);

    if (aadhaar) {
      return {
        type: "Aadhaar",
        aadhaarNumber: text.match(aadhaarRegex.aadhaar)?.[0],
        dob: text.match(aadhaarRegex.dob)?.[0],
        gender: text.match(aadhaarRegex.gender)?.[0],
        name: text.match(aadhaarRegex.name)?.[0],
      };
    } else if (pan) {
      return {
        type: "PAN",
        panNumber: text.match(panRegex.pan)?.[0],
        dob: text.match(panRegex.dob)?.[0],
        name: text.match(panRegex.name)?.[1]?.trim(),
      };
    } else {
      return { type: "Unknown", raw: text };
    }
  };

  const capturePhoto = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    console.log("Captured Base64 Image:", imageSrc);

    setCapturedImage(imageSrc);
    setShowCamera(false);

    if (captureType === "document") {
      await handleOCR(imageSrc);
    }
  };

  const handleOCR = async (imageSrc) => {
    setIsOcrLoading(true);
    setOcrText("");

    try {
      const {
        data: { text },
      } = await Tesseract.recognize(imageSrc, "eng", {
        logger: (m) => console.log(m),
      });

      console.log("Extracted text:", text);
      setOcrText(text);
    } catch (err) {
      console.error("Tesseract OCR error:", err);
      setOcrText("Error: Failed to extract text.");
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleButtonClick = (type) => {
    setCaptureType(type);
    setShowCamera(true);
    setCapturedImage(null);
  };

  return (
    <div className="App">
      <h1>Document OCR Capture (Client-Side)</h1>
      <div className="button-container">
        <button onClick={() => handleButtonClick("document")}>Verify Document</button>
        <button onClick={() => handleButtonClick("selfie")}>Selfie</button>
      </div>

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
            <>
              <textarea
                value={ocrText}
                readOnly
                rows={10}
                style={{ width: "100%", maxWidth: "500px" }}
              />
              <h4>Detected Document Details:</h4>
              <pre style={{ background: "#eee", padding: "10px", borderRadius: "5px" }}>
                {JSON.stringify(parseDocumentDetails(ocrText), null, 2)}
              </pre>
            </>
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
