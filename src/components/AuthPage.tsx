import { useState } from "react";
import { supabase } from "../lib/supabase";
import AppLogo from "./AppLogo";

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

  const [newUsername, setNewUsername] =
    useState("");

  const [isLogin, setIsLogin] =
    useState(true);

  const [message, setMessage] =
    useState("");

  async function handleSubmit() {

    setMessage("");

    if (!email || !password) {

      setMessage(
        "Enter email and password"
      );

      return;
    }

    if (!isLogin && !newUsername) {

      setMessage(
        "Enter a username"
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
          options: {
            data: {
              username: newUsername,
            },
          },
        });

      if (error) {

        setMessage(error.message);

      } else {

        setMessage(
          "Account created successfully"
        );

      }

    }

  }

  return (

    <div className="content">

      <div className="authLogo">
        <AppLogo />
      </div>

      <h1 className="authTitle">
        Sleep Tracker
      </h1>

      <p className="authSubtitle">
        Track your sleep anywhere
      </p>

      <div className="infoCard authCard">

        <h3>
          {isLogin
            ? "Sign In"
            : "Create Account"}
        </h3>

        {!isLogin && (

          <input
            className="authInput"
            type="text"
            placeholder="Username"
            value={newUsername}
            onChange={(e) =>
              setNewUsername(
                e.target.value
              )
            }
          />

        )}

        <input
          className="authInput"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          className="authInput"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
        />

        {/* SIGN IN / CREATE ACCOUNT */}

        <button
          className="mainButton"
          onClick={handleSubmit}
        >
          {isLogin
            ? "Sign In"
            : "Create Account"}
        </button>

        {/* SWITCH BETWEEN LOGIN AND CREATE ACCOUNT */}

        <button
          className="authLinkButton"
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage("");
          }}
        >
          {isLogin
            ? "Create Account"
            : "Back to Sign In"}
        </button>

        {/* GUEST LOGIN */}

        <div className="authDivider">
          <span>or</span>
        </div>

        <button
          className="guestButton"
          onClick={onGuest}
        >
          Continue as Guest
        </button>

        {message && (
          <p>
            {message}
          </p>
        )}

      </div>

    </div>

  );

}

export default AuthPage;
