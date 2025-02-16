from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp
import requests
import json
import webvtt
from dotenv import load_dotenv
import os

load_dotenv()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
)
ydl = yt_dlp.YoutubeDL({"quiet": True})


@app.get("/summarize")
async def summarize(url: str = Query(..., description="YouTube URL")):
    try:
        info = ydl.extract_info(download=False, url=url)

        auto_captions = info.get("automatic_captions")
        subtitles = info.get("subtitles")

        if not subtitles and not auto_captions:
            return {"result": "error", "message": "No captions present."}

        captions = subtitles if subtitles else auto_captions

        en = captions.get("en")
        en_orig = captions.get("en-orig")

        if not en and not en_orig:
            return {"result": "error", "message": "No English captions present."}

        eng_captions = en if en else en_orig
        vtt = next((fmt for fmt in eng_captions if fmt["ext"] == "vtt"), None)

        if not vtt:
            return {"result": "error", "message": "VTT format not present."}

        vtt_captions = webvtt.from_string(requests.get(vtt["url"]).text)
        processed_captions = " ".join(
            [caption.text.replace("\n", " ") for caption in vtt_captions]
        )

        prompt = "Summarize the following YouTube transcript concisely, covering all key points. Plaintext output only."

        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
                "HTTP-Referer": "https://www.getsnackable.app/",
                "X-Title": "Snackable",
            },
            data=json.dumps(
                {
                    "model": "google/gemini-2.0-flash-exp:free",
                    "messages": [
                        {"role": "user", "content": f"{prompt}\n{processed_captions}"}
                    ],
                }
            ),
        )
        summary = response.json()["choices"][0]["message"]["content"]

        return {"result": "success", "summary": summary, "message": "Summarized successfully."}
    except:
        return {"result": "error", "message": "Failed to get summary. Possibly invalid URL."}
