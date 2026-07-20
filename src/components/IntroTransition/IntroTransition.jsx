"use client";

import { useRef } from "react";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

import "./IntroTransition.css";

gsap.registerPlugin(CustomEase);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

const ROWS = 4;
const COUNTS = ["00", "27", "65", "98", "99", "GXO Studio"];

export default function IntroTransition({ onComplete }) {
  const rootRef = useRef(null);
  const gridRef = useRef(null);
  const blocksRef = useRef([]);
  const bottomRef = useRef(null);
  const counterRef = useRef(null);
  const progressRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  useGSAP(
    () => {
      if (!rootRef.current || !gridRef.current) return;

      gsap.set(blocksRef.current, {
        scaleX: 1,
        transformOrigin: "right center",
      });
      gsap.set(bottomRef.current, {
        clipPath: "inset(0 0% 0 0)",
      });
      gsap.set(gridRef.current, { pointerEvents: "all" });

      const counts = rootRef.current.querySelectorAll(".count");
      const progressBar = progressRef.current;
      const lastIndex = counts.length - 1;

      const tl = gsap.timeline({
        delay: 0.3,
        defaults: { ease: "hop" },
      });
      const progressTl = gsap.timeline({ delay: 0.3 });

      counts.forEach((count, index) => {
        const digits = count.querySelectorAll(".digit .display");

        tl.to(
          digits,
          { y: "0%", duration: 1, stagger: 0.075 },
          index * 1
        );

        if (index < lastIndex) {
          tl.to(
            digits,
            { y: "-120%", duration: 1, stagger: 0.075 },
            index * 1 + 1
          );
        }

        progressTl.to(
          progressBar,
          {
            scaleY: (index + 1) / counts.length,
            duration: 1,
            ease: "hop",
          },
          index * 1
        );
      });

      // Hold on GXO Studio, then wipe — bottom strip clips the text
      tl.to({}, { duration: 0.45 });
      tl.add(() => {
        gsap.set(progressBar, { autoAlpha: 0 });
      });

      const upperBlocks = blocksRef.current.filter(Boolean).slice(0, -1);
      tl.to(upperBlocks, {
        scaleX: 0,
        duration: 1,
        ease: "hop",
        stagger: 0.075,
        transformOrigin: "right center",
      });
      tl.to(
        bottomRef.current,
        {
          clipPath: "inset(0 0% 0 100%)",
          duration: 1,
          ease: "hop",
          onComplete: () => {
            gsap.set(gridRef.current, { pointerEvents: "none" });
            onCompleteRef.current?.();
          },
        },
        "<+=0.225"
      );
      tl.to(
        blocksRef.current[ROWS - 1],
        {
          scaleX: 0,
          duration: 1,
          ease: "hop",
          transformOrigin: "right center",
        },
        "<"
      );

      return undefined;
    },
    { scope: rootRef }
  );

  return (
    <div className="intro-transition" ref={rootRef}>
      <div ref={gridRef} className="intro-transition-grid">
        {Array.from({ length: ROWS }).map((_, i) => {
          const isBottom = i === ROWS - 1;
          return (
            <div
              key={i}
              ref={isBottom ? bottomRef : undefined}
              className={`intro-transition-block${
                isBottom ? " intro-transition-block--bottom" : ""
              }`}
            >
              <div
                className="intro-transition-block-bg"
                ref={(el) => {
                  blocksRef.current[i] = el;
                }}
              />
              {isBottom && (
                <div className="intro-counter" ref={counterRef}>
                  {COUNTS.map((value) => {
                    const isBrand = value === "GXO Studio";
                    return (
                      <div className="count" key={value}>
                        {isBrand ? (
                          <div className="digit">
                            <h1 className="display">{value}</h1>
                          </div>
                        ) : (
                          value.split("").map((digit, di) => (
                            <div className="digit" key={`${value}-${di}`}>
                              <h1 className="display">{digit}</h1>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="intro-progress-bar" ref={progressRef} />
    </div>
  );
}
