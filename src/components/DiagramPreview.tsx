import { useId } from 'react';
import type { DiagramKind } from '../models';
import { usePreferences } from '../preferences';

export default function DiagramPreview({ kind }: { kind: DiagramKind }) {
  const { t } = usePreferences();
  const markerId = useId();
  return (
    <svg
      className="diagram-art"
      viewBox={
        kind === 'flow'
          ? '30 135 840 290'
          : kind === 'sequence'
            ? '60 40 780 440'
            : '45 180 830 255'
      }
      role="img"
      aria-label={t('Illustrated preview of the selected example')}
    >
      <defs>
        <marker
          id={`${markerId}-arrow`}
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M1 1L7 4L1 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </marker>
        <marker
          id={`${markerId}-ink-arrow`}
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M1 1L7 4L1 7"
            fill="none"
            className="ink-stroke"
            strokeWidth="1.5"
          />
        </marker>
      </defs>
      {kind === 'flow' && (
        <>
          <g className="connectors" markerEnd={`url(#${markerId}-arrow)`}>
            <path d="M185 220H250" />
            <path d="M400 220H466" />
            <path d="M618 220H690" />
            <path d="M765 246V345" />
            <path d="M542 284V372H420" />
          </g>
          <path
            className="return-path"
            d="M260 372H222Q205 372 205 355V299Q205 282 222 282H325V247"
            markerEnd={`url(#${markerId}-ink-arrow)`}
          />
          <rect
            className="node-light"
            x="55"
            y="195"
            width="130"
            height="50"
            rx="25"
          />
          <rect
            className="node-paper"
            x="250"
            y="194"
            width="150"
            height="52"
          />
          <path className="node-accent" d="M542 155L619 220L542 285L465 220Z" />
          <rect
            className="node-paper"
            x="690"
            y="194"
            width="150"
            height="52"
          />
          <rect
            className="node-solid"
            x="700"
            y="346"
            width="130"
            height="50"
            rx="25"
          />
          <rect
            className="node-paper"
            x="260"
            y="346"
            width="160"
            height="52"
          />
          <g className="node-labels">
            <text x="120" y="222">
              {t('An idea')}
            </text>
            <text x="325" y="222">
              {t('Lay it out')}
            </text>
            <text x="542" y="215">
              <tspan x="542">{t('Does it')}</tspan>
              <tspan x="542" dy="19">
                {t('make sense?')}
              </tspan>
            </text>
            <text x="765" y="222">
              {t('Give it shape')}
            </text>
            <text className="label-inverse" x="765" y="374">
              {t('Share')}
            </text>
            <text x="340" y="374">
              {t('Step back')}
            </text>
          </g>
          <g className="edge-labels">
            <text x="646" y="204">
              {t('yes')}
            </text>
            <text x="560" y="334">
              {t('not yet')}
            </text>
          </g>
          <g className="diagram-note">
            <path d="M324 119Q341 101 392 115" />
            <text x="267" y="93" transform="rotate(-5 267 93)">
              {t('start somewhere')}
            </text>
            <path d="M349 128L326 119L333 105" />
          </g>
          <text className="diagram-footnote" x="207" y="437">
            {t('detours are part of the journey, too.')}
          </text>
        </>
      )}
      {kind === 'sequence' && (
        <>
          <g className="lifelines">
            <path d="M160 120V458M450 120V458M740 120V458" />
          </g>
          <rect className="node-paper" x="95" y="64" width="130" height="50" />
          <rect
            className="node-accent"
            x="385"
            y="64"
            width="130"
            height="50"
          />
          <rect className="node-paper" x="675" y="64" width="130" height="50" />
          <g className="node-labels">
            <text x="160" y="92">
              {t('You')}
            </text>
            <text x="450" y="92">
              {t('An idea')}
            </text>
            <text x="740" y="92">
              {t('The world')}
            </text>
          </g>
          <g className="connectors" markerEnd={`url(#${markerId}-arrow)`}>
            <path d="M160 182H450" />
            <path d="M160 304H450" />
            <path d="M450 365H740" />
          </g>
          <g className="return-path" markerEnd={`url(#${markerId}-ink-arrow)`}>
            <path d="M450 243H160" />
            <path d="M740 426H160" />
          </g>
          <g className="sequence-labels">
            <text x="305" y="168">
              {t('What if we tried?')}
            </text>
            <text x="305" y="229">
              {t('Why not.')}
            </text>
            <text x="305" y="290">
              {t('A first version')}
            </text>
            <text x="595" y="351">
              {t('Your turn')}
            </text>
            <text x="450" y="412">
              {t('What if we went further?')}
            </text>
          </g>
        </>
      )}
      {kind === 'state' && (
        <>
          <circle className="state-point" cx="78" cy="233" r="8" />
          <g className="connectors" markerEnd={`url(#${markerId}-arrow)`}>
            <path d="M86 233H145" />
            <path d="M285 233H395" />
            <path d="M535 233H650" />
            <path d="M790 233H834" />
            <path d="M475 259V365" />
          </g>
          <path
            className="return-path"
            d="M395 391H366V287Q366 274 379 274H430V260"
            markerEnd={`url(#${markerId}-ink-arrow)`}
          />
          <rect
            className="node-paper"
            x="145"
            y="207"
            width="140"
            height="52"
            rx="8"
          />
          <rect
            className="node-accent"
            x="395"
            y="207"
            width="140"
            height="52"
            rx="8"
          />
          <rect
            className="node-paper"
            x="395"
            y="366"
            width="140"
            height="52"
            rx="8"
          />
          <rect
            className="node-solid"
            x="650"
            y="207"
            width="140"
            height="52"
            rx="8"
          />
          <circle className="state-end" cx="848" cy="233" r="12" />
          <circle className="state-point" cx="848" cy="233" r="7" />
          <g className="node-labels">
            <text x="215" y="235">
              {t('Draft')}
            </text>
            <text x="465" y="235">
              {t('In progress')}
            </text>
            <text x="465" y="394">
              {t('Paused')}
            </text>
            <text className="label-inverse" x="720" y="235">
              {t('Ready')}
            </text>
          </g>
          <g className="edge-labels">
            <text x="306" y="217">
              {t('get started')}
            </text>
            <text x="558" y="217">
              {t('refine')}
            </text>
            <text x="491" y="318">
              {t('take a breath')}
            </text>
            <text x="283" y="334">
              {t('resume')}
            </text>
          </g>
          <text
            className="diagram-footnote"
            x="309"
            y="133"
            transform="rotate(-4 309 133)"
          >
            {t('no rush. everything moves forward.')}
          </text>
        </>
      )}
    </svg>
  );
}
