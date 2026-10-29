'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, X, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { VehiclePhoto } from '@/lib/types';
import { compressImage, savePhotoToIndexedDb } from '@/lib/imageStorage';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (photo: VehiclePhoto) => void;
  theme: 'light-cyan' | 'dark-spring';
}

export function CameraCaptureModal({
  isOpen,
  onClose,
  onPhotoCaptured,
  theme,
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');

  const isLight = theme === 'light-cyan';

  const stopCamera = React.useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não suportada neste navegador.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera error:', err);
      setCameraError('Não foi possível acessar a câmera do dispositivo. Verifique as permissões ou envie uma foto da galeria.');
      setCameraActive(false);
    }
  };

  // Clean up media stream when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setCaption('');
    setCameraError(null);
    onClose();
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    const vw = videoRef.current.videoWidth || 640;
    const vh = videoRef.current.videoHeight || 480;

    // Scale down if larger than 800px to keep storage lightweight
    const maxDim = 800;
    let width = vw;
    let height = vh;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(videoRef.current, 0, 0, width, height);

    // Compressed JPEG dataUrl (~40KB)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 800, 800, 0.65);
      setCapturedImage(compressed);
      stopCamera();
    } catch (err) {
      console.warn('Error compressing uploaded file:', err);
      // Fallback
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (typeof loadEvent.target?.result === 'string') {
          setCapturedImage(loadEvent.target.result);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    if (!capturedImage) return;
    const photoId = `photo_${Date.now()}`;
    const newPhoto: VehiclePhoto = {
      id: photoId,
      dataUrl: capturedImage,
      caption: caption.trim() || 'Foto de avaria do veículo',
      createdAt: new Date().toISOString(),
    };
    savePhotoToIndexedDb(photoId, capturedImage, newPhoto.caption).catch(() => {});
    onPhotoCaptured(newPhoto);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden p-6 transition-all ${
        isLight
          ? 'bg-white border-zinc-200 text-zinc-900'
          : 'bg-zinc-900 border-zinc-800 text-zinc-100'
      }`}>
        {/* Header with X */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${isLight ? 'bg-cyan-100 text-cyan-700' : 'bg-emerald-950/70 text-emerald-400'}`}>
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Câmera de Avarias do Veículo</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Registre fotos para a galeria do orçamento</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            type="button"
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="my-5 space-y-4">
          {capturedImage ? (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-72 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={capturedImage}
                  alt="Avaria capturada"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-600 dark:text-zinc-300">
                  Descrição da Avaria / Peça (Opcional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ex: Para-choque dianteiro trincado, arranhão na porta..."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-hidden transition-colors ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200'
                      : 'bg-zinc-800/80 border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-950 text-white'
                  }`}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCapturedImage(null);
                    startCamera();
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 ${
                    isLight
                      ? 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                      : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Tirar Outra
                </button>
                <button
                  type="button"
                  onClick={handleSavePhoto}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 shadow-md transition-all ${
                    isLight
                      ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  Salvar na Galeria
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Camera Video Stream or Placeholder */}
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-72 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />

                {!cameraActive && (
                  <div className="text-center p-6 space-y-3">
                    <Camera className="w-12 h-12 mx-auto text-zinc-500 opacity-60" />
                    <p className="text-xs text-zinc-400 max-w-xs">
                      Tire uma foto instantânea com a câmera do dispositivo ou selecione um arquivo do aparelho.
                    </p>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {cameraActive ? (
                  <button
                    type="button"
                    onClick={takeSnapshot}
                    className={`col-span-2 py-3 px-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 ${
                      isLight
                        ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/30'
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                    }`}
                  >
                    <Camera className="w-5 h-5" />
                    Fotografar Avaria
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-colors ${
                      isLight
                        ? 'bg-cyan-50 border-cyan-200 text-cyan-800 hover:bg-cyan-100'
                        : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-950/70'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    Abrir Câmera
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-colors ${
                    cameraActive ? 'col-span-2' : ''
                  } ${
                    isLight
                      ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Enviar da Galeria
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
