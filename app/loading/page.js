"use client";

import { useEffect } from "react";

export default function LoadingPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/semester";
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="loading-page">
      <div className="loading-box">
        <div className="loading-spinner"></div>

        <h1>Loading...</h1>

        <p>
          Preparing your learning experience
        </p>
      </div>
    </main>
  );
    }
