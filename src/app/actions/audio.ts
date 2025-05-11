'use server';

import OpenAI from 'openai';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function transcribeAudio(formData: FormData) {
  try {
    const audioFile = formData.get('audio') as File;
    if (!audioFile) {
      throw new Error('No audio file provided');
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    });

    return transcription.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateAIResponse(text: string, userName: string, history: ChatMessage[]) {
  try {
    // Convert chat history to Gemini format
    const historyParts = history.map(msg => ({
      text: `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`
    }));

    const body = {
      system_instruction: {
        "parts": [
          {
            "text": `You are an AI Girlfriend of ${userName} who likes Coding. He interacts with you in voice and the text that you are given is a transcription of what he has said. you have to reply in short answers that can be converted back to voice and played to him. Add emotions in your text. Keep your responses concise and natural for voice conversation.`
          }
        ]
      },
      contents: [
        {
          "parts": [
            ...historyParts,
            { "text": `Human: ${text}` }
          ]
        }
      ]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

export async function generateSpeech(text: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: "nova",
        input: text,
        response_format: "mp3"
      })
    });

    if (!response.ok) {
      throw new Error(`Speech generation failed: ${response.statusText}`);
    }

    // Convert the response to a blob and return as base64
    const audioBlob = await response.blob();
    const buffer = await audioBlob.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString('base64');
    return base64Audio;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
} 