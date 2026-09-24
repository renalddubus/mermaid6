import { useEffect, useRef } from 'react';
import { usePreferences } from '../preferences';

// Only receives sanitized renderDiagram output. Relabel without rendering again.
export default function DiagramSvg({ svg }: { svg: string }) {
  const root = useRef<HTMLDivElement>(null);
  const { t } = usePreferences();
  useEffect(() => {
    root.current
      ?.querySelector('svg')
      ?.setAttribute('aria-label', t('Mermaid diagram'));
  }, [svg, t]);
  return (
    <div
      ref={root}
      className="svg-content"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
