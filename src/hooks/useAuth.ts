import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

interface AuthState {
  session: Session | null;
  username: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [session, setSession] =
    useState<Session | null>(null);

  const [username, setUsername] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function loadProfile(
    currentSession: Session | null
  ) {
    if (!currentSession) {
      setUsername(null);
      return;
    }

    const savedUsername =
      currentSession.user.user_metadata?.username;

    setUsername(
      savedUsername ||
      currentSession.user.email ||
      null
    );
  }

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        setSession(
          data.session
        );

        await loadProfile(
          data.session
        );

        setLoading(false);
      });

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        async (
          _event,
          newSession
        ) => {
          setSession(
            newSession
          );

          await loadProfile(
            newSession
          );

          setLoading(false);
        }
      );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();

    setSession(null);
    setUsername(null);
  }

  return {
    session,
    username,
    loading,
    signOut,
  };
}