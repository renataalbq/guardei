import type { SVGProps } from 'react';

const paths = {
  plus: 'M12 5v14M5 12h14',
  back: 'M15 18l-6-6 6-6',
  close: 'M6 6l12 12M18 6L6 18',
  share: 'M12 15V3M8 7l4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1',
  check: 'M5 12l5 5 9-10',
  cloud: 'M17.5 19a4.5 4.5 0 1 0-1.4-8.78A6 6 0 0 0 4.5 12.5 3.5 3.5 0 0 0 6 19h11.5z',
  cloudOff: 'M3 3l18 18M17.5 19H6a3.5 3.5 0 0 1-1.5-6.5 6 6 0 0 1 3.2-4.6M11 6.1A6 6 0 0 1 16.1 10.2a4.5 4.5 0 0 1 4 6.3',
  alert: 'M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  calendar: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10h16M8 2v4M16 2v4',
  trend: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  sparkles: 'M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
  palette: 'M12 21a9 9 0 1 1 9-9c0 2.5-2 3.5-4 3.5h-1.5a1.5 1.5 0 0 0-1 2.6 1.6 1.6 0 0 1-1 2.9zM7.5 11.5h.01M10.5 7.5h.01M15.5 8.5h.01',
  swipe: 'M4 12h13M13 8l4 4-4 4M20 5v14',
} as const;

export type IconName = keyof typeof paths | 'flame';

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  if (name === 'flame') {
    return (
      <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...props}>
        <path
          fill="currentColor"
          d="M12 2c.6 3.2-1.2 5-2.6 6.6C8 10.2 7 11.7 7 14a5 5 0 0 0 10 0c0-1.6-.6-3-1.4-4 .1 1.4-.4 2.6-1.5 3 .5-2.6-.2-5.8-2.1-11z"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
