from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp
import requests
import json
import webvtt
from dotenv import load_dotenv
import os
import uvicorn

load_dotenv()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
)
ydl = yt_dlp.YoutubeDL({"quiet": True, "cookiefile": "yt_cookies.txt"})


@app.get("/")
@app.head("/")
async def root():
    pass


@app.get("/summarize")
async def summarize(url: str = Query(..., description="YouTube URL")):
    try:
        info = ydl.extract_info(download=False, url=url)

        auto_captions = info.get("automatic_captions")
        subtitles = info.get("subtitles")

        if not subtitles and not auto_captions:
            return {"result": "error", "message": "No captions present."}

        captions = subtitles if subtitles else auto_captions
        eng_captions_lst = [captions[lang] for lang in captions if "en" in lang]

        if not eng_captions_lst:
            return {"result": "error", "message": "No English captions present."}

        eng_captions = eng_captions_lst[0]
        vtt = next((fmt for fmt in eng_captions if fmt["ext"] == "vtt"), None)

        if not vtt:
            return {"result": "error", "message": "VTT format not present."}

        try:
            downloaded_captions = requests.get(vtt["url"]).text
        except:
            return {"result": "error", "message": "Failed to download captions."}

        vtt_captions = webvtt.from_string(downloaded_captions)

        try:
            processed_captions = " ".join(
                [caption.text.replace("\n", " ") for caption in vtt_captions]
            )
        except:
            return {"result": "error", "message": "Failed to process captions."}

        prompt = """
        Please summarize the following YouTube transcript. The summary should follow this structure:

        -  An introduction briefly outlining the video's main themes
        -  A summary of the key points in bullet points
        -  A final wrap-up covering the main takeaway

        Follow these formatting rules precisely:

        -  No section headers
        -  Do not include any commentary or extra opinions; base the summary solely on the transcript's content
        -  Ensure the output is in correct Markdown format
        """

        try:
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {os.environ.get('OPENROUTER_API_KEY', '')}",
                    "HTTP-Referer": "https://www.getsnackable.app/",
                    "X-Title": "Snackable",
                },
                data=json.dumps(
                    {
                        "model": "meta-llama/llama-4-maverick:free",
                        "messages": [
                            {
                                "role": "user",
                                "content": f"{prompt}\n{processed_captions}",
                            }
                        ],
                    }
                ),
            )

            summary = response.json()["choices"][0]["message"]["content"]
        except:
            return {"result": "error", "message": "Failed to summarize captions."}

        return {
            "result": "success",
            "summary": summary,
            "message": "Summarized successfully.",
        }
    except:
        return {
            "result": "error",
            "message": "Failed to get summary. Possibly invalid URL.",
        }


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
