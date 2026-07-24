"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import "./BlockRevealCopy.css";

gsap.registerPlugin(SplitText, ScrollTrigger);

const FIRST_LINE_INDENT = "var(--first-line-indent)";

export default function BlockRevealCopy({
  children,
  animateOnScroll = true,
  delay = 0,
  blockColor = "#2e2c10",
  stagger = 0.15,
  duration = 0.75,
  firstLineIndent = false,
}) {
  const containerRef = useRef(null);
  const splitRefs = useRef([]);
  const lines = useRef([]);
  const blocks = useRef([]);
  const triggers = useRef([]);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      let cancelled = false;
      // once revealed, re-splits (on resize) must NOT re-hide / re-animate
      let revealed = false;
      let lastWidth = 0;

      const createBlockRevealAnimation = (block, line, index) => {
        const tl = gsap.timeline({ delay: delay + index * stagger, paused: true });
        tl.to(block, { scaleX: 1, duration, ease: "power4.inOut" });
        tl.set(line, { opacity: 1 });
        tl.set(block, { transformOrigin: "right center" });
        tl.to(block, { scaleX: 0, duration, ease: "power4.inOut" });
        return tl;
      };

      // unwrap + revert the previous split so we can re-split cleanly
      const teardown = () => {
        triggers.current.forEach((st) => st.kill());
        triggers.current = [];
        splitRefs.current.forEach((s) => s?.revert());
        splitRefs.current = [];
        container.querySelectorAll(".block-line-wrapper").forEach((w) => {
          if (w.parentNode && w.firstChild) {
            w.parentNode.insertBefore(w.firstChild, w);
            w.remove();
          }
        });
      };

      // split at the CURRENT width, wrap each line in a mask, arm the reveal
      const build = () => {
        lines.current = [];
        blocks.current = [];

        const elements = container.hasAttribute("data-copy-wrapper")
          ? Array.from(container.children)
          : [container];

        elements.forEach((element) => {
          // temporary indent so the browser wraps with a shorter first line
          if (firstLineIndent) element.style.textIndent = FIRST_LINE_INDENT;

          const split = SplitText.create(element, {
            type: "lines",
            linesClass: "block-line++",
            lineThreshold: 0.1,
          });
          splitRefs.current.push(split);

          if (firstLineIndent) element.style.textIndent = "0";

          split.lines.forEach((line, lineIndex) => {
            const wrapper = document.createElement("div");
            wrapper.className = "block-line-wrapper";
            line.parentNode.insertBefore(wrapper, line);
            wrapper.appendChild(line);

            if (firstLineIndent) {
              line.style.textIndent = "0";
              if (lineIndex === 0) wrapper.style.paddingLeft = FIRST_LINE_INDENT;
            }

            const block = document.createElement("div");
            block.className = "block-revealer";
            block.style.backgroundColor = blockColor;
            wrapper.appendChild(block);

            lines.current.push(line);
            blocks.current.push(block);
          });
        });

        // already revealed (re-split after resize): just show, no animation
        if (revealed) {
          gsap.set(lines.current, { opacity: 1 });
          gsap.set(blocks.current, { scaleX: 0 });
          return;
        }

        gsap.set(lines.current, { opacity: 0 });
        gsap.set(blocks.current, { scaleX: 0, transformOrigin: "left center" });

        blocks.current.forEach((block, index) => {
          const tl = createBlockRevealAnimation(block, lines.current[index], index);
          if (animateOnScroll) {
            triggers.current.push(
              ScrollTrigger.create({
                trigger: container,
                start: "top 70%",
                once: true,
                onEnter: () => {
                  revealed = true;
                  tl.play(0);
                },
              })
            );
          } else {
            revealed = true;
            tl.play(0);
          }
        });
      };

      const resplit = () => {
        if (cancelled || !container) return;
        teardown();
        build();
        lastWidth = container.getBoundingClientRect().width;
        ScrollTrigger.refresh();
      };

      let raf = 0;
      let ro;

      const start = async () => {
        try {
          await document.fonts.ready;
        } catch {
          /* proceed */
        }
        if (cancelled || !container) return;

        resplit();

        // re-split whenever the container's width changes (scrollbar / late
        // layout / Lenis / actual resize) — the split is width-dependent.
        ro = new ResizeObserver(() => {
          const w = container.getBoundingClientRect().width;
          if (Math.abs(w - lastWidth) < 1) return;
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(resplit);
        });
        ro.observe(container);
      };

      start();

      return () => {
        cancelled = true;
        cancelAnimationFrame(raf);
        ro?.disconnect();
        teardown();
      };
    },
    {
      scope: containerRef,
      dependencies: [
        animateOnScroll,
        delay,
        blockColor,
        stagger,
        duration,
        firstLineIndent,
      ],
    }
  );

  if (React.Children.count(children) === 1) {
    return React.cloneElement(children, { ref: containerRef });
  }

  return (
    <div ref={containerRef} data-copy-wrapper="true">
      {children}
    </div>
  );
}
