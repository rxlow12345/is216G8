from io import BytesIO
import numpy as np
import tempfile
import subprocess
import json
import os
import sys
import uuid

def run_inference(image_bytes: bytes):
    """
    Save the uploaded image to a temp folder, run the SpeciesNet CLI script,
    then read the predictions JSON and return results.
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        subfolder = os.path.join(tmpdir, "images")
        os.makedirs(subfolder, exist_ok=True)
        # Save image to temp folder
        filename = f"{uuid.uuid4().hex}.jpg"
        image_path = os.path.join(subfolder, filename)
        with open(image_path, "wb") as f:
            f.write(image_bytes)
        
        # Output JSON file
        out_json = os.path.join(tmpdir, "predictions.json")
        print('out_json: ', out_json)
        # Run the SpeciesNet CLI
        venv_python = sys.executable  # this points to the running Python in your venv

        cmd = [
            venv_python,
            "-m", "speciesnet.scripts.run_model",
            "--folders", tmpdir,
            "--predictions_json", out_json
        ]

        try:
            subprocess.run(cmd, check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as e:
            print("Command failed!")
            print("Return code:", e.returncode)
            print("Command:", ' '.join(cmd))
            print("STDOUT:\n", e.stdout)
            print("STDERR:\n", e.stderr)
            raise
        
        # Read the predictions
        with open(out_json, "r") as f:
            predictions = json.load(f)
    
    # predictions is usually a dict mapping filenames → predictions
    # return only the uploaded image result
    return predictions
