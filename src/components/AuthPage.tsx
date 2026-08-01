import { useState } from "react";
import { supabase } from "../lib/supabase";

interface AuthPageProps {
  onGuest: () => void;
}

function AuthPage({
  onGuest,
}: AuthPageProps) {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isLogin, setIsLogin] =
    useState(true);

  const [message, setMessage] =
    useState("");


  async function handleSubmit() {

    setMessage("");

    if (
      !email ||
      !password
    ) {

      setMessage(
        "Enter email and password"
      );

      return;
    }

    if (isLogin) {

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        setMessage(error.message);
      }

    } else {

      const { error } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (error) {

        setMessage(
          error.message
        );

      } else {

        setMessage(
          "Account created successfully"
        );

      }

    }

  }


  return (

    <div className="authPage">

      <div className="infoCard authCard">

        <div className="authLogo">
          🌙
        </div>

        <h1 className="authTitle">
          Sleep Tracker
        </h1>

        <p className="authSubtitle">
          Track your sleep across all your devices
        </p>

        <h3>
          {isLogin
            ? "Sign In"
            : "Create Account"}
        </h3>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
        />

        <button
          className="mainButton"
          onClick={handleSubmit}
        >
          {isLogin
            ? "Sign In"
            : "Create Account"}
        </button>

        <button
          className="authLink"
          onClick={() =>
            setIsLogin(
              !isLogin
            )
          }
        >
          {isLogin
            ? "Need an account?"
            : "Already have an account?"}
        </button>

        <button
          className="guestButton"
          onClick={onGuest}
        >
          Continue as Guest
        </button>

        {message && (

          <p className="authMessage">
            {message}
          </p>

        )}

      </div>

    </div>

  );

}

export default AuthPage;