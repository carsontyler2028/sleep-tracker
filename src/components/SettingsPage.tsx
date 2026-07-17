import type { AppSettings } from "../types";


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


  return (

    <>

      <h1>
        Settings
      </h1>




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


        <label>

          Minimum Sleep Length (minutes)


          <input

            type="number"

            min="0"

            value={
              settings.minimumSleepMinutes
            }


            onChange={(e) =>
              onChange({

                ...settings,

                minimumSleepMinutes:
                  Number(
                    e.target.value
                  )

              })
            }

          />


        </label>


      </div>



    </>

  );

}


export default Settings;