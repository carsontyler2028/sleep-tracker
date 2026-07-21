import { useState } from "react";
import "./App.css";

import Home from "./components/HomePage";
import History from "./components/HistoryPage";
import Settings from "./components/SettingsPage";
import Navigation from "./components/Navigation";
import Header from "./components/Header";
import Analytics from "./components/AnalyticsPage";

import type { SleepSession, AppSettings } from "./types";


type Page =
  | "home"
  | "history"
  | "analytics"
  | "settings";


function formatDuration(minutes: number) {

  if (!Number.isFinite(minutes) || minutes < 0) {
    return "0h 00m";
  }

  const hours =
    Math.floor(minutes / 60);

  const mins =
    Math.floor(minutes % 60);

  return `${hours}h ${mins
    .toString()
    .padStart(2, "0")}m`;
}



function formatTime(
  date: Date,
  use24Hour: boolean
) {

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: !use24Hour,
  });

}



function App() {


  const [page, setPage] =
    useState<Page>("home");



  const [settings, setSettings] =
    useState<AppSettings>(() => {

      const saved =
        localStorage.getItem("settings");


      return saved

        ? JSON.parse(saved)

        : {

            darkMode: true,

            use24Hour: false,

            minimumSleepMinutes: 15,

            sleepGoalMinutes: 480,


            consistencyDefaultPeriod: "30",

            showConsistency7: true,

            showConsistency30: true,

            showConsistencyAll: true,

          };

    });




  const [sessions, setSessions] =
    useState<SleepSession[]>(() => {

      const saved =
        localStorage.getItem(
          "sleepSessions"
        );


      return saved
        ? JSON.parse(saved)
        : [];

    });




  const [sleepStart, setSleepStart] =
    useState<Date | null>(() => {

      const saved =
        localStorage.getItem(
          "sleepStart"
        );


      return saved
        ? new Date(saved)
        : null;

    });




  const sleeping =
    sleepStart !== null;




  function updateSettings(
    newSettings: AppSettings
  ) {

    setSettings(newSettings);


    localStorage.setItem(
      "settings",
      JSON.stringify(newSettings)
    );

  }




  function startSleep() {

    const now =
      new Date();


    setSleepStart(now);


    localStorage.setItem(
      "sleepStart",
      now.toISOString()
    );

  }





  function wakeUp() {

    if (!sleepStart) return;


    const end =
      new Date();



    const durationMinutes =
      Math.floor(
        (
          end.getTime()
          -
          sleepStart.getTime()
        )
        /
        60000
      );




    if (
      durationMinutes
      <
      settings.minimumSleepMinutes
    ) {

      localStorage.removeItem(
        "sleepStart"
      );


      setSleepStart(null);


      return;

    }





    const session: SleepSession = {

      id:
        Date.now(),


      startTimestamp:
        sleepStart.toISOString(),


      endTimestamp:
        end.toISOString(),


      startTime:
        formatTime(
          sleepStart,
          settings.use24Hour
        ),


      endTime:
        formatTime(
          end,
          settings.use24Hour
        ),


      date:
        end.toLocaleDateString(),


      durationMinutes,

    };





    const updated = [

      session,

      ...sessions,

    ];




    setSessions(updated);



    localStorage.setItem(

      "sleepSessions",

      JSON.stringify(updated)

    );




    localStorage.removeItem(
      "sleepStart"
    );


    setSleepStart(null);

  }






  function deleteSession(
    id: number
  ) {


    const updated =
      sessions.filter(
        (session) =>
          session.id !== id
      );



    setSessions(updated);



    localStorage.setItem(

      "sleepSessions",

      JSON.stringify(updated)

    );

  }






  const weeklyAverage =

    sessions.length > 0

      ? Math.floor(

          sessions

            .slice(0, 7)

            .reduce(

              (
                total,
                session
              ) =>

                total
                +
                session.durationMinutes,

              0

            )

          /

          Math.min(
            sessions.length,
            7
          )

        )

      : 0;






  const lastNight =
    sessions[0];






  return (


    <div

      className={

        settings.darkMode

          ? "app dark"

          : "app"

      }

    >


      <div className="card">


        <Header />



        <div className="content">





          {
            page === "home" && (

              <Home

                sleeping={sleeping}

                sleepStart={sleepStart}

                lastNight={lastNight}

                settings={settings}

                onStartSleep={startSleep}

                onWakeUp={wakeUp}

                formatDuration={
                  formatDuration
                }

              />

            )
          }







          {
            page === "history" && (

              <History

                sessions={sessions}

                weeklyAverage={
                  weeklyAverage
                }

                formatDuration={
                  formatDuration
                }

                onDelete={
                  deleteSession
                }

              />

            )
          }







          {
            page === "analytics" && (

              <Analytics

                sessions={sessions}

                settings={settings}

                formatDuration={
                  formatDuration
                }

              />

            )
          }








          {
            page === "settings" && (

              <Settings

                settings={settings}

                onChange={
                  updateSettings
                }

              />

            )
          }






        </div>







        <Navigation

          page={page}

          setPage={setPage}

        />





      </div>


    </div>


  );

}



export default App;