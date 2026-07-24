"use client";

import "./Testimonials.css";
import { useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { TESTIMONIALS } from "@/data/testimonials";

gsap.registerPlugin(Draggable, InertiaPlugin, SplitText);

const ArrowIcon = ({ next = false }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="10"
    viewBox="0 0 17 12"
    fill="none"
    className={`testimonials__btn-arrow${next ? " next" : ""}`}
    aria-hidden="true"
  >
    <path
      d="M6.28871 12L7.53907 10.9111L3.48697 6.77778H16.5V5.22222H3.48697L7.53907 1.08889L6.28871 0L0.5 6L6.28871 12Z"
      fill="currentColor"
    />
  </svg>
);

export default function Testimonials() {
  const sectionRef = useRef(null);
  const quoteRef = useRef(null);
  const attrRef = useRef(null);
  const mediaRef = useRef(null);
  const progressRef = useRef(null);
  const splitRef = useRef(null);
  const animatingRef = useRef(false);
  const indexRef = useRef(0);

  const [index, setIndex] = useState(0);
  const total = TESTIMONIALS.length;
  const item = TESTIMONIALS[index];

  const setProgress = useCallback(
    (i, animate) => {
      const fill = progressRef.current;
      if (!fill) return;
      const pct = ((i + 1) / total) * 100;
      if (animate) {
        gsap.to(fill, { width: `${pct}%`, duration: 0.45, ease: "power3.out" });
      } else {
        gsap.set(fill, { width: `${pct}%` });
      }
    },
    [total]
  );

  const applySplit = useCallback(async (text, animateIn) => {
    const quoteEl = quoteRef.current;
    if (!quoteEl) return;

    if (splitRef.current) {
      splitRef.current.revert();
      splitRef.current = null;
    }

    quoteEl.textContent = `\u201C${text}\u201D`;
    try {
      await document.fonts.ready;
    } catch {
      /* continue */
    }
    if (!quoteEl.isConnected) return;

    const split = SplitText.create(quoteEl, {
      type: "lines",
      mask: "lines",
      linesClass: "t-line++",
    });
    splitRef.current = split;

    if (animateIn) {
      gsap.set(split.lines, { yPercent: 100 });
      await gsap.to(split.lines, {
        yPercent: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: "power4.out",
      });
    } else {
      gsap.set(split.lines, { yPercent: 0 });
    }
  }, []);

  const goTo = useCallback(
    async (nextIndex, direction = 1) => {
      if (animatingRef.current) return;
      const wrapped = ((nextIndex % total) + total) % total;
      if (wrapped === indexRef.current) return;

      animatingRef.current = true;
      const outLines = splitRef.current?.lines
        ? [...splitRef.current.lines]
        : [];

      if (outLines.length) {
        await gsap.to(outLines, {
          yPercent: direction > 0 ? -100 : 100,
          duration: 0.45,
          stagger: 0.04,
          ease: "power3.in",
        });
      }

      const fadeTargets = [attrRef.current, mediaRef.current].filter(Boolean);
      if (fadeTargets.length) {
        await gsap.to(fadeTargets, { autoAlpha: 0, duration: 0.2 });
      }

      indexRef.current = wrapped;
      setIndex(wrapped);
      setProgress(wrapped, true);
      await applySplit(TESTIMONIALS[wrapped].quote, true);

      if (fadeTargets.length) {
        gsap.to(fadeTargets, { autoAlpha: 1, duration: 0.35 });
      }

      animatingRef.current = false;
    },
    [applySplit, setProgress, total]
  );

  useGSAP(
    () => {
      indexRef.current = 0;
      setProgress(0, false);
      applySplit(TESTIMONIALS[0].quote, false);
      return () => {
        if (splitRef.current) {
          splitRef.current.revert();
          splitRef.current = null;
        }
      };
    },
    { scope: sectionRef }
  );

  useGSAP(
    () => {
      const dragArea = sectionRef.current?.querySelector(
        "[data-testimonial-drag]"
      );
      if (!dragArea) return;

      const proxy = document.createElement("div");
      let pressX = 0;
      const [drag] = Draggable.create(proxy, {
        trigger: dragArea,
        type: "x",
        inertia: true,
        dragClickables: false,
        onPressInit() {
          pressX = this.x;
        },
        onDragEnd() {
          const dx = this.x - pressX;
          if (Math.abs(dx) < 50) return;
          if (dx < 0) goTo(indexRef.current + 1, 1);
          else goTo(indexRef.current - 1, -1);
        },
        onThrowComplete() {
          gsap.set(proxy, { x: 0 });
        },
        onRelease() {
          if (!this.isThrowing) gsap.set(proxy, { x: 0 });
        },
      });

      return () => drag?.kill();
    },
    { scope: sectionRef, dependencies: [goTo] }
  );

  const stepLabel = index + 1 < 10 ? `0${index + 1}` : String(index + 1);
  const totalLabel = total < 10 ? `0${total}` : String(total);
  const marker = `(${index + 1})`;

  return (
    <section
      className="testimonials layout-grid"
      id="testimonials"
      ref={sectionRef}
    >
      <div className="testimonials__title col-span-11 col-start-1">
        <h1>
          GXO is shaped by the belief that commercial clarity comes from
          deliberate systems, not more noise.
        </h1>
      </div>

      <h5 className="testimonials__count col-span-2 col-start-1">
        {stepLabel} / {totalLabel}
      </h5>

      <div
        className="testimonials__progress col-span-12"
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label="Testimonial progress"
      >
        <span className="testimonials__progress-fill" ref={progressRef} />
      </div>

      <div className="testimonials__nav col-span-2 col-start-1">
        <button
          type="button"
          aria-label="previous testimonial"
          className="testimonials__btn"
          onClick={() => goTo(indexRef.current - 1, -1)}
        >
          <ArrowIcon />
        </button>
        <button
          type="button"
          aria-label="next testimonial"
          className="testimonials__btn"
          onClick={() => goTo(indexRef.current + 1, 1)}
        >
          <ArrowIcon next />
        </button>
      </div>

      <div
        className="testimonials__body col-span-12"
        data-testimonial-drag
        data-lenis-prevent
      >
        <div className="testimonials__body-grid layout-grid">
          <div className="testimonials__rail col-span-1 col-start-1">
            <p className="testimonials__marker">{marker}</p>
            <span className="testimonials__dot" aria-hidden="true" />
          </div>

          <div
            className="testimonials__media col-span-2 col-start-4"
            ref={mediaRef}
          >
            <img
              src={item.avatar}
              alt={item.name}
              className="testimonials__portrait"
              width={320}
              height={400}
            />
          </div>

          <div className="testimonials__quote-col col-span-6 col-start-4">
            <p className="testimonials__quote" ref={quoteRef} />
            <div className="testimonials__attr" ref={attrRef}>
              <p className="testimonials__name">
                {item.name}{" "}
                <span className="testimonials__company">({item.company})</span>
              </p>
            </div>
          </div>

          <p className="testimonials__year col-span-1 col-start-12">
            {item.year}
          </p>
        </div>
      </div>

      <div className="testimonials__cta-row col-span-12">
        <div className="testimonials__cta-grid layout-grid">
          <a
            href="/contact"
            className="testimonials__cta col-span-6 col-start-4"
            data-cursor="fill"
          >
            Engage the System →
          </a>
        </div>
      </div>
    </section>
  );
}
