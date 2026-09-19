'use client';

import { useEffect, useRef, useState } from 'react';
import { Eraser, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

/**
 * Lienzo para firmar con mouse, dedo o stylus (Pointer Events).
 * Devuelve la firma como JPEG con fondo blanco, lista para recetas impresas.
 */
export function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111827';
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const rect = canvas!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas!.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas!.height,
    };
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  };

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={500}
        height={200}
        className="w-full touch-none rounded-md border border-gray-300 bg-white cursor-crosshair"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          const ctx = canvasRef.current!.getContext('2d')!;
          const { x, y } = pos(e);
          ctx.beginPath();
          ctx.moveTo(x, y);
          drawing.current = true;
          setHasInk(true);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = canvasRef.current!.getContext('2d')!;
          const { x, y } = pos(e);
          ctx.lineTo(x, y);
          ctx.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
        }}
        onPointerLeave={() => {
          drawing.current = false;
        }}
      />
      <p className="text-xs text-gray-500">
        Firmá con el mouse, el dedo o un lápiz óptico dentro del recuadro.
      </p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={clear} className="min-h-[36px]">
          <Eraser className="h-4 w-4 mr-2" />
          Limpiar
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!hasInk}
          onClick={() => {
            onSave(canvasRef.current!.toDataURL('image/jpeg', 0.85));
            onCancel();
          }}
          className="min-h-[36px]"
        >
          <Check className="h-4 w-4 mr-2" />
          Usar esta firma
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="min-h-[36px]">
          Cancelar
        </Button>
      </div>
    </div>
  );
}
