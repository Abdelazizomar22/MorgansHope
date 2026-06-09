"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WarningGraphicProps {
  /** Width of the graphic */
  width?: number;
  /** Height of the graphic */  
  height?: number;
  /** Additional CSS classes */
  className?: string;
  /** Control animation enable/disable */
  enableAnimations?: boolean;
  /** Animation speed multiplier */
  animationSpeed?: number;
  /** Color override for all elements */
  color?: string;
}

export function WarningGraphic({
  width = 354, // Default 2x size of original 176.958
  height = 115, // Default 2x size of original 57.531
  className,
  enableAnimations = true,
  animationSpeed = 1,
  color = "#FDC221",
}: WarningGraphicProps = {}) {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !shouldReduceMotion;
  const speedMultiplier = 1 / animationSpeed;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(!shouldAnimate);

  useEffect(() => {
    if (!shouldAnimate) return;
    const el = wrapperRef.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight) {
      setShow(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldAnimate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldAnimate ? 0.15 * speedMultiplier : 0,
        delayChildren: shouldAnimate ? 0.1 * speedMultiplier : 0,
      },
    },
  };

  // First: Path lines (corner/background elements) draw from inside out
  const pathLineVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0.3, // Keep opacity constant for visibility
    },
    visible: {
      pathLength: 1,
      opacity: 0.3,
      transition: {
        pathLength: { duration: 1.2 * speedMultiplier, ease: "easeOut" },
        delay: shouldAnimate ? 0.0 : 0,
      },
    },
  };

  // Second: Triangle outline draws
  const triangleVariants = {
    hidden: {
      opacity: 0,
      pathLength: 0,
    },
    visible: {
      opacity: 1,
      pathLength: 1,
      transition: {
        pathLength: { duration: 0.8 * speedMultiplier, ease: "easeOut" },
        opacity: { duration: 0.3 * speedMultiplier },
        delay: shouldAnimate ? 0.6 * speedMultiplier : 0,
      },
    },
  };

  // Corner rectangles - fade in last
  const elementVariants = {
    hidden: {
      opacity: 0,
      scale: 0.5,
      y: 10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25,
        delay: shouldAnimate ? 2.5 * speedMultiplier : 0, // Fade in last
      },
    },
  };

  // Third: Interior stripes animate from center outward
  const leftStripeVariants = {
    hidden: {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "right center", // Scale from right (center) going left
    },
    visible: {
      opacity: 1,
      scaleX: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 30,
        delay: shouldAnimate ? 1.4 * speedMultiplier : 0,
      },
    },
  };

  const rightStripeVariants = {
    hidden: {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center", // Scale from left (center) going right
    },
    visible: {
      opacity: 1,
      scaleX: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 30,
        delay: shouldAnimate ? 1.4 * speedMultiplier : 0,
      },
    },
  };

  const stripesContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldAnimate ? 0.08 * speedMultiplier : 0,
        delayChildren: shouldAnimate ? 1.4 * speedMultiplier : 0,
      },
    },
  };

  // Fourth: Exclamation with overshoot
  const exclamationVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
    },
    visible: {
      opacity: 1,
      scale: [0, 1.3, 1], // Overshoot: 0 -> 1.3 -> 1
      transition: {
        type: "spring" as const,
        stiffness: 500,
        damping: 20,
        scale: {
          times: [0, 0.6, 1],
          duration: 0.6 * speedMultiplier,
        },
        delay: shouldAnimate ? 2.0 * speedMultiplier : 0,
      },
    },
  };

    return (
    <div ref={wrapperRef} style={{ width, height: height || 115 }}>
      {show && (
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 176.958 57.531"
        className={cn("", className)}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.g>
          {/* Corner rectangles */}
          <motion.rect
            y="25.128"
            width="0.538"
            height="0.538"
            transform="translate(-25.128 25.666) rotate(-90)"
            fill={color}
            variants={elementVariants}
          />
          <motion.rect
            y="22.449"
            width="0.538"
            height="0.538"
            transform="translate(-22.449 22.987) rotate(-90)"
            fill={color}
            variants={elementVariants}
          />
          <motion.rect
            x="176.42"
            y="25.128"
            width="0.538"
            height="0.538"
            transform="translate(151.292 202.086) rotate(-90)"
            fill={color}
            variants={elementVariants}
          />
          <motion.rect
            x="176.42"
            y="22.449"
            width="0.538"
            height="0.538"
            transform="translate(153.971 199.408) rotate(-90)"
            fill={color}
            variants={elementVariants}
          />

          {/* First: Background/corner path lines draw from inside out */}
          <motion.g variants={containerVariants}>
            <motion.path
              d="M25.949,24.432H5.565a.375.375,0,0,1,0-.75H25.52l8.068-13.7H59.015a.375.375,0,0,1,0,.75h-25Z"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              strokeLinecap="round"
              variants={pathLineVariants}
            />
            <motion.path
              d="M171.393,24.432H151.009l-8.068-13.7h-25a.375.375,0,0,1,0-.75H143.37l8.068,13.7h19.955a.375.375,0,0,1,0,.75Z"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              strokeLinecap="round"
              variants={pathLineVariants}
            />
            <motion.path
              d="M57.3,57.531a.375.375,0,0,1-.321-.182L47.147,41.043H18.507l-7.71-7.71H7.66a.375.375,0,1,1,0-.75h3.448l7.709,7.71H47.571L57.623,56.962a.376.376,0,0,1-.127.515A.382.382,0,0,1,57.3,57.531Z"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              strokeLinecap="round"
              variants={pathLineVariants}
            />
            <motion.path
              d="M119.656,57.531a.376.376,0,0,1-.321-.569l10.052-16.669h28.754l7.709-7.71H169.3a.375.375,0,0,1,0,.75h-3.137l-7.71,7.71h-28.64l-9.833,16.306A.377.377,0,0,1,119.656,57.531Z"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              strokeLinecap="round"
              variants={pathLineVariants}
            />
          </motion.g>

          {/* Second: Main warning triangle outline draws */}
          <motion.path
            d="M93.582,1l26.746,46.327-5.1,8.828H61.737L56.63,47.326,83.377,1h10.2m.577-1H82.8L55.475,47.327l5.685,9.828h54.648l5.675-9.828L94.159,0Z"
            fill={color}
            variants={triangleVariants}
          />

          {/* Third: Interior stripes animate from center outward */}
          <motion.g variants={stripesContainerVariants}>
            {/* Left side stripes (animate from center going left) */}
            <motion.polygon
              points="51.838 37.309 61.852 37.309 75.448 13.85 65.434 13.85 51.838 37.309"
              fill={color}
              variants={leftStripeVariants}
            />
            <motion.polygon
              points="37.422 37.309 47.436 37.309 61.033 13.85 51.019 13.85 37.422 37.309"
              fill={color}
              variants={leftStripeVariants}
            />
            <motion.polygon
              points="23.007 37.309 33.021 37.309 46.617 13.85 36.603 13.85 23.007 37.309"
              fill={color}
              variants={leftStripeVariants}
            />

            {/* Right side stripes (animate from center going right) */}
            <motion.polygon
              points="125.121 37.309 115.107 37.309 101.51 13.85 111.524 13.85 125.121 37.309"
              fill={color}
              variants={rightStripeVariants}
            />
            <motion.polygon
              points="139.536 37.309 129.522 37.309 115.926 13.85 125.94 13.85 139.536 37.309"
              fill={color}
              variants={rightStripeVariants}
            />
            <motion.polygon
              points="153.951 37.309 143.937 37.309 130.341 13.85 140.355 13.85 153.951 37.309"
              fill={color}
              variants={rightStripeVariants}
            />
          </motion.g>

          {/* Fourth: Exclamation mark */}
          <motion.text
            x="88"
            y="32"
            textAnchor="middle"
            dominantBaseline="central"
            fill={color}
            fontSize="40"
            fontWeight="900"
            fontFamily="sans-serif"
            variants={exclamationVariants}
          >!</motion.text>
        </motion.g>
      </motion.svg>
      )}
    </div>
  );
}
