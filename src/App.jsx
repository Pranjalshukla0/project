import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./App.css";
import Tesseract from "tesseract.js";

const aadhaarRegex = {
  aadhaar: /\d{4}\s\d{4}\s\d{4}/,
  dob: /(DOB|D\.O\.B\.|Year of Birth)[:\s]*\d{4}/i,
  gender: /(MALE|FEMALE|TRANSGENDER)/i,
  name: /^[A-Z][A-Z ]{3,}$/m
};

const panRegex = {
  pan: /[A-Z]{5}[0-9]{4}[A-Z]{1}/,
  dob: /\d{2}\/\d{2}\/\d{4}/,
  name: /(?<=INCOME TAX DEPARTMENT\s)([A-Z ]+)/ // or customize
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
    width: 640,
    height: 360,
    facingMode: captureType === "selfie" ? "user" : "environment"
  };

  const capturePhoto = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setShowCamera(false);

    if (captureType === "document") {
      setIsOcrLoading(true);
      setOcrText("");

      Tesseract.recognize(imageSrc, "eng+hin", {
        logger: (m) => console.log(m)
      })
        .then(({ data: { text } }) => {
          let extracted = "";
          const upperText = text.toUpperCase();

          // PAN Card
          if (upperText.includes("INCOME TAX") || panRegex.pan.test(upperText)) {
            const name = panRegex.name.exec(upperText)?.[1]?.trim() || "Not found";
            const dob = panRegex.dob.exec(upperText)?.[0] || "Not found";
            const pan = panRegex.pan.exec(upperText)?.[0] || "Not found";
            extracted = `Document Type: PAN Card\nName: ${name}\nDOB: ${dob}\nPAN: ${pan}`;
          }
          // Aadhaar Card
          else if (aadhaarRegex.aadhaar.test(upperText)) {
            const lines = upperText.split("\n").map((l) => l.trim()).filter(Boolean);
            const nameLine = lines.find((line) => aadhaarRegex.name.test(line)) || "Not found";
            const dob = aadhaarRegex.dob.exec(upperText)?.[0] || "Not found";
            const gender = aadhaarRegex.gender.exec(upperText)?.[0] || "Not found";
            const aadhaar = aadhaarRegex.aadhaar.exec(upperText)?.[0] || "Not found";
            extracted = `Document Type: Aadhaar Card\nName: ${nameLine}\nDOB: ${dob}\nGender: ${gender}\nAadhaar No: ${aadhaar}`;
          }
          // Unknown
          else {
            extracted = "Could not identify document type or extract data properly.";
          }

          setOcrText(extracted);
          setIsOcrLoading(false);
        })
        .catch((err) => {
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
        <button onClick={() => handleButtonClick("document")}>Verify Document</button>
        <button onClick={() => handleButtonClick("selfie")}>Selfie</button>
      </div>

      {showCamera && (
        <div className="camera-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/png"
            className="webcam"
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
