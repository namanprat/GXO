"use client";

import "./Cursor.css";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const MAGNET_STRENGTH = 0.3;

export default function Cursor() {
  const cursorRef = useRef(null);

  useGSAP(
    () => {
      const el = cursorRef.current;
      if (!el) return;

      gsap.set(el, { xPercent: -50, yPercent: -50 });

      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });

      const onMove = (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };
      window.addEventListener("mousemove", onMove);

      // magnetic + dot-hide on CTA hover (delegated, survives route changes)
      let active = null; // { cta, xTo, yTo }

      const onOver = (e) => {
        const cta = e.target.closest?.("[data-cursor]");
        if (!cta || (active && active.cta === cta)) return;
        active = {
          cta,
          xTo: gsap.quickTo(cta, "x", { duration: 0.4, ease: "power3" }),
          yTo: gsap.quickTo(cta, "y", { duration: 0.4, ease: "power3" }),
        };
        gsap.to(el, { scale: 0, duration: 0.3, ease: "power3" });
      };

      const onCtaMove = (e) => {
        if (!active) return;
        const r = active.cta.getBoundingClientRect();
        active.xTo((e.clientX - (r.left + r.width / 2)) * MAGNET_STRENGTH);
        active.yTo((e.clientY - (r.top + r.height / 2)) * MAGNET_STRENGTH);
      };

      const onOut = (e) => {
        if (!active) return;
        // ignore moves within the same CTA (pointerout bubbles from children)
        if (e.relatedTarget && active.cta.contains(e.relatedTarget)) return;
        gsap.to(active.cta, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
        gsap.to(el, { scale: 1, duration: 0.3, ease: "power3" });
        active = null;
      };

      window.addEventListener("pointerover", onOver);
      window.addEventListener("pointermove", onCtaMove);
      window.addEventListener("pointerout", onOut);

      return () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("pointerover", onOver);
        window.removeEventListener("pointermove", onCtaMove);
        window.removeEventListener("pointerout", onOut);
      };
    },
    { scope: cursorRef }
  );

  return <div className="cursor" aria-hidden="true" ref={cursorRef} />;
}
