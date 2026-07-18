export interface SleepSession {
  id: number;
  startTime: string;
  endTime: string;
  date: string;
  durationMinutes: number;
}

export interface AppSettings {
  darkMode: boolean;
  use24Hour: boolean;
  minimumSleepMinutes: number;
  sleepGoalMinutes: number;
}