import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon';
import { usePreferences } from '../preferences';
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
  const { t, tx, locale } = usePreferences();
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
    dimensions = `${size.width.toLocaleString(locale)} × ${size.height.toLocaleString(locale)} px`;
    if (format === 'png') sizeError = pngSizeError(size.width, size.height);
  } catch (cause) {
    sizeError =
      cause instanceof Error
        ? cause.message
        : 'The preview cannot be exported.';
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
          <span className="section-eyebrow">{t('READY TO SHARE')}</span>
          <h2 id="export-title">{t('Export an image')}</h2>
        </div>
        <button
          className="icon-button"
          aria-label={t('Close export')}
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </header>
      <fieldset disabled={busy}>
        <legend className="export-legend">{t('Image options')}</legend>
        <label className="editor-field">
          {t('Format')}
          <select
            aria-label={t('Format')}
            value={format}
            onChange={(event) => setFormat(event.target.value as 'png' | 'svg')}
          >
            <option value="png">{t('PNG — image')}</option>
            <option value="svg">{t('SVG — vector')}</option>
          </select>
        </label>
        <label className="editor-field">
          {t('Background')}
          <select
            aria-label={t('Background')}
            value={background}
            onChange={(event) => setBackground(event.target.value)}
          >
            <option value="white">{t('White')}</option>
            <option value="transparent">{t('Transparent')}</option>
            <option value="dark">{t('Dark')}</option>
            <option value="custom">{t('Custom')}</option>
          </select>
        </label>
        {background === 'custom' && (
          <label className="export-color">
            {t('Color of the background')}
            <input
              type="color"
              value={customColor}
              aria-label={t('Color of the background')}
              onChange={(event) => setCustomColor(event.target.value)}
            />
          </label>
        )}
        {format === 'png' && (
          <label className="editor-field">
            {t('Resolution')}
            <select
              aria-label={t('Resolution')}
              value={scale}
              onChange={(event) => setScale(Number(event.target.value))}
            >
              <option value="1">{t('1× — original size')}</option>
              <option value="2">{t('2× — high definition')}</option>
              <option value="3">{t('3× — very high definition')}</option>
            </select>
          </label>
        )}
      </fieldset>
      <div
        className="export-preview"
        style={{ backgroundColor: color ?? undefined }}
        aria-label={t('Selected background preview')}
      >
        {previewUrl && (
          <img src={previewUrl} alt={t('Preview of the diagram to export')} />
        )}
      </div>
      <p className="export-dimensions">
        {dimensions}
        {format === 'svg' ? ` · ${t('Scalable without loss')}` : ''}
      </p>
      {!current && (
        <p className="export-error" role="alert">
          {t('Wait for a valid, up-to-date preview before exporting.')}
        </p>
      )}
      {(error || sizeError) && (
        <p className="export-error" role="alert">
          {tx(error || sizeError)}
        </p>
      )}
      <p className="export-help">
        {t(
          'Editor zoom does not change the image. A transparent background preserves diagram colors.',
        )}
      </p>
      <button
        className="button primary"
        disabled={busy || !current || !!sizeError}
        onClick={() => onExport({ format, scale, background: color })}
      >
        {busy
          ? t('Preparing the image…')
          : t('Download {format}', { format: format.toUpperCase() })}
        <Icon name="export" />
      </button>
    </dialog>
  );
}
