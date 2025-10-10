from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from app.inference import run_inference
import os
import uvicorn

port = int(os.environ.get("PORT", 8080))  # use Cloud Run port if provided
app = FastAPI(title="SpeciesNet API", version="1.0")

# Allow requests from localhost for testing, or "*" for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["*"] for all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "SpeciesNet API is running!"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Read image bytes
    contents = await file.read()

    # Run inference
    result = run_inference(contents)

    return {"predictions": result}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)