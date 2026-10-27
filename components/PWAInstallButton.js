"use client";

import { useState } from "react";
import { usePWAInstall } from "./usePWAInstall";

export default function PWAInstallButton({ variant = "header" }) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already opened as an installed PWA standalone app, suppress the button
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  const isHero = variant === "hero";

  return (
    <>
      <button
        onClick={handleClick}
        className={isHero ? "pwa-hero-install-btn" : "pwa-header-install-btn"}
        title="Install Polytechnic Hub App"
        aria-label="Install App"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: "inline-block", verticalAlign: "middle" }}
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>{isHero ? "Install App on Device" : "Install"}</span>
      </button>

      {showGuide && (
        <div
          className="pwa-modal-overlay"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="pwa-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pwa-modal-header">
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "#1687ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  flexShrink: 0,
                }}
              >
                🎓
              </div>
              <div>
                <h3>Install Polytechnic Hub</h3>
                <p>Add to your home screen for fast, offline access</p>
              </div>
            </div>

            <div className="pwa-modal-body">
              {isIOS ? (
                <ol className="pwa-steps">
                  <li>
                    Tap the <strong>Share</strong> button (box with upward arrow) in Safari.
                  </li>
                  <li>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </li>
                  <li>
                    Tap <strong>Add</strong> in the top-right corner.
                  </li>
                </ol>
              ) : (
                <ol className="pwa-steps">
                  <li>
                    In your browser menu (⋮) or address bar, look for the <strong>Install</strong> or <strong>Add to Home Screen</strong> icon.
                  </li>
                  <li>
                    Click <strong>Install</strong> to install Polytechnic Hub as a standalone application.
                  </li>
                  <li>
                    Access study notes, PYQ, and lectures anytime directly from your home screen or app drawer!
                  </li>
                </ol>
              )}
            </div>

            <div className="pwa-modal-footer">
              <button
                className="pwa-modal-close-btn"
                onClick={() => setShowGuide(false)}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
