import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon';
import {
  imageSize,
  pngSizeError,
  standaloneSvg,
  type ImageOptions,
} from './exportImage';

export default function ExportDialog({
  svg,
  current,
  dark,
  busy,
  error,
  onClose,
  onExport,
}: {
  svg: string;
  current: boolean;
  dark: boolean;
  busy: boolean;
  error: string;
  onClose: () => void;
  onExport: (options: ImageOptions) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [format, setFormat] = useState<'png' | 'svg'>('png');
  const [scale, setScale] = useState(2);
  const [background, setBackground] = useState(dark ? 'dark' : 'white');
  const [customColor, setCustomColor] = useState('#ffffff');
  const color =
    background === 'transparent'
      ? null
      : background === 'white'
        ? '#ffffff'
        : background === 'dark'
          ? '#252832'
          : customColor;
  let dimensions = '';
  let previewUrl = '';
  let sizeError = '';
  try {
    previewUrl =
      'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(standaloneSvg(svg, color));
    const size = imageSize(svg, format === 'png' ? scale : 1);
    dimensions = `${size.width} × ${size.height} px`;
    if (format === 'png') sizeError = pngSizeError(size.width, size.height);
  } catch (cause) {
    sizeError =
      cause instanceof Error
        ? cause.message
        : 'L’aperçu ne peut pas être exporté.';
  }
  useEffect(() => {
    const element = dialog.current!;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="export-dialog"
      aria-labelledby="export-title"
      onCancel={onClose}
    >
      <header>
        <div>
          <span className="section-eyebrow">PRÊT À PARTAGER</span>
          <h2 id="export-title">Exporter une image</h2>
        </div>
        <button
          className="icon-button"
          aria-label="Fermer l’export"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </header>
      <fieldset disabled={busy}>
        <legend className="export-legend">Options de l’image</legend>
        <label className="editor-field">
          Format
          <select
            aria-label="Format"
            value={format}
            onChange={(event) => setFormat(event.target.value as 'png' | 'svg')}
          >
            <option value="png">PNG — image</option>
            <option value="svg">SVG — vectoriel</option>
          </select>
        </label>
        <label className="editor-field">
          Fond
          <select
            aria-label="Fond"
            value={background}
            onChange={(event) => setBackground(event.target.value)}
          >
            <option value="white">Blanc</option>
            <option value="transparent">Transparent</option>
            <option value="dark">Sombre</option>
            <option value="custom">Personnalisé</option>
          </select>
        </label>
        {background === 'custom' && (
          <label className="export-color">
            Couleur du fond
            <input
              type="color"
              value={customColor}
              aria-label="Couleur du fond"
              onChange={(event) => setCustomColor(event.target.value)}
            />
          </label>
        )}
        {format === 'png' && (
          <label className="editor-field">
            Résolution
            <select
              aria-label="Résolution"
              value={scale}
              onChange={(event) => setScale(Number(event.target.value))}
            >
              <option value="1">1× — taille naturelle</option>
              <option value="2">2× — haute définition</option>
              <option value="3">3× — très haute définition</option>
            </select>
          </label>
        )}
      </fieldset>
      <div
        className="export-preview"
        style={{ backgroundColor: color ?? undefined }}
        aria-label="Aperçu du fond choisi"
      >
        {previewUrl && (
          <img src={previewUrl} alt="Aperçu du diagramme à exporter" />
        )}
      </div>
      <p className="export-dimensions">
        {dimensions}
        {format === 'svg' ? ' · Redimensionnable sans perte' : ''}
      </p>
      {!current && (
        <p className="export-error" role="alert">
          Attendez un aperçu valide et à jour pour exporter.
        </p>
      )}
      {(error || sizeError) && (
        <p className="export-error" role="alert">
          {error || sizeError}
        </p>
      )}
      <p className="export-help">
        Le zoom de l’éditeur ne change pas l’image. Le fond transparent conserve
        les couleurs du diagramme.
      </p>
      <button
        className="button primary"
        disabled={busy || !current || !!sizeError}
        onClick={() => onExport({ format, scale, background: color })}
      >
        {busy
          ? 'Préparation de l’image…'
          : `Télécharger ${format.toUpperCase()}`}
        <Icon name="export" />
      </button>
    </dialog>
  );
}
