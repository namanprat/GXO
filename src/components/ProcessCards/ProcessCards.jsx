"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ProcessCards.css";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  {
    index: "1",
    title: "Diagnose",
    subtitle: "Find the real blockers",
    description:
      "We find what's really stopping growth across brand, GTM, sales, pricing, talent and operations. Every gap and data blind spot gets surfaced and named, not glossed over. You leave with a clear picture of what to fix first.",
  },
  {
    index: "2",
    title: "Build",
    subtitle: "Create the commercial system",
    description:
      "We build the commercial system your growth actually needs. Positioning, campaigns, CRM, dashboards and team structure come together as one coherent architecture. Execution systems replace guesswork with repeatable, measurable process.",
  },
  {
    index: "3",
    title: "Orchestrate",
    subtitle: "Own execution",
    description:
      "We own execution and keep every partner and channel pointed at a single revenue outcome. Delivery is managed end to end, not handed off and hoped on. We stay embedded and accountable until the numbers actually move.",
  },
];

const STACK_X = ["100%", "0%", "-100%"];
const STACK_ROTATE = [-5, 0, 5];
const DESKTOP_MQ = "(min-width: 750px)";

const smoothStep = (p) => p * p * (3 - 2 * p);

function subscribeDesktop(callback) {
  const mq = window.matchMedia(DESKTOP_MQ);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getDesktopSnapshot() {
  return window.matchMedia(DESKTOP_MQ).matches;
}

function getDesktopServerSnapshot() {
  return false;
}

function Badge({ n }) {
  return <span className="process-card-badge">{n}</span>;
}

export default function ProcessCards() {
  const rootRef = useRef(null);
  const [flipped, setFlipped] = useState(() => new Set());
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    getDesktopSnapshot,
    getDesktopServerSnapshot
  );

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const cards = gsap.utils.toArray(".process-card", root);
      const inners = cards.map((card) =>
        card.querySelector(".process-card-inner")
      );
      const section = root.closest(".mission-intro");
      if (!section || cards.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(
        `${DESKTOP_MQ} and (prefers-reduced-motion: reduce)`,
        () => {
          cards.forEach((card, index) => {
            gsap.set(card, { x: 0, rotate: 0, zIndex: 1 });
            gsap.set(inners[index], { rotationY: 180 });
          });
          return () => {
            cards.forEach((card, index) => {
              gsap.set(card, { clearProps: "x,rotate,zIndex" });
              gsap.set(inners[index], { clearProps: "rotationY" });
            });
          };
        }
      );

      mm.add(
        `${DESKTOP_MQ} and (prefers-reduced-motion: no-preference)`,
        () => {
          cards.forEach((card, index) => {
            gsap.set(card, {
              x: STACK_X[index],
              rotate: STACK_ROTATE[index],
              zIndex: cards.length - index,
            });
            gsap.set(inners[index], { rotationY: 0 });
          });

          const trigger = ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight * 2}`,
            pin: true,
            pinSpacing: true,
            scrub: 1,
            anticipatePin: 0.5,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const progress = self.progress;

              cards.forEach((card, index) => {
                const delay = index * 0.5;
                const cardProgress = gsap.utils.clamp(
                  0,
                  1,
                  (progress - delay * 0.1) / (0.9 - delay * 0.1)
                );
                const t = smoothStep(cardProgress);

                gsap.set(card, {
                  x: gsap.utils.interpolate(STACK_X[index], "0%", t),
                  rotate: gsap.utils.interpolate(STACK_ROTATE[index], 0, t),
                });
                gsap.set(inners[index], {
                  rotationY: t * 180,
                });
              });
            },
          });

          ScrollTrigger.refresh();

          return () => {
            trigger.kill();
            cards.forEach((card, index) => {
              gsap.set(card, { clearProps: "x,rotate,zIndex" });
              gsap.set(inners[index], { clearProps: "rotationY" });
            });
          };
        }
      );

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  const toggle = (i) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const onCardKeyDown = (e, i) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(i);
    }
  };

  return (
    <div className="process-cards" id="values" ref={rootRef}>
      {CARDS.map((card, i) => {
        const isFlipped = flipped.has(i);
        return (
          <div
            key={card.title}
            className={`process-card${isFlipped && !isDesktop ? " is-flipped" : ""}`}
            role={isDesktop ? undefined : "button"}
            tabIndex={isDesktop ? undefined : 0}
            aria-pressed={isDesktop ? undefined : isFlipped}
            aria-label={
              isDesktop
                ? `${card.title} process card`
                : `${card.title} card. ${isFlipped ? "Showing details" : "Showing title"}. Click to flip.`
            }
            onClick={isDesktop ? undefined : () => toggle(i)}
            onKeyDown={isDesktop ? undefined : (e) => onCardKeyDown(e, i)}
          >
            <div className="process-card-inner">
              <div className="process-card-face process-card-back">
                <div className="process-card-back-row">
                  <h2>{card.title}</h2>
                  <Badge n={card.index} />
                </div>
                <div className="process-card-back-row process-card-back-row-end">
                  <Badge n={card.index} />
                  <h2>{card.title}</h2>
                </div>
              </div>

              <div className="process-card-face process-card-front">
                <div className="process-card-front-head">
                  <div className="process-card-front-copy">
                    <h2>{card.title}</h2>
                    <p>{card.subtitle}</p>
                  </div>
                  <Badge n={card.index} />
                </div>
                <hr className="process-card-rule" />
                <p>{card.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
