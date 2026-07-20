"use client";
import "./Menu.css";
import { useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import { useTransitionRouter } from "next-view-transitions";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";
import { slideInOut } from "@/lib/pageTransition";

gsap.registerPlugin(CustomEase);
CustomEase.create("hop", ".15, 1, .25, 1");

const Menu = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const pathname = usePathname();
  const router = useTransitionRouter();

  const menuRef = useRef(null);
  const navRef = useRef(null);
  const menuOverlayRef = useRef(null);

  const navLogoRef = useRef(null);
  const menuBtnRef = useRef(null);

  const closeBtnRef = useRef(null);

  const menuItemsRef = useRef(null);
  const menuFooterColsRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now
        .toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
        .toUpperCase();
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useGSAP(
    () => {
      gsap.set(menuOverlayRef.current, {
        opacity: 0,
        pointerEvents: "none",
      });

      gsap.set(closeBtnRef.current, {
        y: "100%",
      });

      gsap.set(".menu-overlay-items .revealer a", {
        y: "100%",
      });

      gsap.set(".menu-footer .revealer p, .menu-footer .revealer a", {
        y: "100%",
      });
    },
    { scope: menuRef }
  );

  const isExactPath = (path) => pathname === path;

  const navigateTo = (path) => {
    if (isAnimating) return;

    if (isExactPath(path)) {
      closeMenu();
      return;
    }

    closeMenu();

    setTimeout(() => {
      router.push(path, {
        onTransitionReady: slideInOut,
      });
    }, 0);
  };

  const openMenu = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false),
    });

    tl.to(menuBtnRef.current, {
      y: "-100%",
      duration: 0.5,
      ease: "power3.out",
      onComplete: () => {
        navRef.current.style.pointerEvents = "none";
        gsap.set(menuBtnRef.current, { y: "100%" });
      },
    });

    tl.to(
      menuOverlayRef.current,
      {
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
        onStart: () => {
          menuOverlayRef.current.style.pointerEvents = "all";
        },
      },
      "-=0.45"
    );

    tl.to(
      closeBtnRef.current,
      {
        y: "0%",
        duration: 1,
        ease: "power3.out",
      },
      "-=0.5"
    );

    tl.to(
      ".menu-overlay-items .revealer a",
      {
        y: "0%",
        duration: 1,
        stagger: 0.075,
        ease: "power3.out",
      },
      "<"
    );

    tl.to(
      ".menu-footer .revealer p, .menu-footer .revealer a",
      {
        y: "0%",
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.5,
      },
      "<"
    );
  };

  const closeMenu = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false),
    });

    tl.to(closeBtnRef.current, {
      y: "-100%",
      duration: 0.5,
      ease: "power3.out",
    });

    tl.to(
      ".menu-overlay-items .revealer a",
      {
        y: "-100%",
        duration: 0.5,
        stagger: 0.05,
        ease: "power3.in",
      },
      "<"
    );

    tl.to(
      ".menu-footer .revealer p, .menu-footer .revealer a",
      {
        y: "-100%",
        duration: 0.5,
        stagger: 0.05,
        ease: "power3.in",
      },
      "<"
    );

    tl.to(
      menuOverlayRef.current,
      {
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
        onComplete: () => {
          menuOverlayRef.current.style.pointerEvents = "none";

          gsap.set(closeBtnRef.current, {
            y: "100%",
          });

          gsap.set(".menu-overlay-items .revealer a", {
            y: "100%",
          });

          gsap.set(".menu-footer .revealer p, .menu-footer .revealer a", {
            y: "100%",
          });
        },
      },
      "+=0.1"
    );

    tl.to(
      menuBtnRef.current,
      {
        y: "0%",
        duration: 0.5,
        ease: "power3.out",
        onStart: () => {
          navRef.current.style.pointerEvents = "all";
        },
      },
      "-=0.45"
    );
  };

  return (
    <>
      <div className="nav-container">
        <div className="nav" ref={navRef}>
          <div className="nav-logo">
            <div className="revealer">
              <a
                href="/"
                ref={navLogoRef}
                onClick={(e) => {
                  e.preventDefault();
                  if (isExactPath("/")) return;

                  router.push("/", {
                    onTransitionReady: slideInOut,
                  });
                }}
              >
                <span className="nav-logo-target" aria-hidden="true">
                  GXO Studio
                </span>
                <span className="nav-logo-wordmark">GXO Studio</span>
              </a>
            </div>
          </div>
          <div className="nav-items">
            <div className="nav-menu-time">
              <div className="revealer">
                <p className="caps">{currentTime}</p>
              </div>
            </div>

            <div className="nav-menu-toggle-open">
              <div className="revealer" onClick={openMenu}>
                <p className="caps" ref={menuBtnRef}>
                  Menu
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="menu" ref={menuRef}>
        <div className="menu-overlay" ref={menuOverlayRef}>
          <div className="menu-overlay-nav">
            <div className="menu-overlay-nav-logo">
              <div className="revealer">
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo("/");
                  }}
                >
                <span className="nav-logo-wordmark">GXO Studio</span>
                </a>
              </div>
            </div>
            <div className="menu-overlay-nav-items">
              <div className="menu-overlay-nav-time">
                <div className="revealer">
                  <p className="caps">{currentTime}</p>
                </div>
              </div>
              <div className="menu-overlay-nav-toggle-close">
                <div className="revealer" onClick={closeMenu}>
                  <p className="caps" ref={closeBtnRef}>
                    Close
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="menu-overlay-items" ref={menuItemsRef}>
            <div className="revealer">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo("/");
                }}
              >
                <h1 className="display">Index</h1>
              </a>
            </div>
            <div className="revealer">
              <a
                href="/work"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo("/work");
                }}
              >
                <h1 className="display">Work</h1>
              </a>
            </div>
            <div className="revealer">
              <a
                href="/faq"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo("/faq");
                }}
              >
                <h1 className="display">FAQ</h1>
              </a>
            </div>
            <div className="revealer">
              <a
                href="/contact"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo("/contact");
                }}
              >
                <h1 className="display">Contact</h1>
              </a>
            </div>
          </div>
          <div className="menu-footer" ref={menuFooterColsRef}>
            <div className="menu-footer-col">
              <div className="revealer">
                <p className="caps">&copy; 2025 All Rights Reserved</p>
              </div>
            </div>
            <div className="menu-footer-col">
              <div className="socials">
                <div className="revealer">
                  <a className="caps" href="#">
                    YouTube
                  </a>
                </div>
                <div className="revealer">
                  <a className="caps" href="#">
                    Instagram
                  </a>
                </div>
                <div className="revealer">
                  <a className="caps" href="#">
                    X
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Menu;
