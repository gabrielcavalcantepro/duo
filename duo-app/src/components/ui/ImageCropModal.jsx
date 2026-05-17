import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Check } from 'lucide-react';

export default function ImageCropModal({ open, imageSrc, onSave, onClose }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const imgRef = useRef(null);

  const OUTPUT_SIZE = 300;

  useEffect(() => {
    if (!open || !imageSrc) return;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => { imgRef.current = img; draw(img, 1, { x: 0, y: 0 }); };
  }, [open, imageSrc]);

  const draw = useCallback((img, z, off) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    const scale = Math.min(size / img.width, size / img.height) * z;
    const sw = img.width * scale;
    const sh = img.height * scale;
    const sx = (size - sw) / 2 + off.x;
    const sy = (size - sh) / 2 + off.y;

    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, sx, sy, sw, sh);
    ctx.restore();

    // dim ring outside circle
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  }, []);

  useEffect(() => {
    if (imgRef.current) draw(imgRef.current, zoom, offset);
  }, [zoom, offset, draw]);

  const handlePointerDown = (e) => {
    setDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    const nx = e.clientX - dragStart.current.x;
    const ny = e.clientY - dragStart.current.y;
    setOffset({ x: nx, y: ny });
  };

  const handlePointerUp = () => setDragging(false);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const out = document.createElement('canvas');
    out.width = OUTPUT_SIZE;
    out.height = OUTPUT_SIZE;
    const ctx = out.getContext('2d');
    const scale = OUTPUT_SIZE / canvas.width;
    ctx.save();
    ctx.beginPath();
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(canvas, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    ctx.restore();
    onSave(out.toDataURL('image/jpeg', 0.9));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <h3 className="font-serif text-base text-[var(--ink)]">Ajustar foto</h3>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X size={16} className="text-[var(--muted)]" />
              </button>
            </div>

            <div className="p-4 flex flex-col items-center gap-4">
              <canvas
                ref={canvasRef}
                width={280}
                height={280}
                className="rounded-full cursor-grab active:cursor-grabbing touch-none"
                style={{ width: 280, height: 280 }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />

              <div className="flex items-center gap-3 w-full px-2">
                <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="text-[var(--muted)] hover:text-[var(--rose)]">
                  <ZoomOut size={18} />
                </button>
                <input
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-[var(--rose)]"
                />
                <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))} className="text-[var(--muted)] hover:text-[var(--rose)]">
                  <ZoomIn size={18} />
                </button>
              </div>

              <p className="text-xs text-[var(--muted)] text-center">Arraste para reposicionar · Deslize para dar zoom</p>
            </div>

            <div className="px-4 pb-4">
              <button
                onClick={handleSave}
                className="w-full py-3 bg-[var(--rose)] text-white rounded-full font-sans font-medium text-sm flex items-center justify-center gap-2"
              >
                <Check size={16} /> Usar esta foto
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
