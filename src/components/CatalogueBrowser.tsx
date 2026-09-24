import { useEffect, useState } from 'react';
import {
  catalogue,
  categories,
  normalizeSearch,
  type DiagramExample,
} from '../catalogue';
import { getSource, inks } from '../models';
import { renderDiagram, describeError } from '../editor/render';
import Icon from './Icon';
import { usePreferences } from '../preferences';
import './catalogue.css';
import DiagramSvg from './DiagramSvg';

export default function CatalogueBrowser({
  onChoose,
}: {
  onChoose?: (example: DiagramExample) => void;
}) {
  const { t, tx, locale } = usePreferences();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState('flow');
  const [preview, setPreview] = useState({ id: '', svg: '', error: '' });
  const visible = catalogue.filter(
    (item) =>
      (category === 'All' || item.category === category) &&
      normalizeSearch(
        `${tx(item.label)} ${tx(item.description)} ${tx(item.category)} ${item.syntax} ${item.id}`,
      ).includes(normalizeSearch(query.trim())),
  );
  const current = visible.find((item) => item.id === selected) ?? visible[0];

  useEffect(() => {
    if (!current) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      void renderDiagram(getSource(current, inks[0]), () => !cancelled)
        .then((svg) => {
          if (!cancelled && svg) setPreview({ id: current.id, svg, error: '' });
        })
        .catch((cause) => {
          if (!cancelled)
            setPreview({
              id: current.id,
              svg: '',
              error: describeError(cause).detail,
            });
        });
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [current]);

  return (
    <div className="catalogue-browser">
      <div className="catalogue-filters">
        <label className="search">
          <Icon name="search" />
          <input
            type="search"
            aria-label={t('Search the catalogue')}
            placeholder={t('An idea, a diagram type…')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div
          className="catalogue-categories"
          role="group"
          aria-label={t('Filter by use')}
        >
          {['All', ...categories].map((name) => (
            <button
              key={tx(name)}
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
            >
              {tx(name)}
            </button>
          ))}
        </div>
      </div>
      <p className="catalogue-count" role="status">
        {t(
          new Intl.PluralRules(locale).select(visible.length) === 'one'
            ? '{count} available example'
            : '{count} available examples',
          { count: visible.length.toLocaleString(locale) },
        )}
      </p>
      {current ? (
        <div className="catalogue-layout">
          <div
            className="catalogue-list"
            role="group"
            aria-label={t('Mermaid examples')}
          >
            {visible.map((item) => (
              <button
                key={item.id}
                className="catalogue-item"
                aria-pressed={current.id === item.id}
                onClick={() => setSelected(item.id)}
              >
                <span className="catalogue-item-name">
                  {tx(item.label)}
                  <Icon name="arrow" />
                </span>
                <span>{tx(item.description)}</span>
                <small>
                  {tx(item.category)}
                  {item.experimental ? ` · ${t('Experimental')}` : ''}
                </small>
              </button>
            ))}
          </div>
          <section
            className="catalogue-detail"
            aria-labelledby="catalogue-example-title"
          >
            <div className="catalogue-detail-heading">
              <span className="section-eyebrow">{tx(current.category)}</span>
              <h2 id="catalogue-example-title">{tx(current.label)}</h2>
              <p>{tx(current.description)}</p>
            </div>
            <div
              className="catalogue-preview"
              aria-label={t('Example preview')}
              aria-busy={preview.id !== current.id}
            >
              {preview.id !== current.id ? (
                <p>{t('Preparing the preview…')}</p>
              ) : preview.error ? (
                <p role="alert">
                  {t('This preview could not be loaded. Try another example.')}
                </p>
              ) : (
                <DiagramSvg svg={preview.svg} />
              )}
            </div>
            <div className="catalogue-detail-bottom">
              <p className="catalogue-note">
                <strong>{t('Customization.')}</strong> {tx(current.note)}
              </p>
              {current.experimental && (
                <p className="catalogue-note">
                  {t('Experimental syntax: it may change in a Mermaid update.')}
                </p>
              )}
              <div className="catalogue-detail-actions">
                {onChoose ? (
                  <button
                    className="button primary"
                    onClick={() => onChoose(current)}
                  >
                    {t('Use this example')}
                    <Icon name="arrow" />
                  </button>
                ) : (
                  <a
                    className="button primary"
                    href={`/editor?example=${current.id}`}
                  >
                    {t('Use this example')}
                    <Icon name="arrow" />
                  </a>
                )}
                <a href={current.docs} target="_blank" rel="noreferrer">
                  {t('Syntax guide ↗')}
                </a>
              </div>
              <details className="catalogue-source">
                <summary>{t('View Mermaid code')}</summary>
                <pre>{getSource(current, inks[0])}</pre>
              </details>
            </div>
          </section>
        </div>
      ) : (
        <div className="catalogue-empty">
          <p>{t('No examples match your search.')}</p>
          <button
            className="button"
            onClick={() => {
              setQuery('');
              setCategory('All');
            }}
          >
            {t('Show all examples')}
          </button>
        </div>
      )}
      <p className="catalogue-footnote">
        {t(
          'Examples rendered with Mermaid 12 and exportable as SVG or PNG. ZenUML requires an extension that is not installed.',
        )}
      </p>
    </div>
  );
}
