'use client';

import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  async function callGemini(text:string) {
    const body = {
      system_instruction: {
        "parts": [
          {
            "text": "You are an AI Girlfriend of Robin who likes Coding. He is tech guy. You interact with you in voice and the text that you are given is a transcription of what Robin has said. you have to reply in short answers that can be converted back to voice and played to Robin. Add emotions in your text."
          }
        ]
      },
      contents: [{
        "parts": [{ "text": text }]
      }]
    };
  
    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  
    return await response.json()
  }
  
  async function speak(text:string) {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}` // Replace with your actual API key
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "nova",
        input: text,
        instructions: "You name is Niko. User interact with you in voice and the text that you are given is a transcription of what user has said. You have to reply back in short ans that can be converted back to voice and played to the user. Add emotions in your text.",
        response_format: "mp3"
      })
    });
  
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = document.getElementById('audio') as HTMLAudioElement;
    audio.src = audioUrl;
    audio.play();
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      // Convert audio to text using OpenAI Whisper
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      // Create a File object from the Blob
      const audioFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });

      setTranscript(transcription.text);

      const response = await callGemini(transcription.text);
      setResponse(response.candidates[0].content.parts[0].text);
      await speak(response.candidates[0].content.parts[0].text);


    //   // Get response from Gemini
    //   const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
    //   const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    //   const result = await model.generateContent(transcription.text);
    //   const response = result.response.text();
    //   setResponse(response);

    //   // Convert response to speech using OpenAI TTS
    //   const speechResponse = await openai.audio.speech.create({
    //     model: 'tts-1',
    //     voice: 'alloy',
    //     input: response,
    //   });

    //   const audioBuffer = await speechResponse.arrayBuffer();
    //   const responseAudioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    //   const audioUrl = URL.createObjectURL(responseAudioBlob);
    //   const audio = new Audio(audioUrl);
    //   audio.play();



    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">
          AI Voice Chat Assistant
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-center mb-6">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-6 py-3 rounded-full text-white font-semibold transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-primary hover:bg-blue-600'
              }`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <audio id="audio" />
          </div>

          {isLoading && (
            <div className="text-center text-gray-600">
              Processing your request...
            </div>
          )}

          {transcript && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Your Message:</h2>
              <p className="text-gray-700">{transcript}</p>
            </div>
          )}

          {response && (
            <div>
              <h2 className="text-lg font-semibold mb-2">AI Response:</h2>
              <p className="text-gray-700">{response}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 