import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Check } from 'lucide-react';

const CROP_SIZE = 280;
const OUTPUT_SIZE = 300;

export default function ImageCropModal({ open, imageSrc, onSave, onClose }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastPinchDistance, setLastPinchDistance] = useState(null);
  const dragStart = useRef(null);
  const imgRef = useRef(null);

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

    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  }, []);

  useEffect(() => {
    if (imgRef.current) draw(imgRef.current, zoom, offset);
  }, [zoom, offset, draw]);

  // Pointer (mouse) handlers
  const handlePointerDown = (e) => {
    setDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const handlePointerUp = () => setDragging(false);

  // Touch handlers with pinch-to-zoom
  const getPinchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      setLastPinchDistance(getPinchDistance(e.touches));
      setDragging(false);
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      setDragging(true);
      dragStart.current = { x: touch.clientX - offset.x, y: touch.clientY - offset.y };
      setLastPinchDistance(null);
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const newDistance = getPinchDistance(e.touches);
      if (lastPinchDistance) {
        const delta = (newDistance - lastPinchDistance) * 0.01;
        setZoom((s) => Math.min(3, Math.max(0.3, s + delta)));
      }
      setLastPinchDistance(newDistance);
    } else if (e.touches.length === 1 && dragging) {
      const touch = e.touches[0];
      setOffset({
        x: touch.clientX - dragStart.current.x,
        y: touch.clientY - dragStart.current.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setDragging(false);
    setLastPinchDistance(null);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const out = document.createElement('canvas');
    out.width = OUTPUT_SIZE;
    out.height = OUTPUT_SIZE;
    const ctx = out.getContext('2d');
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
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-base text-[var(--ink)]">Ajustar foto</h3>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X size={16} className="text-[var(--muted)]" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <canvas
                ref={canvasRef}
                width={CROP_SIZE}
                height={CROP_SIZE}
                className="rounded-full cursor-grab active:cursor-grabbing"
                style={{ width: CROP_SIZE, height: CROP_SIZE, display: 'block', touchAction: 'none' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />

              <div className="flex items-center gap-3 w-full">
                <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))} className="text-[var(--muted)] hover:text-[var(--rose)]">
                  <ZoomOut size={18} />
                </button>
                <input
                  type="range"
                  min={0.3}
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

              <p className="text-xs text-[var(--muted)] text-center">Arraste para reposicionar · Pinça para dar zoom</p>
            </div>

            <button
              onClick={handleSave}
              className="mt-5 w-full py-3 bg-[var(--rose)] text-white rounded-full font-sans font-medium text-sm flex items-center justify-center gap-2"
            >
              <Check size={16} /> Usar esta foto
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
