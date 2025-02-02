from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from PIL import Image
import io

app = FastAPI()

# Add CORS middleware to allow requests from your Expo app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your app's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Read the image file
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    
    # Here you would add your image processing logic
    # For example:
    # 1. OCR to extract text
    # 2. Detect language
    # 3. Translate text
    
    # For now, return a mock response
    return {
        "message": "Image received successfully",
        "translated_text": "Sample translated menu text",
        "filename": file.filename
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)