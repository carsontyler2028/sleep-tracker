import type { SleepSession } from "../types";

interface HistoryProps {
  sessions: SleepSession[];
  weeklyAverage: number;
  formatDuration: (minutes: number) => string;
  onDelete: (id: number) => void;
}


function History({
  sessions,
  weeklyAverage,
  formatDuration,
  onDelete,
}: HistoryProps) {


  const lastNight = sessions[0];


  return (
    <>

      <h1>
        History
      </h1>



      {lastNight && (

        <div className="infoCard">

          <h3>
            Last Night
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


          <p>
            Start: {lastNight.startTime}
          </p>


          <p>
            End: {lastNight.endTime}
          </p>


        </div>

      )}






      <div className="infoCard">

        <h3>
          Weekly Average
        </h3>


        <h2>
          {
            formatDuration(
              weeklyAverage
            )
          }
        </h2>


      </div>







      <h3>
        Previous Nights
      </h3>




      {
        sessions.slice(1).map((session) => (

          <div
            className="session"
            key={session.id}
          >


            <button
              className="deleteButton"
              onClick={() =>
                onDelete(session.id)
              }
            >
              🗑️
            </button>



            <b>
              {session.date}
            </b>


            <p>
              {
                formatDuration(
                  session.durationMinutes
                )
              }
            </p>


          </div>

        ))
      }


    </>
  );
}


export default History;