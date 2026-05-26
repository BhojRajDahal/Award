import type React from "react"

const LOGO_SRC = "/Nepal_Academy_of_Science_and_Technology_Logo.svg.png"

/**
 * SSR-first boot layer: renders in the streamed HTML before client JS so
 * refresh does not flash an empty viewport.
 */
export function BootSplashLayer(): React.ReactElement {
  return (
    <div
      id="nast-boot-splash"
      className="nast-boot-splash"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="nast-boot-splash__ring" aria-hidden />
      <img
        className="nast-boot-splash__logo"
        src={LOGO_SRC}
        alt=""
        width={140}
        height={140}
        decoding="sync"
        fetchPriority="high"
      />
    </div>
  )
}
