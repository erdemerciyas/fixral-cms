'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Center } from '@react-three/drei';
import { Mesh, BufferGeometry, MeshStandardMaterial, Box3, Vector3, type Object3D } from 'three';
import { STLLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';

export interface ModelViewerLabels {
  /** Yükleniyor metni (varsayılan: "3D Model Yükleniyor...") */
  loading?: string;
  /** Geometri işleniyor metni */
  processing?: string;
  /** Desteklenmeyen biçim metni */
  unsupported?: string;
  /** Görüntüleyici erişilebilir adı */
  aria?: string;
  /** Ekran okuyucu yardım metni */
  help?: string;
}

interface ModelProps {
  url: string;
  format: string;
  color?: string;
  spin?: boolean;
  labels?: ModelViewerLabels;
}

/** Yükleme göstergesi (Canvas içinde HTML) */
function LoadingNote({ text }: { text: string }) {
  return (
    <Html center>
      <div className="fx-mv-note" role="status">
        <span className="fx-mv-spin" aria-hidden="true" />
        <p>{text}</p>
      </div>
    </Html>
  );
}

// GLTF/GLB modelleri için ayrı bileşen
function GLTFModel({ url, spin = true }: { url: string; spin?: boolean }) {
  const meshRef = useRef<Mesh>(null);
  const { scene } = useGLTF(url);

  // Basit rotasyon animasyonu
  useFrame((state, delta) => {
    if (spin && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <Center>
      <primitive 
        ref={meshRef}
        object={scene} 
        scale={1.0}
      />
    </Center>
  );
}

// STL modelleri için bileşen
function STLModel({ url, color = '#FA6831', spin = true, processing }: { url: string; color?: string; spin?: boolean; processing: string }) {
  const meshRef = useRef<Mesh>(null);
  const geometry = useLoader(STLLoader, url) as BufferGeometry;
  const [processedGeometry, setProcessedGeometry] = useState<BufferGeometry | null>(null);
  const [scale, setScale] = useState(1);

  // Geometry yüklendiğinde merkez ve boyut hesapla
  useEffect(() => {
    if (!geometry) return;
    // Efekt gövdesinde senkron setState yerine mikro-görevde uygula
    queueMicrotask(() => {
      // Geometry'yi klonla (orijinalini değiştirmemek için)
      const clonedGeometry = geometry.clone();
      
      // Bounding box hesapla
      clonedGeometry.computeBoundingBox();
      const box = clonedGeometry.boundingBox;
      
      if (box) {
        // Merkez noktasını hesapla
        const centerPoint = new Vector3();
        box.getCenter(centerPoint);
        
        // Boyutu hesapla
        const size = new Vector3();
        box.getSize(size);
        
        // Geometry'yi merkeze translate et
        clonedGeometry.translate(-centerPoint.x, -centerPoint.y, -centerPoint.z);
        
        // En büyük boyuta göre scale hesapla
        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetSize = 2; // Hedef boyut
        const calculatedScale = targetSize / maxDimension;
        
        setScale(calculatedScale);
        setProcessedGeometry(clonedGeometry);
        
      }
    });
  }, [geometry]);

  // Basit rotasyon animasyonu
  useFrame((state, delta) => {
    if (spin && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  if (!processedGeometry) {
    return <LoadingNote text={processing} />;
  }

  return (
    <mesh 
      ref={meshRef} 
      geometry={processedGeometry} 
      scale={scale}
    >
      {/* Marka paletiyle tutarlı: STL = brand primary (#FA6831) */}
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.1} />
    </mesh>
  );
}

// OBJ modelleri için bileşen
function OBJModel({ url, color = '#C24E1E', spin = true, processing }: { url: string; color?: string; spin?: boolean; processing: string }) {
  const meshRef = useRef<Mesh>(null);
  const obj = useLoader(OBJLoader, url);
  const [processedObj, setProcessedObj] = useState<Object3D | null>(null);
  const [scale, setScale] = useState(1);

  // OBJ yüklendiğinde merkez ve boyut hesapla
  useEffect(() => {
    if (!obj) return;
    // Efekt gövdesinde senkron setState yerine mikro-görevde uygula
    queueMicrotask(() => {
      // Objeyi klonla
      const clonedObj = obj.clone();
      
      // Bounding box hesapla
      const box = new Box3().setFromObject(clonedObj);
      
      // Merkez noktasını hesapla
      const centerPoint = new Vector3();
      box.getCenter(centerPoint);
      
      // Boyutu hesapla
      const size = new Vector3();
      box.getSize(size);
      
      // Objeyi merkeze translate et
      clonedObj.position.set(-centerPoint.x, -centerPoint.y, -centerPoint.z);
      
      // En büyük boyuta göre scale hesapla
      const maxDimension = Math.max(size.x, size.y, size.z);
      const targetSize = 2; // Hedef boyut
      const calculatedScale = targetSize / maxDimension;
      
      setScale(calculatedScale);
      
      // OBJ dosyasına material ekle
      clonedObj.traverse((child) => {
        if (child instanceof Mesh) {
          // Marka paletiyle tutarlı: OBJ = brand derin ton (#C24E1E)
          child.material = new MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.1 });
        }
      });
      
      setProcessedObj(clonedObj);
    });
  }, [obj, color]);

  // Basit rotasyon animasyonu
  useFrame((state, delta) => {
    if (spin && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  if (!processedObj) {
    return <LoadingNote text={processing} />;
  }

  return (
    <primitive 
      ref={meshRef}
      object={processedObj} 
      scale={scale}
    />
  );
}

// Ana model bileşeni
function Model({ url, format, color, spin, labels }: ModelProps) {
  const processing = labels?.processing || `${format.toUpperCase()} işleniyor...`;
  const renderModel = () => {
    switch (format.toLowerCase()) {
      case 'gltf':
      case 'glb':
        return <GLTFModel url={url} spin={spin} />;

      case 'stl':
        return <STLModel url={url} color={color} spin={spin} processing={processing} />;

      case 'obj':
        return <OBJModel url={url} color={color} spin={spin} processing={processing} />;

      default:
        return (
          <Html center>
            <div className="fx-mv-note">
              <p>{format.toUpperCase()}</p>
              <p>{labels?.unsupported || 'Bu format için önizleme henüz desteklenmiyor'}</p>
            </div>
          </Html>
        );
    }
  };

  return (
    <Suspense fallback={<LoadingNote text={labels?.loading || `${format.toUpperCase()} Model Yükleniyor...`} />}>
      {renderModel()}
    </Suspense>
  );
}

interface ModelViewerProps {
  modelUrl: string;
  format: string;
  className?: string;
  /** Saydam arkaplan: hero gibi token tabanlı koyu zeminlerde kullanılır (varsayılan: false) */
  transparent?: boolean;
  /** STL/OBJ malzeme rengi (verilmezse eski marka tonları) */
  color?: string;
  /** Kendiliğinden dönme (varsayılan: açık; azaltılmış hareket tercihinde kapanır) */
  spin?: boolean;
  /** Yerelleştirilmiş metinler */
  labels?: ModelViewerLabels;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function ModelViewer({ modelUrl, format, className = '', transparent = false, color, spin = true, labels }: ModelViewerProps) {
  const [reduced] = useState(prefersReducedMotion);
  const doSpin = spin && !reduced;

  return (
    <>
      <div 
        className={
          transparent
            ? `h-full w-full overflow-hidden ${className}`
            : `w-full h-96 bg-card rounded-lg overflow-hidden ${className}`
        }
        role="img"
        aria-label={labels?.aria || `3D ${format.toUpperCase()} Model Görüntüleyici`}
      >
        <Canvas
        camera={{ position: [3, 3, 3], fov: 60 }}
        gl={transparent ? { alpha: true } : undefined}
        className={transparent ? 'bg-transparent' : 'fx-mv-surface'}
        onCreated={(_state) => {
          // Kamerayı modele odakla
          _state.camera.lookAt(0, 0, 0);
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Suspense fallback={<LoadingNote text={labels?.loading || '3D Model Yükleniyor...'} />}>
          <Model url={modelUrl} format={format} color={color} spin={doSpin} labels={labels} />
        </Suspense>
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.5}
          maxDistance={10}
          target={[0, 0, 0]}
          autoRotate={false}
        />
      </Canvas>
      </div>
      <p className="sr-only">{labels?.help || `3D ${format.toUpperCase()} model - Döndürmek için fare ya da dokunmayı kullanın, zoom için tekerlek ya da pinch hareketi`}</p>
    </>
  );
}

// GLTF loader için preload
// Note: preload function is intentionally empty and used for type declaration
useGLTF.preload = (_url: string) => {};
