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
import './catalogue.css';

export default function CatalogueBrowser({
  onChoose,
}: {
  onChoose?: (example: DiagramExample) => void;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tous');
  const [selected, setSelected] = useState('flow');
  const [preview, setPreview] = useState({ id: '', svg: '', error: '' });
  const visible = catalogue.filter(
    (item) =>
      (category === 'Tous' || item.category === category) &&
      normalizeSearch(
        `${item.label} ${item.description} ${item.syntax}`,
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
            aria-label="Rechercher dans le catalogue"
            placeholder="Une idée, un type de diagramme…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div
          className="catalogue-categories"
          role="group"
          aria-label="Filtrer par usage"
        >
          {['Tous', ...categories].map((name) => (
            <button
              key={name}
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <p className="catalogue-count" role="status">
        {visible.length} exemple{visible.length !== 1 ? 's' : ''}
      </p>
      {current ? (
        <div className="catalogue-layout">
          <div
            className="catalogue-list"
            role="group"
            aria-label="Exemples de diagrammes"
          >
            {visible.map((item) => (
              <button
                key={item.id}
                className="catalogue-item"
                aria-pressed={current.id === item.id}
                onClick={() => setSelected(item.id)}
              >
                <span className="catalogue-item-name">
                  {item.label}
                  <Icon name="arrow" />
                </span>
                <span>{item.description}</span>
                <small>
                  {item.category}
                  {item.experimental ? ' · Expérimental' : ''}
                </small>
              </button>
            ))}
          </div>
          <section
            className="catalogue-detail"
            aria-labelledby="catalogue-example-title"
          >
            <div className="catalogue-detail-heading">
              <span className="section-eyebrow">{current.category}</span>
              <h2 id="catalogue-example-title">{current.label}</h2>
              <p>{current.description}</p>
            </div>
            <div
              className="catalogue-preview"
              aria-label="Aperçu de l’exemple"
              aria-busy={preview.id !== current.id}
            >
              {preview.id !== current.id ? (
                <p>Préparation de l’aperçu…</p>
              ) : preview.error ? (
                <p role="alert">
                  Cet aperçu n’a pas pu être chargé. Essayez un autre exemple.
                </p>
              ) : (
                <div
                  className="svg-content"
                  dangerouslySetInnerHTML={{ __html: preview.svg }}
                />
              )}
            </div>
            <div className="catalogue-detail-bottom">
              <p className="catalogue-note">
                <strong>Personnalisation.</strong> {current.note}
              </p>
              {current.experimental && (
                <p className="catalogue-note">
                  Syntaxe expérimentale : elle peut évoluer lors d’une mise à
                  jour de Mermaid.
                </p>
              )}
              <div className="catalogue-detail-actions">
                {onChoose ? (
                  <button
                    className="button primary"
                    onClick={() => onChoose(current)}
                  >
                    Utiliser cet exemple <Icon name="arrow" />
                  </button>
                ) : (
                  <a
                    className="button primary"
                    href={`/editor?example=${current.id}`}
                  >
                    Utiliser cet exemple <Icon name="arrow" />
                  </a>
                )}
                <a href={current.docs} target="_blank" rel="noreferrer">
                  Guide de syntaxe ↗
                </a>
              </div>
              <details className="catalogue-source">
                <summary>Voir le code Mermaid</summary>
                <pre>{getSource(current, inks[0])}</pre>
              </details>
            </div>
          </section>
        </div>
      ) : (
        <div className="catalogue-empty">
          <p>Aucun exemple ne correspond à votre recherche.</p>
          <button
            className="button"
            onClick={() => {
              setQuery('');
              setCategory('Tous');
            }}
          >
            Afficher tous les exemples
          </button>
        </div>
      )}
      <p className="catalogue-footnote">
        Exemples rendus avec Mermaid 12. Les exports d’images arrivent dans une
        prochaine étape. ZenUML nécessite une extension non installée.
      </p>
    </div>
  );
}
