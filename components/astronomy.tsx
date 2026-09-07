import type { ReactNode } from "react"

export function OrbitalPortrait({ children }: { children: ReactNode }) {
  return (
    <div className="astronomy-portrait">
      <svg viewBox="0 0 400 400" aria-hidden="true" focusable="false">
        <g className="orbital-paths">
          <circle cx="200" cy="200" r="148" />
          <circle cx="200" cy="200" r="184" strokeDasharray="2 10" />
          <ellipse cx="200" cy="200" rx="194" ry="86" transform="rotate(-32 200 200)" />
          <path d="M44 83 83 45 124 63M290 342l43-29 30 16" />
        </g>
        <g className="orbital-stars">
          <circle cx="44" cy="83" r="3" />
          <circle cx="83" cy="45" r="4" />
          <circle cx="124" cy="63" r="2" />
          <circle cx="290" cy="342" r="2" />
          <circle cx="333" cy="313" r="3" />
          <circle cx="363" cy="329" r="2" />
          <path d="M342 92v16m-8-8h16M54 285v10m-5-5h10" />
        </g>
        <g className="orbital-satellite orbital-satellite-near">
          <circle cx="200" cy="52" r="6" />
          <circle className="orbital-halo" cx="200" cy="52" r="12" />
        </g>
        <g className="orbital-satellite orbital-satellite-far">
          <circle cx="384" cy="200" r="4" />
        </g>
      </svg>
      {children}
    </div>
  )
}

export function CelestialDivider() {
  return (
    <svg className="celestial-divider" viewBox="0 0 200 24" aria-hidden="true" focusable="false">
      <path d="m3 16 42-9 46 12 52-14 54 8" />
      <circle cx="3" cy="16" r="2" />
      <circle cx="45" cy="7" r="3" />
      <circle cx="91" cy="19" r="2" />
      <circle cx="143" cy="5" r="3" />
      <circle cx="197" cy="13" r="2" />
    </svg>
  )
}
