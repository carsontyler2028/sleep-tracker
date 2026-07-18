import { useEffect, useState } from "react";
import type { SleepSession, AppSettings } from "../types";

interface HomeProps {
  sleeping: boolean;
  sleepStart: Date | null;
  lastNight?: SleepSession;

  settings: AppSettings;

  onStartSleep: () => void;
  onWakeUp: () => void;

  formatDuration: (minutes: number) => string;
}


function Home({
  sleeping,
  sleepStart,
  lastNight,
  settings,
  onStartSleep,
  onWakeUp,
  formatDuration,
}: HomeProps) {


  const [elapsed, setElapsed] = useState("0h 00m");


  useEffect(() => {

    if (!sleeping || !sleepStart) {
      setElapsed("0h 00m");
      return;
    }


    const startTime = sleepStart;


    function updateTimer() {

      const minutes = Math.floor(
        (
          Date.now()
          -
          startTime.getTime()
        )
        /
        60000
      );


      setElapsed(
        formatDuration(minutes)
      );

    }


    updateTimer();


    const timer =
      setInterval(
        updateTimer,
        10000
      );


    return () =>
      clearInterval(timer);


  }, [
    sleeping,
    sleepStart,
    formatDuration
  ]);



  const sleepMinutes =
    lastNight
      ? lastNight.durationMinutes
      : 0;


  const goalPercent =
    settings.sleepGoalMinutes > 0
      ? Math.round(
          (
            sleepMinutes /
            settings.sleepGoalMinutes
          )
          *
          100
        )
      : 0;



  const barPercent =
    Math.min(
      125,
      goalPercent
    );



  return (
    <>

      <div className="infoCard sleepCard">


        <h3>
          Sleep Tracker
        </h3>


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



        {
          sleeping && sleepStart && (

            <p>

              Sleeping since{" "}

              {
                sleepStart.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }

              <br />

              Current:
              {" "}
              {elapsed}

            </p>

          )
        }


      </div>





      {
        lastNight && (

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

        )
      }





      <div className="infoCard">

        <h3>
          Sleep Goal
        </h3>


        <h2>

          {
            formatDuration(
              sleepMinutes
            )
          }

          {" / "}

          {
            formatDuration(
              settings.sleepGoalMinutes
            )
          }

        </h2>



        <div className="sleepGoalRow">


          <div className="sleepGoalBar">


            <div
              className="sleepGoalFill"
              style={{
                width: `${(barPercent / 125) * 100}%`
              }}
            />


            <div
              className="sleepGoalMarker"
              style={{
                left: "80%"
              }}
            >

              <span className="sleepGoalLabel">
                Goal
              </span>

            </div>


          </div>



          <span className="sleepGoalPercent">

            {goalPercent}%

          </span>


        </div>


      </div>


    </>
  );
}


export default Home;