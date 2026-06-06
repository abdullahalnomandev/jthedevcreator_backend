from fastapi import FastAPI, File, UploadFile
from deepface import DeepFace
from fastapi.responses import JSONResponse
from pathlib import Path
import os

TEMP_DIR = Path("temp_images")

if not TEMP_DIR.exists():
    TEMP_DIR.mkdir()

def remove_image(file_path: Path):
    try:
        os.remove(file_path)
    except Exception as e:
        print(f"Error removing file {file_path}: {e}")

def save_image(file: UploadFile):

    filename = file.filename
    filePath = TEMP_DIR / filename
    with open( filePath, "wb") as f:
        f.write(file.file.read())
    return filePath
    

app = FastAPI()

@app.get('/')
async def root():
    return {"message": "Hello World"}

@app.post("/face-verify")
async def create_fact(faceImage: UploadFile = File(...), nidImage: UploadFile = File(...)) -> dict:
    
    faceImage = save_image(faceImage)
    nidImage = save_image(nidImage)

    try:
        result = DeepFace.verify(nidImage, faceImage)
        
        verification_result = {
            "verified": result['verified'],
            "distance": result['distance'],
            "threshold": result['threshold']
        }

        remove_image(faceImage)
        remove_image(nidImage)

        return JSONResponse(content=verification_result)

    except Exception as e:
        remove_image(faceImage)
        remove_image(nidImage)

        print(e)
        return JSONResponse(content={"message": "faield to verify the face"})
