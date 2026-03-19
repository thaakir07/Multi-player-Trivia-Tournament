// RoundOverlay.tsx
import React, { useEffect, useState } from "react";

interface RoundOverlayProps {
  roundNumber: number;
  category: any;
  show: boolean;
  duration?: number; // milliseconds
  onHide?: () => void;
}

const RoundOverlay: React.FC<RoundOverlayProps> = ({
  roundNumber,
  category,
  show,
  duration = 2000,
  onHide,
}) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    if (show) {
      const timer = setTimeout(() => {
        setVisible(false);
        onHide && onHide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onHide]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        pointerEvents: "none",
        animation: `fadeSlide ${duration}ms ease-in-out`,
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

          @keyframes fadeSlide {
            0% {
              opacity: 0;
              transform: translateY(30px);
            }
            15% {
              opacity: 1;
              transform: translateY(0);
            }
            85% {
              opacity: 1;
              transform: translateY(0);
            }
            100% {
              opacity: 0;
              transform: translateY(-30px);
            }
          }
        `}
      </style>
      <div
        style={{
          color: "#fff",
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "1.5rem",
          textAlign: "center",
          textShadow: "2px 2px 8px #000",
        }}
      >
        ROUND {roundNumber}  
        <br />
        {category?.name?.toUpperCase() ?? ""}
      </div>
    </div>
  );
};

export default RoundOverlay;
