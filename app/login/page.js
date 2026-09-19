"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
  };

  return (
    <main className="auth-page">

      <div className="auth-box">

        <div className="auth-logo">
          🎓
        </div>

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Login to continue learning
        </p>

        <form onSubmit={handleLogin}>

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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-button">
            Login
          </button>

        </form>

        <p className="auth-register">
          Don't have an account?{" "}
          <a href="/register">Register</a>
        </p>

      </div>

    </main>
  );
    }
