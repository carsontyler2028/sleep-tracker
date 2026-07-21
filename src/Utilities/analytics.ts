import type { SleepSession } from "../types";

/*
==================================================
GENERAL STATISTICS
==================================================
*/

export function getTotalNights(
  sessions: SleepSession[]
): number {
  return sessions.length;
}

export function getTotalSleepMinutes(
  sessions: SleepSession[]
): number {
  return sessions.reduce(
    (total, session) =>
      total + session.durationMinutes,
    0
  );
}

export function getTotalSleepHours(
  sessions: SleepSession[]
): number {
  return Number(
    (
      getTotalSleepMinutes(sessions) /
      60
    ).toFixed(1)
  );
}

export function getAverageSleep(
  sessions: SleepSession[]
): number {

  if (sessions.length === 0) {
    return 0;
  }

  return Math.round(
    getTotalSleepMinutes(sessions) /
    sessions.length
  );

}

export function getAverageSleepLast7(
  sessions: SleepSession[]
): number {

  return getAverageSleep(
    sessions.slice(0, 7)
  );

}

export function getAverageSleepLast30(
  sessions: SleepSession[]
): number {

  return getAverageSleep(
    sessions.slice(0, 30)
  );

}

/*
==================================================
RECORDS
==================================================
*/

export function getLongestSleep(
  sessions: SleepSession[]
): SleepSession | undefined {

  if (sessions.length === 0) {
    return undefined;
  }

  return sessions.reduce(
    (longest, current) =>

      current.durationMinutes >
      longest.durationMinutes

        ? current

        : longest
  );

}

export function getShortestSleep(
  sessions: SleepSession[]
): SleepSession | undefined {

  if (sessions.length === 0) {
    return undefined;
  }

  return sessions.reduce(
    (shortest, current) =>

      current.durationMinutes <
      shortest.durationMinutes

        ? current

        : shortest
  );

}


export function getAverageSleepByWeekday(
  sessions: SleepSession[]
) {

  const totals = Array(7).fill(0);
  const counts = Array(7).fill(0);

  sessions.forEach((session) => {

    if (!session.endTimestamp) {
      return;
    }

    const date = new Date(session.endTimestamp);

    const day = date.getDay();

    totals[day] += session.durationMinutes;
    counts[day]++;

  });

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return dayNames.map((day, index) => ({
    day,
    average:
      counts[index] === 0
        ? 0
        : Math.round(
            totals[index] /
            counts[index]
          ),
  }));

}



export function getSessionsLast30Days(
  sessions: SleepSession[]
): SleepSession[] {

  const now = new Date();

  const thirtyDaysAgo =
    new Date();

  thirtyDaysAgo.setDate(
    now.getDate() - 30
  );


  return sessions.filter(
    (session) => {

      if (!session.endTimestamp) {
        return false;
      }


      const date =
        new Date(
          session.endTimestamp
        );


      return date >= thirtyDaysAgo;

    }
  );

}



export function getAverageSleepLast30Days(
  sessions: SleepSession[]
): number {

  return getAverageSleep(
    getSessionsLast30Days(
      sessions
    )
  );

}



export function getTotalSleepLast30Days(
  sessions: SleepSession[]
): number {

  const recentSessions =
    getSessionsLast30Days(
      sessions
    );


  return recentSessions.reduce(
    (total, session) =>
      total + session.durationMinutes,
    0
  );

}



export function getAverageBedtime(
  sessions: SleepSession[]
): number | null {

  const validSessions =
    sessions.filter(
      (session) =>
        session.startTimestamp
    );


  if (validSessions.length === 0) {
    return null;
  }


  const totalMinutes =
    validSessions.reduce(
      (
        total,
        session
      ) => {

        const date =
          new Date(
            session.startTimestamp!
          );


        return (
          total +
          (
            date.getHours() * 60
          ) +
          date.getMinutes()
        );

      },
      0
    );


  return Math.round(
    totalMinutes /
    validSessions.length
  );

}



export function getAverageWakeTime(
  sessions: SleepSession[]
): number | null {

  const validSessions =
    sessions.filter(
      (session) => session.endTimestamp
    );

  if (validSessions.length === 0) {
    return null;
  }

  const totalMinutes =
    validSessions.reduce(
      (total, session) => {

        const date =
          new Date(
            session.endTimestamp!
          );

        return (
          total +
          date.getHours() * 60 +
          date.getMinutes()
        );

      },
      0
    );

  return Math.round(
    totalMinutes /
    validSessions.length
  );

}