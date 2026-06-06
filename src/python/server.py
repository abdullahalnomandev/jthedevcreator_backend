import uvicorn
import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path("../../.env")

load_dotenv(dotenv_path=env_path)

PORT = os.getenv("PYTHON_PORT")
IP_ADDRESS = os.getenv("IP_ADDRESS")

if __name__ == "__main__":
    uvicorn.run("main:app", host=str(IP_ADDRESS), port=int(PORT), reload=True)