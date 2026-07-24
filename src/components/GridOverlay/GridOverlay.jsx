"use client";

import { useEffect, useRef } from "react";

const STORAGE_KEY = "gxo-grid-visible";
const COL_COUNT = 12;

function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

function isGridVisible() {
  return document.documentElement.classList.contains("grid-visible");
}

function setGridVisible(visible, overlay) {
  document.documentElement.classList.toggle("grid-visible", visible);

  if (overlay) {
    overlay.setAttribute("aria-hidden", visible ? "false" : "true");
    if (visible) {
      overlay.style.minHeight = `${window.innerHeight}px`;
    } else {
      overlay.style.removeProperty("min-height");
    }
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, visible ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export default function GridOverlay() {
  const overlayRef = useRef(null);

  useEffect(() => {
    const overlay = overlayRef.current;

    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setGridVisible(true, overlay);
      }
    } catch {
      /* ignore */
    }

    const onKeydown = (event) => {
      if (event.code !== "KeyG" || !event.shiftKey) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;

      event.preventDefault();
      event.stopPropagation();
      setGridVisible(!isGridVisible(), overlayRef.current);
    };

    const onResize = () => {
      if (!isGridVisible()) return;
      const el = overlayRef.current;
      if (el) el.style.minHeight = `${window.innerHeight}px`;
    };

    document.addEventListener("keydown", onKeydown, true);
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("keydown", onKeydown, true);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      <div
        id="grid-overlay"
        className="grid-overlay"
        ref={overlayRef}
        aria-hidden="true"
      >
        {Array.from({ length: COL_COUNT }, (_, i) => (
          <div className="grid-overlay__col" key={i} />
        ))}
      </div>
      <div className="grid-indicator" aria-hidden="true">
        GRID
      </div>
    </>
  );
}
