'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { Model3D } from '@/types/portfolio';
import dynamic from 'next/dynamic';
import { Box as CubeIcon, Download as ArrowDownTrayIcon, Eye as EyeIcon, X as XMarkIcon } from 'lucide-react';

// three/fiber/drei senkron bundle'a girmesin diye 3D görüntüleyici lazy yüklenir
const ModelViewer = dynamic(() => import('./3DModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-muted/60 rounded-lg animate-pulse" aria-label="3D model yükleniyor" />
  ),
});

// Swiper CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

interface ModelGalleryProps {
  models: Model3D[];
  className?: string;
}

export default function ModelGallery({ models, className = '' }: ModelGalleryProps) {
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  if (!models || models.length === 0) {
    return null;
  }

  const handleModelClick = (model: Model3D) => {
    setSelectedModel(model);
    setIsViewerOpen(true);
  };

  const handleDownload = async (model: Model3D) => {
    if (!model.downloadable) {
      alert('Bu model indirilebilir değil');
      return;
    }

    try {
      const response = await fetch(`/api/public/3dmodels/download?url=${encodeURIComponent(model.url)}&filename=${encodeURIComponent(model.name)}`);
      
      if (!response.ok) {
        throw new Error('İndirme başarısız');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = model.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('İndirme hatası:', error);
      alert('İndirme sırasında bir hata oluştu');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <CubeIcon className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-foreground">3D Modeller</h3>
          <span className="text-sm text-muted-foreground">({models.length})</span>
        </div>

        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={16}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          className="model-gallery-swiper"
        >
          {models.map((model, index) => (
            <SwiperSlide key={index}>
              <div className="bg-muted/60 rounded-lg shadow-md border border-zinc-400/25 overflow-hidden">
                {/* Model Önizleme Alanı */}
                <div className="aspect-square bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative group">
                  <CubeIcon className="w-16 h-16 text-blue-400" />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleModelClick(model)}
                      className="bg-muted/60 text-foreground p-2 rounded-full hover:bg-muted/80 transition-colors"
                      title="3D Önizleme"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    
                    {model.downloadable && (
                      <button
                        onClick={() => handleDownload(model)}
                        className="bg-muted/60 text-foreground p-2 rounded-full hover:bg-muted/80 transition-colors"
                        title="İndir"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Model Bilgileri */}
                <div className="p-4">
                  <h4 className="font-medium text-foreground truncate" title={model.name}>
                    {model.name}
                  </h4>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Format:</span>
                      <span className="uppercase font-medium">{model.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Boyut:</span>
                      <span>{formatFileSize(model.size)}</span>
                    </div>
                    {model.downloadable && (
                      <div className="flex justify-between">
                        <span>İndirilebilir:</span>
                        <span className="text-green-600 font-medium">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 3D Model Viewer Modal */}
      {isViewerOpen && selectedModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-muted/60 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-400/25">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{selectedModel.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedModel.format.toUpperCase()} • {formatFileSize(selectedModel.size)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {selectedModel.downloadable && (
                  <button
                    onClick={() => handleDownload(selectedModel)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>İndir</span>
                  </button>
                )}
                <button
                  onClick={() => setIsViewerOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-2"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* 3D Viewer */}
            <div className="p-4">
              <ModelViewer 
                modelUrl={selectedModel.url} 
                format={selectedModel.format}
                className="h-96"
              />
            </div>

            {/* Model Bilgileri */}
            <div className="p-4 border-t border-border bg-secondary">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Format:</span>
                  <p className="font-medium uppercase">{selectedModel.format}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Boyut:</span>
                  <p className="font-medium">{formatFileSize(selectedModel.size)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Yüklenme:</span>
                  <p className="font-medium">
                    {new Date(selectedModel.uploadedAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">İndirilebilir:</span>
                  <p className={`font-medium ${selectedModel.downloadable ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedModel.downloadable ? 'Evet' : 'Hayır'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
