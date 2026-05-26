import os
import base64
from dotenv import load_dotenv

load_dotenv()

from groq import Groq
from sarvamai import SarvamAI
from deepgram import DeepgramClient

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
sarvam_client = SarvamAI(api_subscription_key=os.getenv("SARVAM_API_KEY"))
deepgram_client = DeepgramClient(api_key=os.getenv("DEEPGRAM_API_KEY"))


def ask_llm(messages: list, system_prompt: str):
    stream = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "system", "content": system_prompt}] + messages,
        stream=True
    )
    for chunk in stream:
        token = chunk.choices[0].delta.content
        if token:
            yield token


def speak(text: str) -> bytes:
    response = sarvam_client.text_to_speech.convert(
        text=text,
        target_language_code="en-IN",
        model="bulbul:v3",
        speaker="shubh"
    )
    audio_bytes = base64.b64decode(response.audios[0])
    return audio_bytes

def transcribe(audio_bytes: bytes) -> str:
    payload = {"buffer": audio_bytes}
    options = {
        "model": "nova-2",
        "language": "en-IN",
        "smart_format": True
    }
    response = deepgram_client.listen.prerecorded.v("1").transcribe_file(
        payload,
        options
    )
    return response.results.channels[0].alternatives[0].transcript