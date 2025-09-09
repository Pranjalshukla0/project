from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
from paddleocr import PaddleOCR

app = Flask(__name__)
CORS(app)

ocr = PaddleOCR(use_angle_cls=True, lang='en')

@app.route('/ocr', methods=['POST'])
def extract_text():
    try:
        data = request.json
        image_data = data['image']

        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # ✅ Preprocessing for better OCR
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(
            gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
        )
        resized = cv2.resize(
            thresh, None, fx=2, fy=2, interpolation=cv2.INTER_LINEAR
        )

        # ✅ Perform OCR
        result = ocr.predict(resized)

        # Debug log
        print("Raw OCR Result:", result)

        if not result or len(result[0]) == 0:
            return jsonify({"text": "No text found."})

        # ✅ Extract text safely
        extracted_text = ""
        for box in result[0]:
            if isinstance(box, tuple) and len(box) >= 2:
                extracted_text += box[1][0] + "\n"

        return jsonify({"text": extracted_text.strip()})

    except Exception as e:
        print("🔥 OCR ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
