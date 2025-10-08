import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff,
  Settings, Users, MessageCircle, MoreVertical,
  Camera, CameraOff, Volume2, VolumeX, Maximize,
  Minimize, RotateCcw, Share2, Clock, User, AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';

import { useAppStore } from '../store/appStore';

export const InterviewRoom: React.FC = () => {
  const { interviewId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useAppStore();
  
  // Estados da entrevista
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [interviewDuration, setInterviewDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Refs para vídeo e stream
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Dados da entrevista vindos da navegação
  const interviewData = location.state || {
    company: 'Empresa',
    position: 'Posição',
    interviewerName: 'Entrevistador',
    time: '14:00',
    date: new Date().toISOString()
  };

  useEffect(() => {
    // Inicializar mídia e conexão
    initializeMedia();

    // Timer da duração da entrevista
    const durationTimer = setInterval(() => {
      setInterviewDuration(prev => prev + 1);
    }, 1000);

    // Cleanup ao desmontar componente
    return () => {
      clearInterval(durationTimer);
      cleanupMedia();
    };
  }, []);

  // Effect para atualizar indicador de áudio
  useEffect(() => {
    let animationFrame: number;

    const updateAudioLevel = () => {
      if (isAudioOn && analyserRef.current) {
        // Força re-render para atualizar o indicador visual
        setInterviewDuration(prev => prev);
      }
      animationFrame = requestAnimationFrame(updateAudioLevel);
    };

    if (isAudioOn && connectionStatus === 'connected') {
      updateAudioLevel();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isAudioOn, connectionStatus]);

  const initializeMedia = async () => {
    try {
      setIsInitializing(true);
      setPermissionError(null);

      // Verificar se o navegador suporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso à câmera e microfone');
      }

      // Solicitar permissões para câmera e microfone
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      // Configurar vídeo local
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true; // Evitar feedback
      }

      // Configurar análise de áudio
      setupAudioAnalysis(stream);

      // Simular conexão após obter mídia
      setTimeout(() => {
        setConnectionStatus('connected');
        setIsInitializing(false);
        addNotification({
          type: 'success',
          message: 'Conectado à entrevista!'
        });
      }, 1500);

    } catch (error: any) {
      console.error('Error accessing media:', error);
      setIsInitializing(false);
      setConnectionStatus('disconnected');

      let errorMessage = 'Erro ao acessar câmera e microfone';

      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permissão negada para câmera/microfone. Verifique as configurações do navegador.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Câmera ou microfone não encontrados.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Câmera ou microfone já estão sendo usados por outro aplicativo.';
      }

      setPermissionError(errorMessage);
      addNotification({
        type: 'error',
        message: errorMessage
      });
    }
  };

  const setupAudioAnalysis = (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
    } catch (error) {
      console.error('Error setting up audio analysis:', error);
    }
  };

  const cleanupMedia = () => {
    // Parar todas as tracks do stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      localStreamRef.current = null;
    }

    // Fechar contexto de áudio
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Limpar timeouts
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoOn;
      });

      setIsVideoOn(!isVideoOn);
      addNotification({
        type: 'info',
        message: isVideoOn ? 'Câmera desligada' : 'Câmera ligada'
      });
    }
  }, [isVideoOn, addNotification]);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !isAudioOn;
      });

      setIsAudioOn(!isAudioOn);
      addNotification({
        type: 'info',
        message: isAudioOn ? 'Microfone desligado' : 'Microfone ligado'
      });
    }
  }, [isAudioOn, addNotification]);

  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn(!isSpeakerOn);

    // Controlar volume do vídeo remoto
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !isSpeakerOn;
    }

    addNotification({
      type: 'info',
      message: isSpeakerOn ? 'Alto-falante desligado' : 'Alto-falante ligado'
    });
  }, [isSpeakerOn, addNotification]);

  const switchCamera = useCallback(async () => {
    if (!localStreamRef.current) return;

    try {
      // Parar stream atual
      localStreamRef.current.getTracks().forEach(track => track.stop());

      // Alternar entre câmera frontal e traseira
      const currentFacingMode = isVideoOn ? 'user' : 'environment';
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: newFacingMode
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = newStream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
      }

      setupAudioAnalysis(newStream);

      addNotification({
        type: 'success',
        message: 'Câmera alternada'
      });
    } catch (error) {
      console.error('Error switching camera:', error);
      addNotification({
        type: 'error',
        message: 'Erro ao alternar câmera'
      });
    }
  }, [isVideoOn, addNotification]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error('Error exiting fullscreen:', err);
      });
    }
  }, []);

  const endCall = useCallback(() => {
    cleanupMedia();
    addNotification({
      type: 'info',
      message: 'Entrevista finalizada'
    });
    navigate('/jobs');
  }, [navigate, addNotification]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const sendMessage = useCallback(() => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  }, [newMessage]);

  const getAudioLevel = useCallback(() => {
    if (!analyserRef.current) return 0;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    return Math.min(100, (average / 255) * 100);
  }, []);

  const retryMediaAccess = useCallback(() => {
    setPermissionError(null);
    initializeMedia();
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black flex flex-col"
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
    >
      {/* Header da entrevista */}
      <div className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'}`} />
              <span className="text-sm font-medium">
                {connectionStatus === 'connected' ? 'Conectado' : connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-300">
              <Clock className="w-4 h-4" />
              {formatDuration(interviewDuration)}
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold">{interviewData.company}</h2>
            <p className="text-sm text-gray-300">{interviewData.position}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Área principal de vídeo */}
      <div className="flex-1 relative">
        {/* Vídeo remoto (entrevistador) */}
        <div className="absolute inset-0">
          {permissionError ? (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center p-6">
              <div className="text-center text-white max-w-md">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Erro de Permissão</h3>
                <p className="text-gray-300 mb-6">{permissionError}</p>
                <div className="space-y-3">
                  <Button
                    onClick={retryMediaAccess}
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                  >
                    Tentar Novamente
                  </Button>
                  <Button
                    variant="outline"
                    onClick={endCall}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700/50 w-full"
                  >
                    Sair da Entrevista
                  </Button>
                </div>
              </div>
            </div>
          ) : isInitializing ? (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4" />
                <p>Inicializando câmera e microfone...</p>
                <p className="text-sm text-gray-400 mt-2">Permita o acesso quando solicitado</p>
              </div>
            </div>
          ) : connectionStatus === 'connected' ? (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              {/* Placeholder para vídeo remoto */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-white text-xl font-semibold">{interviewData.interviewerName}</h3>
                <p className="text-gray-300">Entrevistador</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4" />
                <p>Conectando à entrevista...</p>
              </div>
            </div>
          )}
        </div>

        {/* Vídeo local (usuário) */}
        <div className="absolute bottom-20 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
          {isVideoOn && localStreamRef.current ? (
            <div className="relative w-full h-full">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover transform scale-x-[-1]"
                autoPlay
                playsInline
                muted
              />
              {/* Indicador de áudio */}
              {isAudioOn && (
                <div className="absolute bottom-1 left-1">
                  <div className="flex items-center gap-1">
                    <Mic className="w-3 h-3 text-green-400" />
                    <div className="w-8 h-1 bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-400 transition-all duration-100"
                        style={{ width: `${getAudioLevel()}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <CameraOff className="w-8 h-8 text-gray-400" />
            </div>
          )}

          {/* Botão para trocar câmera (mobile) */}
          {isVideoOn && (
            <button
              onClick={switchCamera}
              className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
            >
              <RotateCcw className="w-3 h-3 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Controles da entrevista */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            variant="ghost"
            className={`w-14 h-14 rounded-full ${isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'} text-white`}
            onClick={toggleAudio}
          >
            {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>
          
          <Button
            size="lg"
            variant="ghost"
            className={`w-14 h-14 rounded-full ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'} text-white`}
            onClick={toggleVideo}
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>
          
          <Button
            size="lg"
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white"
            onClick={endCall}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
          
          <Button
            size="lg"
            variant="ghost"
            className={`w-14 h-14 rounded-full ${isSpeakerOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-500'} text-white`}
            onClick={toggleSpeaker}
          >
            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </Button>
          
          <Button
            size="lg"
            variant="ghost"
            className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Chat lateral (mobile) */}
      {showChat && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-black/90 backdrop-blur-sm border-l border-gray-700 z-30">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Chat da Entrevista</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => setShowChat(false)}
                >
                  ×
                </Button>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              {chatMessages.length === 0 ? (
                <p className="text-gray-400 text-center">Nenhuma mensagem ainda</p>
              ) : (
                <div className="space-y-3">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="bg-gray-800 rounded-lg p-3">
                      <p className="text-white text-sm">{message.text}</p>
                      <span className="text-gray-400 text-xs">{message.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none text-sm"
                />
                <Button
                  size="sm"
                  onClick={sendMessage}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
