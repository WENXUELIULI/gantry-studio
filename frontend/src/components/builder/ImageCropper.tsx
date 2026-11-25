import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import {
  clampCrop,
  cropVars,
  type Crop,
} from '../../lib/media';

type Props = {
  src: string;
  crop?: Crop;
  aspect?: string;
  onApply: (crop: Crop) => void;
  onClose: () => void;
};

/**
 * A deliberately simple focal-point cropper: drag the image to choose the
 * visible centre, zoom to tighten the frame. The resulting crop is the same
 * data the site renderer and exported HTML already understand.
 */
export default function ImageCropper({
  src,
  crop: initial,
  aspect = '16 / 9',
  onApply,
  onClose,
}: Props) {
  const [crop, setCrop] = useState(() => clampCrop(initial));
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const startRef = useRef({ x: 0, y: 0, cropX: 50, cropY: 50 });
  const cropVarsStyle = cropVars(crop);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    startRef.current = {
      x: event.clientX,
      y: event.clientY,
      cropX: crop.x,
      cropY: crop.y,
    };
    setDragging(true);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const frame = frameRef.current?.getBoundingClientRect();
    if (!frame) return;
    const dx = ((event.clientX - startRef.current.x) / frame.width) * 100;
    const dy = ((event.clientY - startRef.current.y) / frame.height) * 100;
    setCrop(
      clampCrop({
        ...crop,
        x: startRef.current.cropX - dx,
        y: startRef.current.cropY - dy,
      }),
    );
  };

  const endDrag = () => setDragging(false);

  return (
    <div className="cropper-backdrop" role="presentation">
      <section
        className="cropper"
        role="dialog"
        aria-modal="true"
        aria-label="裁剪图片"
      >
        <header className="cropper-head">
          <div>
            <span className="mono">CROP / FOCAL POINT</span>
            <h3>拖动图片，决定画面留住哪里。</h3>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="关闭裁剪"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </header>

        <div
          ref={frameRef}
          className={`cropper-frame${dragging ? ' is-dragging' : ''}`}
          style={{ aspectRatio: aspect }}
          onPointerDown={beginDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <img
            className="cropper-image"
            src={src}
            alt=""
            draggable={false}
            style={cropVarsStyle}
          />
          <div className="cropper-grid" aria-hidden="true">
            <i /><i /><i /><i />
          </div>
          <span className="cropper-dot" style={cropVarsStyle} aria-hidden="true" />
          <span className="cropper-hint mono">DRAG TO REFRAME</span>
        </div>

        <div className="cropper-controls">
          <label className="field">
            <span>
              缩放<em>{crop.zoom.toFixed(2)}×</em>
            </span>
            <input
              type="range"
              min={1}
              max={2.5}
              step={0.05}
              value={crop.zoom}
              onChange={(event) =>
                setCrop(clampCrop({ ...crop, zoom: Number(event.target.value) }))
              }
            />
          </label>
          <label className="field">
            <span>
              横向焦点<em>{Math.round(crop.x)}%</em>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={crop.x}
              onChange={(event) =>
                setCrop(clampCrop({ ...crop, x: Number(event.target.value) }))
              }
            />
          </label>
          <label className="field">
            <span>
              纵向焦点<em>{Math.round(crop.y)}%</em>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={crop.y}
              onChange={(event) =>
                setCrop(clampCrop({ ...crop, y: Number(event.target.value) }))
              }
            />
          </label>
        </div>

        <footer className="cropper-foot">
          <button
            type="button"
            className="cropper-reset"
            onClick={() => setCrop({ x: 50, y: 50, zoom: 1 })}
          >
            <RotateCcw size={13} /> 重置
          </button>
          <div>
            <button type="button" onClick={onClose}>
              取消
            </button>
            <button
              type="button"
              className="cropper-apply"
              onClick={() => onApply(crop)}
            >
              <Check size={14} /> 应用焦点
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
