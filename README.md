# AI Voice Chat Assistant

A Next.js application that allows users to interact with an AI assistant using voice input and output. The application uses Gemini for generating responses and OpenAI for speech-to-text and text-to-speech conversion.

## Features

- Voice input recording
- Speech-to-text conversion using OpenAI Whisper
- AI response generation using Google's Gemini
- Text-to-speech conversion using OpenAI TTS
- Modern UI with Tailwind CSS

## Prerequisites

- Node.js 18+ installed
- OpenAI API key
- Google Gemini API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your API keys:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Click the "Start Recording" button to begin recording your voice
2. Speak your message
3. Click "Stop Recording" when you're done
4. Wait for the AI to process your message and respond
5. The response will be displayed on screen and played through your speakers

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI API (Whisper & TTS)
- Google Gemini API
- Web Audio API 


