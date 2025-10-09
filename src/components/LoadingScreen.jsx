import React, { useEffect, useState } from "react";

const LoadingScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (progress >= 100) {
      // Hide with fadeout before calling onFinish
      const timeout = setTimeout(() => {
        setHidden(true);
        if (onFinish) onFinish();
      }, 1000); // match CSS transition duration
      return () => clearTimeout(timeout);
    }

    // Increment progress smoothly
    const interval = setInterval(() => {
      setProgress((old) => {
        const inc = Math.random() * 3 + 1;
        let next = old + inc;
        if (next > 100) next = 100;
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [progress, onFinish]);

  return (
    <>
      {/* SVG Filters for water distortion */}
      <svg
        id="svg-filters"
        style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
        aria-hidden="true"
      >
        <defs>
          <filter id="water-distortion" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              id="turbulence"
              baseFrequency="0.015 0.01"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
          </filter>
        </defs>
      </svg>

      <div
        className={`loader${hidden ? " hidden" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "black",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          opacity: hidden ? 0 : 1,
          transition: "opacity 1s ease-out",
        }}
        aria-live="polite"
        aria-busy={progress < 100}
      >
        <div
          className="progress-percentage"
          style={{
            fontSize: "2rem",
            fontWeight: 600,
            color: "#fff0b3",
            marginBottom: 10,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            filter: "url(#water-distortion)",
            willChange: "filter",
            userSelect: "none",
          }}
        >
          {Math.floor(progress)}%
        </div>

        <div
          className="progress-container"
          style={{
            width: 300,
            height: 4,
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: 2,
            overflow: "hidden",
            marginBottom: 30,
          }}
        >
          <div
            className="progress-bar"
            style={{
              width: `${progress}%`,
              height: "100%",
              background:
                "linear-gradient(90deg, #ff6b35, #f7931e, #ffcc02)",
              borderRadius: 2,
              transition: "width 0.1s ease-out",
            }}
          ></div>
        </div>

        <div
          className="loading-text"
          style={{
            fontSize: "1rem",
            color: "rgba(255, 240, 179, 0.7)",
            fontWeight: 300,
            textAlign: "center",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            userSelect: "none",
            maxWidth: 320,
            padding: "0 10px",
          }}
        >
          Loading a beautiful experience for you
        </div>
      </div>
    </>
  );
};

export default LoadingScreen;