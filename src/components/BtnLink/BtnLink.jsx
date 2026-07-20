"use client";
import { useTransitionRouter } from "next-view-transitions";
import { IoMdArrowForward } from "react-icons/io";

import { slideInOut } from "@/lib/pageTransition";
import "./BtnLink.css";

const BtnLink = ({ label, route, dark = false }) => {
  const router = useTransitionRouter();

  const handleClick = (e) => {
    e.preventDefault();
    router.push(route, {
      onTransitionReady: slideInOut,
    });
  };

  return (
    <a
      className={dark ? "link-dark" : "link-light"}
      href={route}
      onClick={handleClick}
    >
      <div
        className={`anime-link ${
          dark ? "anime-link-dark" : "anime-link-light"
        }`}
      >
        <div className="anime-link-label">
          <p>
            <span>{label}</span>
          </p>
        </div>
        <div className="anime-link-icon">
          <IoMdArrowForward color={dark ? "#fff" : "#000"} />
        </div>
      </div>
    </a>
  );
};

export default BtnLink;
