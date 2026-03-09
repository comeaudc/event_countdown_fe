import useCountdown from "../../hooks/useCountdown";
import "./Countdown.css";

// src/components/Countdown.jsx
export default function Countdown() {
  const { days, hours, minutes, seconds } = useCountdown(
    new Date(2026, 10, 10),
  );

  const Item = ({ value, label }) => (
    <div className="countdown-item">
      <div className="countdown-number">{value}</div>
      <div className="countdown-label">{label}</div>
    </div>
  );

  return (
    <div className="countdown-container">
      <h2 className="countdown-title">Countdown to the Wedding 💍</h2>

      <div className="countdown-grid">
        <Item value={days} label="Days" />
        <Item value={hours} label="Hours" />
        <Item value={minutes} label="Minutes" />
        <Item value={seconds} label="Seconds" />
      </div>
    </div>
  );
}
