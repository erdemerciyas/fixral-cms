'use client';

import { m } from 'framer-motion';
import { Box as CubeIcon } from 'lucide-react';

interface Model3D {
  _id: string;
  name: string;
  url: string;
  format: 'stl' | 'obj' | 'gltf' | 'glb';
  size: number;
  uploadedAt: string;
  downloadable?: boolean;
  publicId: string;
}

interface Portfolio3DFilesProps {
  models3D: Model3D[];
}

export default function Portfolio3DFiles({ models3D }: Portfolio3DFilesProps) {

  const getFileTypeColor = (format: string) => {
    switch (format.toLowerCase()) {
      case 'stl':
        // Marka skalası: STL = brand primary tonu
        return 'bg-brand-primary-500/10 text-brand-primary-700 dark:text-brand-primary-400 border border-brand-primary-500/25';
      case 'obj':
        // Nötr ikincil yüzey: OBJ
        return 'bg-secondary text-secondary-foreground border border-border';
      case 'gltf':
      case 'glb':
        return 'bg-accent text-accent-foreground border border-border';
      default:
        return 'bg-muted text-muted-foreground border border-border';
    }
  };

  if (!models3D || models3D.length === 0) {
    return null;
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-4"
    >
      <div className="flex items-center mb-3">
        <CubeIcon className="w-4 h-4 text-accent-foreground mr-2" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          3D Model Dosyaları ({models3D.length})
        </h3>
      </div>

      <div className="bg-surface-secondary rounded-lg border border-border overflow-hidden">
        {models3D.map((model, index) => (
          <m.div
            key={`model-${model._id || index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center py-2.5 px-3 hover:bg-accent transition-colors duration-200 border-b border-border last:border-b-0"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Format badge */}
              <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getFileTypeColor(model.format)}`}>
                {model.format.toUpperCase()}
              </div>

              {/* Dosya adı */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {model.name}
                </h4>
              </div>
            </div>
          </m.div>
        ))}
      </div>
    </m.div>
  );
}