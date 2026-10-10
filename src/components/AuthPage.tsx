
import { useState } from "react";
import { supabase } from "../lib/supabase";
import AppLogo from "./AppLogo";

interface AuthPageProps {
  onGuest: () => void;
  recoveryMode?: boolean;
  onPasswordResetComplete?: () => void;
}

function AuthPage({
  onGuest,
  recoveryMode = false,
  onPasswordResetComplete,
}: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    setMessage("");

    if (!email || !password) {
      setMessage("Enter email and password.");
      return;
    }

    if (!isLogin && !newUsername) {
      setMessage("Enter a username.");
      return;
    }

    setBusy(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) setMessage(error.message);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: newUsername },
          },
        });

        if (error) {
          setMessage(error.message);
        } else {
          setMessage("Account created successfully.");
        }
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotPassword() {
    setMessage("");

    if (!email.trim()) {
      setMessage("Enter your email address first.");
      return;
    }

    setBusy(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/`,
        }
      );

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          "If an account exists for that email, a password reset link will be sent. Check your inbox and spam folder."
        );
      }
    } catch {
      setMessage("Couldn't send the reset request. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSetNewPassword() {
    setMessage("");

    if (password.length < 6) {
      setMessage("Your new password must be at least 6 characters.");
      return;
    }

    setBusy(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Password updated successfully.");

        await supabase.auth.signOut();
        onPasswordResetComplete?.();
      }
    } catch {
      setMessage("Couldn't update your password. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const title = recoveryMode
    ? "Choose a New Password"
    : forgotPassword
      ? "Reset Password"
      : isLogin
        ? "Sign In"
        : "Create Account";

  return (
    <div className="content">
      <div className="authLogo">
        <AppLogo />
      </div>

      <h1 className="authTitle">Sleep Tracker</h1>

      <p className="authSubtitle">
        {recoveryMode
          ? "Enter a new password for your account."
          : "Track your sleep anywhere"}
      </p>

      <div className="infoCard authCard">
        <h3>{title}</h3>

        {!recoveryMode && !forgotPassword && !isLogin && (
          <input
            className="authInput"
            type="text"
            placeholder="Username"
            autoComplete="username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        )}

        {!recoveryMode && (
          <input
            className="authInput"
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}

        {!forgotPassword && (
          <input
            className="authInput"
            type="password"
            placeholder={recoveryMode ? "New password" : "Password"}
            autoComplete={
              recoveryMode
                ? "new-password"
                : isLogin
                  ? "current-password"
                  : "new-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        <button
          className="mainButton"
          disabled={busy}
          onClick={
            recoveryMode
              ? handleSetNewPassword
              : forgotPassword
                ? handleForgotPassword
                : handleSubmit
          }
        >
          {busy
            ? "Please wait..."
            : recoveryMode
              ? "Save New Password"
              : forgotPassword
                ? "Send Reset Email"
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
        </button>

        {!recoveryMode && (
          <button
            className="authLinkButton"
            onClick={() => {
              setForgotPassword(false);
              setIsLogin(!isLogin);
              setPassword("");
              setMessage("");
            }}
          >
            {forgotPassword
              ? "Back to Sign In"
              : isLogin
                ? "Create Account"
                : "Back to Sign In"}
          </button>
        )}

        {!recoveryMode && !forgotPassword && (
          <>
            <div className="authDivider">
              <span>or</span>
            </div>

            <button className="guestButton" onClick={onGuest}>
              Continue as Guest
            </button>

            {isLogin && (
              <button
                className="authLinkButton"
                onClick={() => {
                  setForgotPassword(true);
                  setMessage("");
                }}
              >
                Forgot Password?
              </button>
            )}
          </>
        )}

        {message && <p role="status">{message}</p>}
      </div>
    </div>
  );
}

export default AuthPage;
