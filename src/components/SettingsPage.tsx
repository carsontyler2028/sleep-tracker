import type { AppSettings } from "../types";
import WheelPicker from "./WheelPicker";


interface SettingsProps {

  settings: AppSettings;

  onChange: (
    settings: AppSettings
  ) => void;

}



function Settings({
  settings,
  onChange,
}: SettingsProps) {


  const goalHours =
    Math.floor(
      settings.sleepGoalMinutes / 60
    );


  const goalMinutes =
    settings.sleepGoalMinutes % 60;



  return (

    <>

      <h1>
        Settings
      </h1>



      <div className="settingsSleepRow">


        <div className="infoCard">

          <h3>
            Sleep Goal
          </h3>


          <div className="sleepWheel">


            <WheelPicker

              values={
                Array.from(
                  { length: 13 },
                  (_, i) => i
                )
              }

              value={goalHours}

              suffix="h"

              onChange={(hours) =>
                onChange({

                  ...settings,

                  sleepGoalMinutes:
                    (hours * 60)
                    +
                    goalMinutes

                })
              }

            />



            <WheelPicker

              values={[
                0,
                15,
                30,
                45
              ]}

              value={goalMinutes}

              suffix="m"

              onChange={(minutes) =>
                onChange({

                  ...settings,

                  sleepGoalMinutes:
                    (goalHours * 60)
                    +
                    minutes

                })
              }

            />


          </div>


        </div>





        <div className="infoCard">

          <h3>
            Minimum Sleep Length
          </h3>


          <WheelPicker

            values={
              Array.from(
                {
                  length:17
                },
                (_, i) =>
                  10 + (i * 5)
              )
            }

            value={
              settings.minimumSleepMinutes
            }

            suffix="m"

            onChange={(minutes) =>
              onChange({

                ...settings,

                minimumSleepMinutes:
                  minutes

              })
            }

          />


        </div>


      </div>





      <div className="infoCard">

        <label>

          Dark Mode


          <input

            type="checkbox"

            checked={
              settings.darkMode
            }

            onChange={(e) =>
              onChange({

                ...settings,

                darkMode:
                  e.target.checked

              })
            }

          />

        </label>

      </div>





      <div className="infoCard">

        <label>

          24 Hour Time


          <input

            type="checkbox"

            checked={
              settings.use24Hour
            }

            onChange={(e) =>
              onChange({

                ...settings,

                use24Hour:
                  e.target.checked

              })
            }

          />

        </label>

      </div>






      <div className="infoCard">

        <h3>
          Consistency Settings
        </h3>



        <label>

          Default Time Period


          <select

            value={
              settings.consistencyDefaultPeriod
            }

            onChange={(e) =>
              onChange({

                ...settings,

                consistencyDefaultPeriod:
                  e.target.value as
                  "7" | "30" | "all"

              })
            }

          >

            <option value="30">
              Last 30 Days
            </option>

            <option value="7">
              Last 7 Days
            </option>

            <option value="all">
              All Time
            </option>


          </select>

        </label>


      </div>






      <div className="infoCard">

        <h3>
          Show Consistency Cards
        </h3>



        <label>

          Last 7 Days

          <input
            type="checkbox"

            checked={
              settings.showConsistency7
            }

            onChange={(e) =>
              onChange({

                ...settings,

                showConsistency7:
                  e.target.checked

              })
            }

          />

        </label>



        <br />



        <label>

          Last 30 Days

          <input
            type="checkbox"

            checked={
              settings.showConsistency30
            }

            onChange={(e) =>
              onChange({

                ...settings,

                showConsistency30:
                  e.target.checked

              })
            }

          />

        </label>



        <br />



        <label>

          All Time

          <input
            type="checkbox"

            checked={
              settings.showConsistencyAll
            }

            onChange={(e) =>
              onChange({

                ...settings,

                showConsistencyAll:
                  e.target.checked

              })
            }

          />

        </label>


      </div>






      <div className="infoCard">

        <h3>
          Consistency Calculation
        </h3>


        <p>
          Bedtime: 40%
        </p>


        <p>
          Wake Time: 40%
        </p>


        <p>
          Sleep Duration: 20%
        </p>


        <p>
          Last 30 days removes large outliers.
          All time uses stricter filtering.
        </p>


      </div>


    </>

  );

}


export default Settings;