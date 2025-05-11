'use client';

import { useState, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { transcribeAudio, generateAIResponse, generateSpeech } from './actions/audio';
import { Session } from 'next-auth';
import HamburgerMenu from './components/HamburgerMenu';
import AssistantSelector, { AssistantType } from './components/AssistantSelector';

interface ExtendedSession extends Session {
  user: {
    id?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    email?: string | null;
    image?: string | null;
    name?: string | null;
  }
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Home() {
  const { data: session, status } = useSession() as { data: ExtendedSession | null, status: string };
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [assistantType, setAssistantType] = useState<AssistantType>('Personal Assistant');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Handle assistant type change
  const handleAssistantTypeChange = (type: AssistantType) => {
    setAssistantType(type);
    setChatHistory([]); // Clear chat history when assistant type changes
  };

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
      const aiResponse = await generateAIResponse(transcriptionText, session?.user?.name || 'User', assistantType, updatedHistory);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-2xl text-white/80"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-gradient-dark"
    >
      <div className="flex-none p-4 md:p-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white/90">
            AI Voice Chat Assistant
          </h1>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="w-full md:w-64">
              <AssistantSelector
                selectedType={assistantType}
                onSelect={handleAssistantTypeChange}
              />
            </div>
            
            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {session?.user?.image && (
                <motion.img
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-10 h-10 rounded-full ring-2 ring-accent-blue/30"
                />
              )}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm"
              >
                <p className="font-semibold text-white/80">
                  {session?.user?.firstName || session?.user?.name || 'User'}
                </p>
                <button
                  onClick={() => signOut()}
                  className="text-accent-pink hover:text-accent-pink/80 transition-colors"
                >
                  Sign out
                </button>
              </motion.div>
            </div>

            {/* Mobile Hamburger Menu */}
            {session?.user && (
              <HamburgerMenu
                userName={session.user.name || 'User'}
                userImage={session.user.image}
                firstName={session.user.firstName}
              />
            )}
          </div>
        </motion.div>
      </div>
        
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex-grow flex flex-col mx-4 md:mx-8 mb-4 md:mb-8"
      >
        <div className="max-w-4xl w-full mx-auto flex-grow flex flex-col bg-dark-200/50 backdrop-blur-lg rounded-lg shadow-xl overflow-hidden border border-white/5">
          <div 
            ref={chatContainerRef}
            className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin scrollbar-thumb-dark-100 scrollbar-track-transparent"
          >
            <AnimatePresence>
              {chatHistory.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 400 }}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-accent-blue/20 text-white/90 backdrop-blur-sm'
                        : 'bg-dark-100/50 text-white/80 backdrop-blur-sm'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-accent-blue/60' : 'text-white/40'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className="bg-dark-100/50 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-white/60">Processing your message...</p>
                </div>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex-none border-t border-white/5 p-4 bg-dark-300/50"
          >
            <div className="flex justify-center items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  isRecording
                    ? 'bg-accent-pink/90 hover:bg-accent-pink text-white shadow-lg shadow-accent-pink/20'
                    : 'bg-accent-blue/90 hover:bg-accent-blue text-white shadow-lg shadow-accent-blue/20'
                }`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </motion.button>
              <audio id="audio" className="hidden" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.main>
  );
} 