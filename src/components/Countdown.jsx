import useCountdown from "../hooks/useCountdown";

export default function Countdown() {
  const takeOffDate = new Date(2026, 10, 10);

  let countdown = useCountdown(takeOffDate);

  //   console.log(countdown)
  return (
    <section>
      <h3>Days: {countdown.days}</h3>
      <h3>Hours: {countdown.hours}</h3>
      <h3>Minutes: {countdown.minutes}</h3>
      <h3>Seconds: {countdown.seconds}</h3>
    </section>
  );
}
