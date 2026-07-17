import type { SleepSession } from "../types";

interface HomeProps {
  sleeping: boolean;
  sleepStart: Date | null;
  lastNight?: SleepSession;

  onStartSleep: () => void;
  onWakeUp: () => void;

  formatDuration: (minutes: number) => string;
}


function Home({
  sleeping,
  sleepStart,
  lastNight,
  onStartSleep,
  onWakeUp,
  formatDuration,
}: HomeProps) {

  return (
    <>

      <h1>
        🌙 Sleep Tracker
      </h1>


      <button
        className="mainButton"
        onClick={
          sleeping
            ? onWakeUp
            : onStartSleep
        }
      >

        {
          sleeping
            ? "☀️ Wake Up"
            : "🌙 Start Sleep"
        }

      </button>




      {sleeping && sleepStart && (

        <div className="infoCard">

          <h3>
            Sleeping Since
          </h3>


          <h2>
            {
              sleepStart.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            }
          </h2>

        </div>

      )}






      {lastNight && (

        <div className="infoCard">

          <h3>
            Last Sleep
          </h3>


          <h2>
            {
              formatDuration(
                lastNight.durationMinutes
              )
            }
          </h2>


          <p>
            {lastNight.date}
          </p>

        </div>

      )}

    </>
  );
}


export default Home;