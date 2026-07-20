"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import "./BlockRevealCopy.css";

gsap.registerPlugin(SplitText, ScrollTrigger);

export default function BlockRevealCopy({
  children,
  animateOnScroll = true,
  delay = 0,
  blockColor = "#2e2c10",
  stagger = 0.15,
  duration = 0.75,
}) {
  const containerRef = useRef(null);
  const splitRefs = useRef([]);
  const lines = useRef([]);
  const blocks = useRef([]);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      let cancelled = false;

      const init = async () => {
        try {
          await document.fonts.ready;
        } catch {
          /* proceed */
        }
        if (cancelled || !containerRef.current) return;

        splitRefs.current = [];
        lines.current = [];
        blocks.current = [];

        let elements = [];
        if (containerRef.current.hasAttribute("data-copy-wrapper")) {
          elements = Array.from(containerRef.current.children);
        } else {
          elements = [containerRef.current];
        }

        elements.forEach((element) => {
          const split = SplitText.create(element, {
            type: "lines",
            linesClass: "block-line++",
            lineThreshold: 0.1,
          });

          splitRefs.current.push(split);

          split.lines.forEach((line) => {
            const wrapper = document.createElement("div");
            wrapper.className = "block-line-wrapper";
            line.parentNode.insertBefore(wrapper, line);
            wrapper.appendChild(line);

            const block = document.createElement("div");
            block.className = "block-revealer";
            block.style.backgroundColor = blockColor;
            wrapper.appendChild(block);

            lines.current.push(line);
            blocks.current.push(block);
          });
        });

        gsap.set(lines.current, { opacity: 0 });
        gsap.set(blocks.current, { scaleX: 0, transformOrigin: "left center" });

        const createBlockRevealAnimation = (block, line, index) => {
          const tl = gsap.timeline({
            delay: delay + index * stagger,
            paused: true,
          });

          tl.to(block, {
            scaleX: 1,
            duration: duration,
            ease: "power4.inOut",
          });
          tl.set(line, { opacity: 1 });
          tl.set(block, { transformOrigin: "right center" });
          tl.to(block, {
            scaleX: 0,
            duration: duration,
            ease: "power4.inOut",
          });

          return tl;
        };

        const resetReveal = (block, line, tl) => {
          tl.pause(0);
          gsap.set(line, { opacity: 0 });
          gsap.set(block, { scaleX: 0, transformOrigin: "left center" });
        };

        if (animateOnScroll) {
          blocks.current.forEach((block, index) => {
            const tl = createBlockRevealAnimation(
              block,
              lines.current[index],
              index
            );

            ScrollTrigger.create({
              trigger: containerRef.current,
              start: "top 70%",
              end: "bottom top",
              onEnter: () => {
                resetReveal(block, lines.current[index], tl);
                tl.play(0);
              },
              onEnterBack: () => {
                resetReveal(block, lines.current[index], tl);
                tl.play(0);
              },
              onLeave: () => {
                resetReveal(block, lines.current[index], tl);
              },
              onLeaveBack: () => {
                resetReveal(block, lines.current[index], tl);
              },
            });
          });
        } else {
          blocks.current.forEach((block, index) => {
            const tl = createBlockRevealAnimation(
              block,
              lines.current[index],
              index
            );
            tl.play(0);
          });
        }

        ScrollTrigger.refresh();
      };

      init();

      return () => {
        cancelled = true;
        splitRefs.current.forEach((split) => split?.revert());

        const wrappers = containerRef.current?.querySelectorAll(
          ".block-line-wrapper"
        );
        wrappers?.forEach((wrapper) => {
          if (wrapper.parentNode && wrapper.firstChild) {
            wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
            wrapper.remove();
          }
        });
      };
    },
    {
      scope: containerRef,
      dependencies: [animateOnScroll, delay, blockColor, stagger, duration],
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
