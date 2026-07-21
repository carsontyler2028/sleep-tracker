import type { SleepSession } from "../types";


export type ConsistencyPeriod =
  | "7"
  | "30"
  | "all";


export interface ConsistencyResult {

  available: boolean;

  score: number;

  bedtimeVariation: number;

  wakeVariation: number;

  durationVariation: number;

  sessionsUsed: number;

  requiredSessions: number;

}


/*
----------------------------------------
Settings
----------------------------------------
*/


export const BEDTIME_WEIGHT = 0.40;

export const WAKE_WEIGHT = 0.40;

export const DURATION_WEIGHT = 0.20;


export const MIN_SESSIONS_7 = 7;

export const MIN_SESSIONS_30 = 25;

export const MIN_SESSIONS_ALL = 30;


export const OUTLIER_Z_30 = 2.0;

export const OUTLIER_Z_ALL = 3.0;



/*
----------------------------------------
Session Filtering
----------------------------------------
*/


function filterSessions(
  sessions: SleepSession[],
  period: ConsistencyPeriod
): SleepSession[] {


  if (period === "all") {

    return [
      ...sessions
    ];

  }


  const days =
    period === "7"
      ? 7
      : 30;


  const cutoff =
    new Date();


  cutoff.setDate(
    cutoff.getDate() - days
  );


  return sessions.filter(
    (session) => {

      return (
        new Date(
          session.date
        ) >= cutoff
      );

    }
  );

}



/*
----------------------------------------
Math Helpers
----------------------------------------
*/


function calculateStandardDeviation(
  values: number[]
): number {


  if (values.length === 0) {

    return 0;

  }


  const average =
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    )
    /
    values.length;


  const squaredDifferences =
    values.map(
      (value) =>
        Math.pow(
          value - average,
          2
        )
    );


  const averageSquaredDifference =
    squaredDifferences.reduce(
      (sum, value) =>
        sum + value,
      0
    )
    /
    values.length;


  return Math.sqrt(
    averageSquaredDifference
  );

}



function removeOutliers(
  values: number[],
  zScoreLimit: number
): number[] {


  if (values.length < 3) {

    return values;

  }


  const average =
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    )
    /
    values.length;


  const standardDeviation =
    calculateStandardDeviation(
      values
    );


  if (standardDeviation === 0) {

    return values;

  }


  return values.filter(
    (value) => {

      const zScore =
        Math.abs(
          (value - average)
          /
          standardDeviation
        );


      return (
        zScore <= zScoreLimit
      );

    }
  );

}



function getClockMinutes(
  time: string
): number {


  const parts =
    time.split(":");


  return (
    Number(parts[0]) * 60
    +
    Number(parts[1])
  );

}



function getAverage(
  values: number[]
): number {


  if (values.length === 0) {

    return 0;

  }


  return Math.round(
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    )
    /
    values.length
  );

}



function getAverageVariation(
  values: number[],
  isClockTime = false
): number {


  if (values.length === 0) {

    return 0;

  }


  const average =
    getAverage(
      values
    );


  const differences =
    values.map(
      (value) => {

        let difference =
          Math.abs(
            value - average
          );


        if (isClockTime) {

          difference =
            Math.min(
              difference,
              1440 - difference
            );

        }


        return difference;

      }
    );


  return getAverage(
    differences
  );

}



function variationToScore(
  variation: number,
  ideal: number,
  max: number
): number {


  if (variation <= ideal) {

    return 100;

  }


  if (variation >= max) {

    return 0;

  }


  const score =
    100 -
    (
      (
        variation - ideal
      )
      /
      (
        max - ideal
      )
    )
    *
    100;


  return Math.round(
    score
  );

}


export function getSleepConsistency(
  sessions: SleepSession[],
  period: ConsistencyPeriod
): ConsistencyResult {


  let requiredSessions =
    MIN_SESSIONS_7;


  if (period === "30") {

    requiredSessions =
      MIN_SESSIONS_30;

  }


  if (period === "all") {

    requiredSessions =
      MIN_SESSIONS_ALL;

  }



  const filtered =
    filterSessions(
      sessions,
      period
    );



  let cleanedSessions =
    filtered;



  const durationValues =
    filtered.map(
      (session) =>
        session.durationMinutes
    );



  if (
    period === "30"
    &&
    durationValues.length > 0
  ) {


    const validDurations =
      removeOutliers(
        durationValues,
        OUTLIER_Z_30
      );


    cleanedSessions =
      filtered.filter(
        (session) =>
          validDurations.includes(
            session.durationMinutes
          )
      );

  }



  if (
    period === "all"
    &&
    durationValues.length > 0
  ) {


    const validDurations =
      removeOutliers(
        durationValues,
        OUTLIER_Z_ALL
      );


    cleanedSessions =
      filtered.filter(
        (session) =>
          validDurations.includes(
            session.durationMinutes
          )
      );

  }




  const bedtimeValues =
    cleanedSessions.map(
      (session) =>
        getClockMinutes(
          session.startTime
        )
    );


  const wakeValues =
    cleanedSessions.map(
      (session) =>
        getClockMinutes(
          session.endTime
        )
    );


  const cleanedDurationValues =
    cleanedSessions.map(
      (session) =>
        session.durationMinutes
    );

const bedtimeScore =
  variationToScore(
    getAverageVariation(
      bedtimeValues,
      true
    ),
    15,
    90
  );


const wakeScore =
  variationToScore(
    getAverageVariation(
      wakeValues,
      true
    ),
    15,
    90
  );


const durationScore =
  variationToScore(
    getAverageVariation(
      cleanedDurationValues
    ),
    30,
    180
  );

  const finalScore =
  Math.round(
    (
      bedtimeScore *
      BEDTIME_WEIGHT
    )
    +
    (
      wakeScore *
      WAKE_WEIGHT
    )
    +
    (
      durationScore *
      DURATION_WEIGHT
    )
  );

  const isAvailable =
  cleanedSessions.length >=
  requiredSessions;


return {

  available:
    isAvailable,

  score:
    isAvailable
      ? finalScore
      : 0,


    bedtimeVariation:
  getAverageVariation(
    bedtimeValues,
    true
  ),


    wakeVariation:
  getAverageVariation(
    wakeValues,
    true
  ),


    durationVariation:
      getAverageVariation(
        cleanedDurationValues
      ),


    sessionsUsed:
      cleanedSessions.length,


    requiredSessions,

  };

}