import CSS from "csstype";
import { useState, useEffect } from "react";

type CountdownTimer = {
  initTime: Date | string | number; // Unix time stamp (mili second )
  style?: React.CSSProperties;
  expire?: React.ReactNode;
  onExpire?: () => void;
};

export function CountdownTimer(props: CountdownTimer) {
  // Initial time in seconds (1 hour)
  //   const initialTime = 60 * 60;
  const [timeRemaining, setTimeRemaining] = useState(
    Math.floor(
      new Date(props.initTime).getTime() / 1000 - new Date().getTime() / 1000,
    ),
  );

  useEffect(() => {
    console.log("Init time : ", new Date(props.initTime));

    const timerInterval = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime === 0) {
          clearInterval(timerInterval);
          props.onExpire && props.onExpire();

          // Perform actions when the timer reaches zero
          console.log("Countdown complete!");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(timerInterval);
  }, [props.initTime]); // The empty dependency array ensures the effect runs only once on mount

  // Convert seconds to hours, minutes, and seconds
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  return (
    <div
      className="flex_row_center cd "
      style={{
        ...props.style,
        width: "fit-content",
        minWidth: "180px",
      }}
    >
      {timeRemaining <= 0 ? (
        props.expire || <div className="expired">Expire</div>
      ) : (
        <>
          <span className="time" style={{ width: "60px" }}>{`${hours}h`}</span>
          <span className="time_sep">:</span>
          <span className="time">{`${minutes}m`}</span>
          <span className="time_sep">:</span>
          <span className="time">{`${seconds}s`}</span>
        </>
      )}
    </div>
  );
}
