"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function RegisterPage() {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Registration successful. Please check your email to verify your account."
    );

    setLoading(false);
  };

  return (
    <main className="auth-page">
      <div className="auth-box">

        <div className="auth-logo">
          🎓
        </div>

        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Join Polytechnic Hub and start learning
        </p>

        <form onSubmit={handleRegister}>

          <div className="auth-field">
            <label>Name</label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          {message && (
            <p className="auth-success">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <p className="auth-register">
          Already have an account?{" "}
          <a href="/login">Login</a>
        </p>

      </div>
    </main>
  );
          }
