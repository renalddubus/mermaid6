import { useEffect, useRef } from 'react';
import type { DiagramExample } from '../catalogue';
import CatalogueBrowser from './CatalogueBrowser';
import Icon from './Icon';

export default function CatalogueDialog({
  onChoose,
  onClose,
}: {
  onChoose: (example: DiagramExample) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    const previousFocus = document.activeElement;
    element.showModal();
    element.querySelector('input')?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
      document.body.style.overflow = overflow;
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="catalogue-dialog"
      aria-labelledby="catalogue-dialog-title"
      onCancel={onClose}
    >
      <header className="catalogue-dialog-header">
        <h2 id="catalogue-dialog-title">Trouver un point de départ</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Fermer le catalogue"
        >
          <Icon name="close" />
        </button>
      </header>
      <CatalogueBrowser onChoose={onChoose} />
    </dialog>
  );
}
