export type IconName =
  | 'home'
  | 'grid'
  | 'flow'
  | 'sequence'
  | 'state'
  | 'search'
  | 'code'
  | 'palette'
  | 'export'
  | 'copy'
  | 'info'
  | 'arrow'
  | 'close';
const paths: Record<IconName, string> = {
  home: 'm3 10 9-7 9 7v10H15v-6H9v6H3Z',
  grid: 'M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z',
  flow: 'M9 2h6v5H9ZM2 17h6v5H2ZM16 17h6v5h-6ZM12 7v5M5 17v-5h14v5',
  sequence: 'M4 3v18M20 3v18M4 8h16m-4-4 4 4-4 4M20 16H4m4-4-4 4 4 4',
  state: 'M8 6h8M18 8v8M16 18H8M6 16V8M3 3h6v6H3ZM15 15h6v6h-6Z',
  search: 'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 6 6',
  code: 'm8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18',
  palette:
    'M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h4a4 4 0 0 0 4-4c0-4-5-6-9-6ZM7 9h.01M10 6h.01M15 6h.01M6 13h.01',
  export: 'M12 16V2m-4 4 4-4 4 4M7 10H4v11h16V10h-3',
  copy: 'M9 8h12v13H9ZM15 8V3H3v13h6',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 11v6m0-10h.01',
  arrow: 'M4 12h16m-5-5 5 5-5 5',
  close: 'm6 6 12 12M6 18 18 6',
};
export default function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
