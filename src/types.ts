export interface SleepSession {
  id: number;

  startTimestamp?: string;
  endTimestamp?: string;

  startTime: string;
  endTime: string;
  date: string;

  durationMinutes: number;
}


export type ConsistencyPeriod =
  | "7"
  | "30"
  | "all";


export interface AppSettings {

  darkMode: boolean;

  use24Hour: boolean;

  minimumSleepMinutes: number;

  sleepGoalMinutes: number;


  // Consistency Settings

  consistencyDefaultPeriod: ConsistencyPeriod;


  showConsistency7: boolean;

  showConsistency30: boolean;

  showConsistencyAll: boolean;

}