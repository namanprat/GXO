"use client";

import Menu from "@/components/Menu/Menu";
import GrainOverlay from "@/components/GrainOverlay/GrainOverlay";
import Cursor from "@/components/Cursor/Cursor";
import GridOverlay from "@/components/GridOverlay/GridOverlay";

import { ReactLenis } from "lenis/react";

const scrollSettings = {
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothTouch: false,
  touchMultiplier: 2,
  lerp: 0.1,
};

export default function ClientLayout({ children }) {
  return (
    <ReactLenis root options={scrollSettings}>
      <>
        <Menu />
        <GrainOverlay />
        <Cursor />
        <GridOverlay />
      </>
      {children}
    </ReactLenis>
  );
}
