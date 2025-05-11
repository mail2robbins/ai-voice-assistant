'use client';

import { useState, useRef } from 'react';
import { transcribeAudio, generateAIResponse, generateSpeech } from './actions/audio';

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
        const recordedAudioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(recordedAudioBlob);
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

  const processAudio = async (recordedAudioBlob: Blob) => {
    setIsLoading(true);
    try {
      // Create FormData and append the audio file
      const formData = new FormData();
      formData.append('audio', new File([recordedAudioBlob], 'audio.wav', { type: 'audio/wav' }));

      // Step 1: Transcribe audio using server action
      const transcriptionText = await transcribeAudio(formData);
      setTranscript(transcriptionText);

      // Step 2: Generate AI response using server action
      const aiResponse = await generateAIResponse(transcriptionText);
      setResponse(aiResponse);

      // Step 3: Generate speech from AI response using server action
      const base64Audio = await generateSpeech(aiResponse);
      
      // Convert base64 back to audio and play
      const audioData = Buffer.from(base64Audio, 'base64');
      const responseAudioBlob = new Blob([audioData], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(responseAudioBlob);
      const audio = document.getElementById('audio') as HTMLAudioElement;
      audio.src = audioUrl;
      audio.play();

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