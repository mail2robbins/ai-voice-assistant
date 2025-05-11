'use client';

import { useState, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { transcribeAudio, generateAIResponse, generateSpeech } from './actions/audio';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Redirect to sign in if not authenticated
  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  // Scroll to bottom of chat when history updates
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

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

      // Add user message to chat history
      const userMessage: ChatMessage = {
        role: 'user',
        content: transcriptionText,
        timestamp: new Date()
      };
      const updatedHistory = [...chatHistory, userMessage];
      setChatHistory(updatedHistory);

      // Step 2: Generate AI response using server action with chat history
      const aiResponse = await generateAIResponse(transcriptionText, updatedHistory);
      setResponse(aiResponse);

      // Add AI response to chat history
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      setChatHistory([...updatedHistory, assistantMessage]);

      // Step 3: Generate speech from AI response using server action
      const base64Audio = await generateSpeech(aiResponse);
      
      // Convert base64 back to audio and play
      const audioData = Buffer.from(base64Audio, 'base64');
      const responseAudioBlob = new Blob([audioData], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(responseAudioBlob);
      const audio = document.getElementById('audio') as HTMLAudioElement;
      audio.src = audioUrl;
      audio.play();

      // Scroll to the latest message
      scrollToBottom();
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">
            AI Voice Chat Assistant
          </h1>
          <div className="flex items-center space-x-4">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div className="text-sm">
              <p className="font-semibold">{session?.user?.name}</p>
              <button
                onClick={() => signOut()}
                className="text-red-600 hover:text-red-800"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div 
            ref={chatContainerRef}
            className="h-[500px] overflow-y-auto p-6 space-y-4"
          >
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-gray-500">Processing your message...</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex justify-center items-center space-x-4">
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
              <audio id="audio" className="hidden" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 