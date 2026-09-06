export function Countdown({ value }: { value: number }) {
  return (
    <div className="ps-countdown">
      <span className="t-caption">GET READY</span>
      <span className="ps-countdown__rule" aria-hidden />
      <span className="ps-countdown__num" key={value}>{value}</span>
    </div>
  )
}
