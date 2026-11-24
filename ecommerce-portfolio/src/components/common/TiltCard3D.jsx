import { useRef, useState, useCallback } from "react";

/**
 * Hardware-accelerated 3D Interactive Perspective Tilt Card
 * Supports cursor tracking, dynamic holographic glare, 3D layer depth (translateZ),
 * and touch-safe fallback.
 */
export default function TiltCard3D({
  children,
  className = "",
  maxTilt = 14,
  perspective = 1100,
  scale = 1.02,
  glare = true,
  onClick,
  style = {},
  ...props
}) {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState({
    transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
    transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
  });
  const [glareStyle, setGlareStyle] = useState({
    opacity: 0,
    background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2), transparent 60%)",
  });

  const handleMouseMove = useCallback(
    (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      setTransformStyle({
        transform: `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
        transition: "transform 0.1s ease-out",
      });

      if (glare) {
        setGlareStyle({
          opacity: 0.85,
          background: `radial-gradient(circle 380px at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.22) 0%, rgba(99, 102, 241, 0.15) 30%, transparent 65%)`,
        });
      }
    },
    [maxTilt, perspective, scale, glare]
  );

  const handleMouseLeave = useCallback(() => {
    setTransformStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
    });
    if (glare) {
      setGlareStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [perspective, glare]);

  return (
    <div
      ref={cardRef}
      className={`tilt-card-3d-root ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        ...style,
        ...transformStyle,
        transformStyle: "preserve-3d",
      }}
      {...props}
    >
      {children}
      {glare && (
        <div
          className="tilt-card-glare"
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            borderRadius: "inherit",
            mixBlendMode: "screen",
            transition: "opacity 0.25s ease",
            zIndex: 10,
            ...glareStyle,
          }}
        />
      )}
    </div>
  );
}
