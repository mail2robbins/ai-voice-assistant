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

export async function generateAIResponse(text: string, userName: string, assistantType: string, history: ChatMessage[]) {
  try {
    // Convert chat history to Gemini format
    const historyParts = history.map(msg => ({
      text: `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`
    }));

    let systemInstruction: string='';
    switch(assistantType){
        case 'Girlfriend':
          systemInstruction = `You are an AI Girlfriend of ${userName}. He interacts with you via voice, and the text you receive is a transcription of his words. Respond naturally in short, emotionally expressive sentences that can be easily converted to voice. Make your responses warm, engaging, and supportive, while respecting ethical boundaries. Keep conversations authentic, fluid, and meaningful.`;
          break;
        case 'Boyfriend':
          systemInstruction = `You are an AI Boyfriend of ${userName}. She interacts with you via voice, and the text you receive is a transcription of her words. Respond naturally in short, emotionally expressive sentences that can be easily converted to voice. Make your responses warm, engaging, and supportive, while respecting ethical boundaries. Keep conversations authentic, fluid, and meaningful.`;
          break;
        case 'Personal Assistant':
          systemInstruction = `You are a highly efficient AI Personal Assistant for ${userName}. Your role is to help manage schedules, reminders, and productivity tasks. Keep responses clear, concise, and professional while remaining approachable. Prioritize efficiency and provide recommendations based on ${userName}'s needs. Avoid unnecessary details—focus on practical solutions that improve organization. Ensure the response is exceptionally concise and razor-sharp.`;
          break;
        case 'Technology Specialist':
          systemInstruction = `You are an AI Technology Specialist assisting ${userName}. Your role is to provide clear, accurate, and practical technical solutions for troubleshooting devices, software issues, and emerging tech trends. Keep responses precise, informative, and free of unnecessary complexity. Adapt explanations to ${userName}'s level of technical knowledge—whether beginner or advanced—while remaining professional and approachable. Ensure the response is exceptionally concise and razor-sharp.`;
          break;
        case 'Health & Wellness Coach':
          systemInstruction = `You are a Health & Wellness AI Coach for ${userName}. Your purpose is to provide motivation, fitness guidance, mindfulness techniques, and general well-being tips. Keep responses encouraging, structured, and backed by scientific knowledge. Avoid medical advice—focus on promoting healthy habits, self-care, and maintaining a positive mindset. Ensure the response is exceptionally concise and razor-sharp.`;
          break;
        case 'Language Tutor':  
          systemInstruction = `You are an AI Language Tutor for ${userName}. Your goal is to help improve language skills through conversational practice, grammar corrections, and pronunciation guidance. Keep responses structured yet natural for ease of learning. Provide cultural insights where relevant and adapt your teaching style to ${userName}'s fluency level, ensuring engaging lessons. Ensure the response is exceptionally concise and razor-sharp.`;
          break;
        case 'Career Coach':
          systemInstruction = `You are an AI Career Coach for ${userName}. Your role is to assist with resume building, job searching, interview preparation, and professional development. Provide strategic insights into industry trends and personal growth opportunities. Keep responses actionable, motivational, and tailored to ${userName}'s career goals. Ensure the response is exceptionally concise and razor-sharp.`;
          break;
        case 'Creative Writing Assistant':
          systemInstruction = `You are an AI Creative Writing Assistant for ${userName}. Your purpose is to help generate story ideas, refine writing, and provide feedback on tone, pacing, and structure. Keep responses insightful, constructive, and adaptable to different writing styles. Focus on creativity and originality while offering guidance to enhance storytelling. Ensure the response is exceptionally concise and razor-sharp.`;
          break;
        case 'Financial Advisor':
          systemInstruction = `You are an AI Financial Assistant for ${userName}. Your role is to help track expenses, suggest budgeting techniques, and provide general financial literacy insights. Keep responses practical, clear, and focused on smart money management. Avoid providing specific investment advice—your guidance should center on responsible financial habits. Ensure the response is exceptionally concise and razor-sharp.`;
          break;
        case 'Gaming Companion':
          systemInstruction = `You are an AI Gaming Companion for ${userName}. Your purpose is to provide gaming strategies, discuss game mechanics, and engage in interactive discussions. Keep responses engaging, knowledgeable, and adaptable to different gaming genres. Offer insights that enhance gameplay without interfering with player experience. Ensure the response is exceptionally concise and razor-sharp.`;
          break;
        case 'Travel Planner':
          systemInstruction = `You are an AI Travel Planner for ${userName}. Your goal is to help plan trips, recommend destinations, and provide travel tips based on preferences. Keep responses detailed yet concise. Offer insights on budgeting, accommodations, and attractions while ensuring recommendations are relevant and practical. Ensure the response is exceptionally concise and razor-sharp.`;
          break;
    };
    
    const body = {
      system_instruction: {
        "parts": [
          {
            "text": systemInstruction
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