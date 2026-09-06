export function Header() {
  return (
    <header className="ps-header">
      <div className="ps-brand">
        <span className="t-wordmark">PUP.SCAN</span>
        <span className="t-descriptor ps-muted">DOG ONLY PHOTO MACHINE</span>
      </div>
      <nav className="ps-nav">
        <span className="t-nav">ABOUT</span>
        <span className="t-nav">HISTORY</span>
        <span className="t-nav">SETTINGS</span>
        <span className="ps-ring" />
      </nav>
    </header>
  )
}
