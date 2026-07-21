import type { SleepSession, AppSettings } from "../types";

import {
  getAverageSleep,
  getTotalNights,
  getLongestSleep,
  getAverageSleepByWeekday,
  getAverageSleepLast30Days,
  getAverageBedtime,
} from "../Utilities/analytics";

import {
  getSleepConsistency,
} from "../Utilities/consistency";


interface AnalyticsProps {

  sessions: SleepSession[];

  settings: AppSettings;

  formatDuration: (
    minutes: number
  ) => string;

}



function Analytics({
  sessions,
  settings,
  formatDuration,
}: AnalyticsProps) {


  function formatClockTime(
    minutes: number | null
  ) {

    if (minutes === null) {
      return "--";
    }


    const hours =
      Math.floor(minutes / 60);


    const mins =
      minutes % 60;


    const date =
      new Date();


    date.setHours(
      hours,
      mins
    );


    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

  }




  const averageSleep =
    getAverageSleep(
      sessions
    );


  const totalNights =
    getTotalNights(
      sessions
    );


  const longestSleep =
    getLongestSleep(
      sessions
    );


  const weekdayData =
    getAverageSleepByWeekday(
      sessions
    );


  const monthlyAverage =
    getAverageSleepLast30Days(
      sessions
    );


  const averageBedtime =
    getAverageBedtime(
      sessions
    );




  const consistency7 =
    getSleepConsistency(
      sessions,
      "7"
    );


  const consistency30 =
    getSleepConsistency(
      sessions,
      "30"
    );


  const consistencyAll =
    getSleepConsistency(
      sessions,
      "all"
    );




  function ConsistencyCard({
    title,
    data,
  }: {
    title: string;
    data: ReturnType<typeof getSleepConsistency>;
  }) {

    return (

      <div className="infoCard">

        <h3>
          {title}
        </h3>


        {
          data.available ? (

            <>

              <h2>
                {data.score}%
              </h2>


              <p>
                Bedtime:
                {" "}
                ±{data.bedtimeVariation}
                {" "}min
              </p>


              <p>
                Wake time:
                {" "}
                ±{data.wakeVariation}
                {" "}min
              </p>


              <p>
                Duration:
                {" "}
                ±{data.durationVariation}
                {" "}min
              </p>

            </>

          ) : (

            <>

              <h2>
                Insufficient Data
              </h2>


              <p>
                {data.sessionsUsed}
                /
                {data.requiredSessions}
                {" "}
                sessions
              </p>

            </>

          )

        }

      </div>

    );

  }




  return (

    <>

      <h1>
        Analytics
      </h1>




      <div className="infoCard">

        <h3>
          Average Sleep
        </h3>


        <h2>
          {
            formatDuration(
              averageSleep
            )
          }
        </h2>

      </div>





      <div className="infoCard">

        <h3>
          Nights Tracked
        </h3>


        <h2>
          {totalNights}
        </h2>

      </div>





      <div className="infoCard">

        <h3>
          30 Day Average
        </h3>


        <h2>
          {
            formatDuration(
              monthlyAverage
            )
          }
        </h2>

      </div>





      <div className="infoCard">

        <h3>
          Average Bedtime
        </h3>


        <h2>
          {
            formatClockTime(
              averageBedtime
            )
          }
        </h2>

      </div>





      {
        settings.showConsistency30 && (

          <ConsistencyCard

            title={
              settings.consistencyDefaultPeriod === "30"
                ? "Sleep Consistency"
                : "Sleep Consistency (Last 30 Days)"
            }

            data={
              settings.consistencyDefaultPeriod === "30"
                ? consistency30
                : consistency30
            }

          />

        )
      }





      {
        settings.showConsistency7 && (

          <ConsistencyCard

            title="Sleep Consistency (Last 7 Days)"

            data={consistency7}

          />

        )
      }





      {
        settings.showConsistencyAll && (

          <ConsistencyCard

            title="Sleep Consistency (All Time)"

            data={consistencyAll}

          />

        )
      }






      <div className="infoCard">

        <h3>
          Longest Sleep
        </h3>


        <h2>

          {
            longestSleep

              ? formatDuration(
                  longestSleep.durationMinutes
                )

              : "--"

          }

        </h2>


      </div>






      <div className="infoCard">

        <h3>
          Average Sleep By Day
        </h3>


        {
          weekdayData.map(
            (item) => (

              <div
                className="analyticsRow"
                key={item.day}
              >

                <span>
                  {item.day}
                </span>


                <b>

                  {
                    item.average === 0

                      ? "--"

                      : formatDuration(
                          item.average
                        )

                  }

                </b>


              </div>

            )
          )
        }


      </div>


    </>

  );

}


export default Analytics;