"""PromptLab API Server

Run with: python main.py
For dev with auto-reload: RELOAD=1 python main.py
"""

import os
import uvicorn
from app.api import app

if __name__ == "__main__":
    use_reload = os.environ.get("RELOAD", "").lower() == "1"
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=use_reload)
