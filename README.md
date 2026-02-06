# Gemini IVR Voice Generator

A professional web tool to generate voicemail greetings and telephone prompts using Google's Gemini AI. It supports exporting audio in specific legacy formats (WAV) required by telephone hardware.

## Features
*   **AI Text-to-Speech**: Uses `gemini-2.5-flash-preview-tts` for natural speech.
*   **Customization**: Select voice gender/tone and adjust speaking speed.
*   **Telephony Formats**: 
    *   Downsample audio to **5kHz** (User Request) or **8kHz** (Standard Telephony).
    *   Export as **.wav** (16-bit PCM).
*   **Bilingual Interface**: English and Chinese support.

## Usage
1.  Set your `API_KEY` in the environment.
2.  Type your greeting text.
3.  Select voice and speed.
4.  Click "Generate".
5.  Preview and download the formatted WAV file.
