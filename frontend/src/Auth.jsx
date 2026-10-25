
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./Auth.css";

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        onLogin(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [onLogin]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) throw error;

        onLogin(data.user);
        setMessage("Login successful!");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        if (data.session && data.user) {
          onLogin(data.user);
          setMessage("Account created successfully!");
        } else {
          setMessage(
            "Account created! Check your email to confirm your account, then log in."
          );
        }
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Travel Planner</h1>

        <p>
          {isLogin
            ? "Welcome back! Log in to continue."
            : "Create an account to plan your trips."}
        </p>

        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          autoComplete={isLogin ? "current-password" : "new-password"}
          minLength={6}
          required
        />

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : isLogin
              ? "Log In"
              : "Create Account"}
        </button>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-switch">
          {isLogin ? "New here?" : "Already have an account?"}
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>
      </form>
    </div>
  );
}
