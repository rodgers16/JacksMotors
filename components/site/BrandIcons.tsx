import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export function InstagramIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M14 22V13h3l1-4h-4V7c0-1.1.5-2 2-2h2V1.5h-3.5C12 1.5 10 3 10 6v3H7v4h3v9z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon({ size = 16, ...rest }: Props) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M22 8.5c0-1.7-1.4-3-3-3H5C3.4 5.5 2 6.8 2 8.5v7c0 1.7 1.4 3 3 3h14c1.6 0 3-1.3 3-3z" />
      <path d="M10 9.5l5.5 3-5.5 3z" fill="currentColor" stroke="none" />
    </svg>
  );
}
