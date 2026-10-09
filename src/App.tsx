
import { useEffect, useState } from "react";
import "./App.css";

import {
  APP_VERSION,
  WHATS_NEW,
} from "./version";

import Home from "./components/HomePage";
import History from "./components/HistoryPage";
import Settings from "./components/SettingsPage";
import Navigation from "./components/Navigation";
import Header from "./components/Header";
import Analytics from "./components/AnalyticsPage";
import AuthPage from "./components/AuthPage";

import { useAuth } from "./hooks/useAuth";
import { supabase } from "./lib/supabase";

import type {
  SleepSession,
  AppSettings,
} from "./types";

import type { CloudSyncStatus } from "./components/ConnectionStatus";

type Page =
  | "home"
  | "history"
  | "analytics"
  | "settings";

interface CloudSleepSession {
  id: string;
  user_id: string;
  start_timestamp: string | null;
  end_timestamp: string | null;
  duration_minutes: number | null;
}

const SYNCED_KEYS_STORAGE = "syncedSleepSessionKeys";

// This is the specific test session that was synced successfully
// and subsequently deleted from Supabase before sync tracking existed.
const LEGACY_DELETED_SESSION_KEYS = [
  "2026-10-09T03:57:22.328Z|2026-10-09T04:08:53.461Z",
];

function normalizeTimestamp(value?: string | null) {
  if (!value) return null;

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return null;
  }

  return timestamp.toISOString();
}

function sessionKey(
  session: Pick<
    SleepSession,
    "startTimestamp" | "endTimestamp"
  >
) {
  const start = normalizeTimestamp(
    session.startTimestamp
  );

  const end = normalizeTimestamp(
    session.endTimestamp
  );

  if (!start || !end) return null;

  return `${start}|${end}`;
}

function readSyncedKeys(): string[] {
  try {
    const saved = localStorage.getItem(
      SYNCED_KEYS_STORAGE
    );

    const parsed: unknown = saved
      ? JSON.parse(saved)
      : [];

    if (
      Array.isArray(parsed) &&
      parsed.every(
        (item) => typeof item === "string"
      )
    ) {
      return parsed;
    }
  } catch (error) {
    console.error(
      "Couldn't read sync history:",
      error
    );
  }

  return [];
}

function saveSyncedKeys(keys: Set<string>) {
  localStorage.setItem(
    SYNCED_KEYS_STORAGE,
    JSON.stringify([...keys])
  );
}

function formatDuration(minutes: number) {
  if (
    !Number.isFinite(minutes) ||
    minutes < 0
  ) {
    return "0h 00m";
  }

  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);

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

function cloudIdToNumber(id: string) {
  let hash = 2166136261;

  for (let i = 0; i < id.length; i++) {
    hash = Math.imul(
      hash ^ id.charCodeAt(i),
      16777619
    );
  }

  return (hash >>> 0) + 1;
}

function App() {
  const {
    session,
    username,
    loading: authLoading,
    signOut,
  } = useAuth();

  const [guestMode, setGuestMode] =
    useState(false);

  const [page, setPage] =
    useState<Page>("home");

  const [showWhatsNew, setShowWhatsNew] =
    useState(false);

  const [syncStatus, setSyncStatus] =
  useState<CloudSyncStatus>("idle");

function setSyncMessage(message: string | null) {
  if (message === null) {
    setSyncStatus("idle");
    return;
  }

  const normalized = message.toLowerCase();

  if (
    normalized.includes("syncing") ||
    normalized.includes("uploading")
  ) {
    setSyncStatus("syncing");
    return;
  }

  if (
    normalized.includes("failed") ||
    normalized.includes("couldn't") ||
    normalized.includes("could not")
  ) {
    setSyncStatus("error");
    return;
  }

  if (
    normalized.includes("synced") ||
    normalized.includes("sync complete") ||
    normalized.includes("deleted from this device and the cloud")
  ) {
    setSyncStatus("synced");
    return;
  }

  setSyncStatus("idle");
}

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
            consistencyDefaultPeriod: "7",
            showConsistency7: true,
            showConsistency30: true,
            showConsistencyAll: true,
          };
    });

  const [sessions, setSessions] =
    useState<SleepSession[]>(() => {
      const saved =
        localStorage.getItem("sleepSessions");

      return saved
        ? JSON.parse(saved)
        : [];
    });

  const [sleepStart, setSleepStart] =
    useState<Date | null>(() => {
      const saved =
        localStorage.getItem("sleepStart");

      return saved
        ? new Date(saved)
        : null;
    });

  useEffect(() => {
    const lastSeenVersion =
      localStorage.getItem("lastSeenVersion");

    if (lastSeenVersion !== APP_VERSION) {
      setShowWhatsNew(true);

      localStorage.setItem(
        "lastSeenVersion",
        APP_VERSION
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "settings",
      JSON.stringify(settings)
    );
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(
      "sleepSessions",
      JSON.stringify(sessions)
    );
  }, [sessions]);

  const updateSettings = (
    newSettings: AppSettings
  ) => {
    setSettings(newSettings);

    localStorage.setItem(
      "settings",
      JSON.stringify(newSettings)
    );
  };

  // Download cloud sessions and merge them with this device.
  useEffect(() => {
    if (
      authLoading ||
      !session ||
      guestMode
    ) {
      return;
    }

    let cancelled = false;

    async function syncCloudSessions() {
      setSyncMessage(
        "Syncing your sleep sessions..."
      );

      try {
        const { data, error } = await supabase
          .from("Sleep Sessions")
          .select(
            "id, user_id, start_timestamp, end_timestamp, duration_minutes"
          )
          .eq("user_id", session!.user.id)
          .order("end_timestamp", {
            ascending: false,
          });

        if (error) {
          console.error(
            "Cloud download failed:",
            error
          );

          if (!cancelled) {
            setSyncMessage(
              "Couldn't download cloud sessions. Your local sessions are unchanged."
            );
          }

          return;
        }

        const cloudRows =
          (data ?? []) as CloudSleepSession[];

        let localSessions: SleepSession[];

        try {
          const saved =
            localStorage.getItem("sleepSessions");

          localSessions = saved
            ? JSON.parse(saved)
            : [];
        } catch {
          localSessions = sessions;
        }

        // Keep a history of session keys previously seen in the cloud.
        // The explicit legacy key handles the test session that was
        // deleted before this tracking mechanism was introduced.
        const knownSyncedKeys = new Set<string>([
          ...readSyncedKeys(),
          ...LEGACY_DELETED_SESSION_KEYS,
        ]);

        const cloudKeys = new Set<string>();

        const mergedByKey =
          new Map<string, SleepSession>();

        const localByKey =
          new Map<string, SleepSession>();

        for (const local of localSessions) {
          const key = sessionKey(local);

          if (key) {
            localByKey.set(key, local);
          }
        }

        for (const row of cloudRows) {
          if (
            !row.start_timestamp ||
            !row.end_timestamp
          ) {
            continue;
          }

          const key = sessionKey({
            startTimestamp: row.start_timestamp,
            endTimestamp: row.end_timestamp,
          });

          if (!key) continue;

          cloudKeys.add(key);
          knownSyncedKeys.add(key);

          const local = localByKey.get(key);

          const start = new Date(
            row.start_timestamp
          );

          const end = new Date(
            row.end_timestamp
          );

          const duration =
            row.duration_minutes ??
            Math.max(
              0,
              Math.floor(
                (end.getTime() - start.getTime()) /
                  60000
              )
            );

          mergedByKey.set(key, {
            id:
              local?.id ??
              cloudIdToNumber(row.id),

            cloudId: row.id,

            startTimestamp:
              row.start_timestamp,

            endTimestamp:
              row.end_timestamp,

            startTime:
              local?.startTime ??
              formatTime(
                start,
                settings.use24Hour
              ),

            endTime:
              local?.endTime ??
              formatTime(
                end,
                settings.use24Hour
              ),

            date:
              local?.date ??
              end.toLocaleDateString(),

            durationMinutes: duration,
          });
        }

        // Keep sessions that have never been synced.
        // Drop previously synced sessions absent from the cloud.
        for (const local of localSessions) {
          const key = sessionKey(local);

          if (!key) {
            // Preserve unusual local records that lack timestamps.
            mergedByKey.set(
              `local:${local.id}`,
              local
            );

            continue;
          }

          if (cloudKeys.has(key)) {
            // The cloud copy was already added above.
            continue;
          }

          if (knownSyncedKeys.has(key)) {
            // It was previously in the cloud but is now gone.
            // Don't restore a remotely deleted session.
            continue;
          }

          mergedByKey.set(key, local);
        }

        if (cancelled) return;

        const merged = [
          ...mergedByKey.values(),
        ].sort((a, b) => {
          const aTime = a.endTimestamp
            ? new Date(a.endTimestamp).getTime()
            : a.id;

          const bTime = b.endTimestamp
            ? new Date(b.endTimestamp).getTime()
            : b.id;

          return bTime - aTime;
        });

        saveSyncedKeys(knownSyncedKeys);

        localStorage.setItem(
          "sleepSessions",
          JSON.stringify(merged)
        );

        setSessions(merged);

        setSyncMessage(
          `Cloud sync complete. ${cloudRows.length} cloud record(s) checked.`
        );
      } catch (error) {
        console.error(
          "Unexpected cloud sync error:",
          error
        );

        if (!cancelled) {
          setSyncMessage(
            "Cloud sync failed. Your local sessions are unchanged."
          );
        }
      }
    }

    void syncCloudSessions();

    return () => {
      cancelled = true;
    };
  }, [
    session?.user.id,
    authLoading,
    guestMode,
    settings.use24Hour,
  ]);

  const sleeping = sleepStart !== null;

  function startSleep() {
    const now = new Date();

    setSleepStart(now);
    setSyncMessage(null);

    localStorage.setItem(
      "sleepStart",
      now.toISOString()
    );
  }

  async function wakeUp() {
    if (!sleepStart) return;

    const end = new Date();

    const startTimestamp =
      sleepStart.toISOString();

    const endTimestamp =
      end.toISOString();

    const durationMinutes = Math.floor(
      (
        end.getTime() -
        sleepStart.getTime()
      ) / 60000
    );

    if (
      durationMinutes <
      settings.minimumSleepMinutes
    ) {
      localStorage.removeItem("sleepStart");
      setSleepStart(null);

      return;
    }

    const newSession: SleepSession = {
      id: Date.now(),

      startTimestamp,
      endTimestamp,

      startTime: formatTime(
        sleepStart,
        settings.use24Hour
      ),

      endTime: formatTime(
        end,
        settings.use24Hour
      ),

      date: end.toLocaleDateString(),

      durationMinutes,
    };

    const updated = [
      newSession,
      ...sessions,
    ];

    setSessions(updated);

    localStorage.setItem(
      "sleepSessions",
      JSON.stringify(updated)
    );

    localStorage.removeItem("sleepStart");
    setSleepStart(null);

    if (!session || guestMode) {
      setSyncMessage(
        "Sleep session saved on this device."
      );

      return;
    }

    setSyncMessage(
      "Saved locally. Uploading to your account..."
    );

    try {
      const { data, error } = await supabase
        .from("Sleep Sessions")
        .insert({
          user_id: session.user.id,
          start_timestamp: startTimestamp,
          end_timestamp: endTimestamp,
          duration_minutes: durationMinutes,
        })
        .select("id")
        .single();

      if (error) {
        console.error(
          "Cloud upload failed:",
          error
        );

        setSyncMessage(
          "Upload failed. Your session is still saved locally."
        );

        return;
      }

      const key = sessionKey(newSession);

      if (key) {
        const knownSyncedKeys =
          new Set(readSyncedKeys());

        knownSyncedKeys.add(key);

        saveSyncedKeys(knownSyncedKeys);
      }

      const updatedWithCloudId =
        updated.map((item) =>
          item.id === newSession.id
            ? {
                ...item,
                cloudId: data.id,
              }
            : item
        );

      setSessions(updatedWithCloudId);

      localStorage.setItem(
        "sleepSessions",
        JSON.stringify(updatedWithCloudId)
      );

      setSyncMessage(
        "Sleep session synced to your account."
      );
    } catch (error) {
      console.error(
        "Unexpected upload error:",
        error
      );

      setSyncMessage(
        "Upload failed. Your session is still saved locally."
      );
    }
  }

  async function deleteSession(id: number) {
    const target = sessions.find(
      (item) => item.id === id
    );

    if (!target) return;

    const updated = sessions.filter(
      (item) => item.id !== id
    );

    setSessions(updated);

    localStorage.setItem(
      "sleepSessions",
      JSON.stringify(updated)
    );

    const key = sessionKey(target);

    // Preserve deletion knowledge so the session isn't restored
    // by a later sync, including if the cloud deletion fails.
    if (key) {
      const knownSyncedKeys =
        new Set(readSyncedKeys());

      knownSyncedKeys.add(key);

      saveSyncedKeys(knownSyncedKeys);
    }

    if (
      !target.cloudId ||
      !session ||
      guestMode
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("Sleep Sessions")
        .delete()
        .eq("id", target.cloudId)
        .eq("user_id", session.user.id);

      if (error) {
        console.error(
          "Cloud deletion failed:",
          error
        );

        setSyncMessage(
          "Deleted locally, but cloud deletion failed. It may return on another device."
        );

        return;
      }

      setSyncMessage(
        "Session deleted from this device and the cloud."
      );
    } catch (error) {
      console.error(
        "Unexpected cloud deletion error:",
        error
      );

      setSyncMessage(
        "Deleted locally, but cloud deletion couldn't be confirmed."
      );
    }
  }

  const weeklyAverage =
    sessions.length > 0
      ? Math.floor(
          sessions
            .slice(0, 7)
            .reduce(
              (total, item) =>
                total + item.durationMinutes,
              0
            ) /
            Math.min(sessions.length, 7)
        )
      : 0;

  const lastNight = sessions[0];

  async function handleLogout() {
    if (guestMode) {
      setGuestMode(false);
      setPage("home");
      setSyncMessage(null);

      return;
    }

    await signOut();
    setSyncMessage(null);
  }

  if (authLoading) {
    return (
      <div className="app dark">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (!session && !guestMode) {
    return (
      <div className="app dark">
        <AuthPage
          onGuest={() => setGuestMode(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={
        settings.darkMode
          ? "app dark"
          : "app"
      }
    >
      {showWhatsNew && (
        <div
          className="modalOverlay"
          onClick={() =>
            setShowWhatsNew(false)
          }
        >
          <div
            className="modalCard"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <h2>What's New</h2>

            <h3>Version {APP_VERSION}</h3>

            {WHATS_NEW.map((item) => (
              <p key={item}>• {item}</p>
            ))}

            <button
              className="mainButton"
              onClick={() =>
                setShowWhatsNew(false)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <Header
          username={username}
          syncStatus={syncStatus}
        />

        <div className="content">

          {page === "home" && (
            <Home
              sleeping={sleeping}
              sleepStart={sleepStart}
              lastNight={lastNight}
              settings={settings}
              onStartSleep={startSleep}
              onWakeUp={wakeUp}
              formatDuration={formatDuration}
            />
          )}

          {page === "history" && (
            <History
              sessions={sessions}
              weeklyAverage={weeklyAverage}
              formatDuration={formatDuration}
              onDelete={deleteSession}
            />
          )}

          {page === "analytics" && (
            <Analytics
              sessions={sessions}
              settings={settings}
              formatDuration={formatDuration}
            />
          )}

          {page === "settings" && (
            <Settings
              settings={settings}
              onChange={updateSettings}
              username={username}
              onLogout={handleLogout}
            />
          )}
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