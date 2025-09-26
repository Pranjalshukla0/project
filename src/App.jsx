// import React, { useRef, useState } from "react";
// import Webcam from "react-webcam";
// import Tesseract from "tesseract.js";
// import "./App.css";

// // Regex patterns for Aadhaar and PAN
// // const aadhaarRegex = {
// //   aadhaar: /\d{4}\s\d{4}\s\d{4}/,
// //   dob: /(DOB|D\.O\.B\.|Year of Birth)[:\s]*\d{4}/i,
// //   gender: /(MALE|FEMALE|TRANSGENDER)/i,
// //   name: /^[A-Z][A-Z ]{3,}$/m,
// // };
// const aadhaarRegex = {
//   aadhaar: /\d{4}\s\d{4}\s\d{4}/,
//   dob: /(?:DOB|D\.O\.B\.|Year of Birth)[\s:]*([0-9]{2}\/[0-9]{2}\/[0-9]{4}|[0-9]{4})/i,
//   gender: /\b(MALE|FEMALE|TRANSGENDER)\b/i,
//   name: /^[A-Z]{3,}(?: [A-Z]{2,}){0,2}$/gm,
// };


// const panRegex = {
//   pan: /[A-Z]{5}[0-9]{4}[A-Z]{1}/,
//   dob: /\d{2}\/\d{2}\/\d{4}/,
//   name: /(?<=INCOME TAX DEPARTMENT\s)([A-Z ]+)/,
// };

// function App() {
//   const webcamRef = useRef(null);
//   const [showCamera, setShowCamera] = useState(false);
//   const [captureType, setCaptureType] = useState("");
//   const [capturedImage, setCapturedImage] = useState(null);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [ocrText, setOcrText] = useState("");
//   const [isOcrLoading, setIsOcrLoading] = useState(false);

//   const videoConstraints = {
//     width: { ideal: 1920 },
//     height: { ideal: 1080 },
//     facingMode: captureType === "selfie" ? "user" : "environment",
//   };

// //  const parseDocumentDetails = (text) => {
// //   const aadhaar = aadhaarRegex.aadhaar.test(text);
// //   const pan = panRegex.pan.test(text);

// //   if (aadhaar) {
// //     return {
// //       type: "Aadhaar",
// //       aadhaarNumber: text.match(aadhaarRegex.aadhaar)?.[0],
// //       dob: text.match(aadhaarRegex.dob)?.[0],
// //       gender: text.match(aadhaarRegex.gender)?.[0],
// //       name: text.match(aadhaarRegex.name)?.[0],
// //       mobile: text.match(aadhaarRegex.mobile)?.[0],
// //     };
// //   } else if (pan) {
// //     return {
// //       type: "PAN",
// //       panNumber: text.match(panRegex.pan)?.[0],
// //       dob: text.match(panRegex.dob)?.[0],
// //       name: text.match(panRegex.name)?.[1]?.trim(),
// //       mobile: text.match(panRegex.mobile)?.[0],
// //     };
// //   } else {
// //     return { type: "Unknown", raw: text };
// //   }
// // };

// const parseDocumentDetails = (text) => {
//   const aadhaar = aadhaarRegex.aadhaar.test(text);
//   const pan = panRegex.pan.test(text);

//   const mobileMatch = text.match(/(?:\bMobile\b.*?)(\+91[\-\s]?[6-9]\d{9}|[6-9]\d{9})/i);
//   const nameMatch =
//     text.match(/(?:Name|नाम)[\s:]*([A-Z][A-Z\s]{2,})/) ||
//     text.match(/^[A-Z][A-Z\s]{2,}$/m);

//   if (aadhaar) {
//     return {
//       type: "Aadhaar",
//       aadhaarNumber: text.match(aadhaarRegex.aadhaar)?.[0] || "",
//       dob: text.match(aadhaarRegex.dob)?.[1] || "",
//       gender: text.match(aadhaarRegex.gender)?.[1] || "",
//       name: nameMatch?.[1]?.trim() || nameMatch?.[0]?.trim() || "",
//       mobile: mobileMatch?.[1]?.trim() || "",
//     };
//   } else if (pan) {
//     return {
//       type: "PAN",
//       panNumber: text.match(panRegex.pan)?.[0] || "",
//       dob: text.match(panRegex.dob)?.[0] || "",
//       name: text.match(panRegex.name)?.[1]?.trim() || "",
//       mobile: mobileMatch?.[1]?.trim() || "",
//     };
//   } else {
//     return { type: "Unknown", raw: text };
//   }
// };


//   const capturePhoto = async () => {
//     const imageSrc = webcamRef.current.getScreenshot();
//     console.log("Captured Base64 Image:",webcamRef.current ,imageSrc);

//     setCapturedImage(imageSrc);
//     setShowCamera(false);

//     if (captureType === "document") {
//       await handleOCR(imageSrc);
//     }
//   };

//   const handleOCR = async (imageSrc) => {
//     setIsOcrLoading(true);
//     setOcrText("");

//     try {
//       const {
//         data: { text },
//       } = await Tesseract.recognize(imageSrc, "eng", {
//         logger: (m) => console.log(m),
//       });

//       console.log("Extracted text:", text);
//       setOcrText(text);
//     } catch (err) {
//       console.error("Tesseract OCR error:", err);
//       setOcrText("Error: Failed to extract text.");
//     } finally {
//       setIsOcrLoading(false);
//     }
//   };

//   const handleButtonClick = (type) => {
//     setCaptureType(type);
//     setShowCamera(true);
//     setCapturedImage(null);
//   };

//   return (
//     <div className="App">
//       <h1>Document OCR Capture (Client-Side)</h1>
//       <div className="button-container">
//         <button onClick={() => handleButtonClick("document")}>Verify Document</button>
//         <button onClick={() => handleButtonClick("selfie")}>Selfie</button>
//       </div>

//       {showCamera && (
//         <div className="camera-container">
//           <Webcam
//             audio={false}
//             ref={webcamRef}
//             screenshotFormat="image/png"
//             width={540}
//             height={380}
//             className="webcam"
//             playsInline
//             videoConstraints={videoConstraints}
//             mirrored={captureType === "selfie"}
//             onUserMediaError={(err) => {
//               console.error("Camera access denied:", err);
//               setErrorMessage("Camera permission was denied. Please allow access to use this feature.");
//               setShowCamera(false);
//             }}
//           />
//           <button className="capture-btn" onClick={capturePhoto}>
//             Capture {captureType}
//           </button>
//         </div>
//       )}

//       {capturedImage && (
//         <div className="preview-container">
//           <h3>Captured {captureType}</h3>
//           <img src={capturedImage} alt="Captured" />
//         </div>
//       )}

//       {captureType === "document" && capturedImage && (
//         <div className="ocr-output">
//           <h3>Extracted Text:</h3>
//           {isOcrLoading ? (
//             <p>Processing...</p>
//           ) : (
//             <>
//               <textarea
//                 value={ocrText}
//                 readOnly
//                 rows={10}
//                 style={{ width: "100%", maxWidth: "500px" }}
//               />
// <h4>Detected Document Details:</h4>
// <div style={{ background: "#111", padding: "15px", borderRadius: "8px", color: "#fff", textAlign: "left", maxWidth: "500px" }}>
//   {(() => {
//     const details = parseDocumentDetails(ocrText);
//     return (
//       <>
//         <p><strong>Type:</strong> {details.type}</p>
//         {details.aadhaarNumber && <p><strong>Aadhaar No:</strong> {details.aadhaarNumber}</p>}
//         {details.panNumber && <p><strong>PAN No:</strong> {details.panNumber}</p>}
//         {details.name && <p><strong>Name:</strong> {details.name}</p>}
//         {details.dob && <p><strong>DOB:</strong> {details.dob}</p>}
//         {details.gender && <p><strong>Gender:</strong> {details.gender}</p>}
//         {details.mobile && <p><strong>Mobile:</strong> {details.mobile}</p>}
//       </>
//     );
//   })()}
// </div>

//             </>
//           )}
//         </div>
//       )}

//       {errorMessage && (
//         <div className="error-modal">
//           <div className="error-box">
//             <p>{errorMessage}</p>
//             <button onClick={() => setErrorMessage("")}>Close</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./App.css";

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

  const handleButtonClick = (type) => {
    setCaptureType(type);
    setShowCamera(true);
    setCapturedImage(null);
  };

  const capturePhoto = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setShowCamera(false);

    if (captureType === "document") {
      await handleOCR(imageSrc);
    }
  };

 const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const handleOCR = async (imageSrc) => {
  setIsOcrLoading(true);
  setOcrText("");

  const base64Data = imageSrc.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

  let attempts = 0;
  let result = null;

  while (attempts < 3) {
    try {
      const response = await fetch("http://164.52.217.44:8007/api/aadhar_data_extract/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64_data: base64Data }),
      });

      result = await response.json();

      if (result?.name || result?.aadhaar_number) break; // got usable response
    } catch (err) {
      console.error("Attempt failed:", err);
    }

    attempts++;
    await delay(2000); // wait 2 seconds before retry
  }

  if (result) {
    console.log("Final OCR result:", result);
    setOcrText(JSON.stringify(result, null, 2));
  } else {
    setOcrText("⚠️ Failed to get proper response from OCR API.");
  }

  setIsOcrLoading(false);
};


  return (
    <div className="App">
      <h1>Document OCR Capture (via Aadhaar OCR API)</h1>
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
              <h4>Detected Aadhaar Details:</h4>
              <div style={{ background: "#111", padding: "15px", borderRadius: "8px", color: "#fff", textAlign: "left", maxWidth: "500px" }}>
                {(() => {
                  try {
                    const parsed = JSON.parse(ocrText);
                    return (
                      <>
                        <p><strong>Name:</strong> {parsed.name || "Not Found"}</p>
                        <p><strong>DOB:</strong> {parsed.dob || "Not Found"}</p>
                        <p><strong>Gender:</strong> {parsed.gender || "Not Found"}</p>
                        <p><strong>Aadhaar No:</strong> {parsed.aadhaar_number || "Not Found"}</p>
                        <p><strong>Mobile:</strong> {parsed.mobile || "Not Found"}</p>
                      </>
                    );
                  } catch (e) {
                    return <p>⚠️ Failed to parse API response.</p>;
                  }
                })()}
              </div>
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
