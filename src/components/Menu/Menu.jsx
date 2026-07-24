"use client";
import "./Menu.css";
import { useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import { useTransitionRouter } from "next-view-transitions";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";
import { slideInOut } from "@/lib/pageTransition";

gsap.registerPlugin(CustomEase);
CustomEase.create("hop", ".15, 1, .25, 1");

// ponytail: hashes → home section ids; FAQ/Contact are pages
export const NAV_LINKS = [
  { label: "About", path: "/#about" },
  { label: "Process", path: "/#values" },
  { label: "Proof", path: "/#testimonials" },
  { label: "FAQ's", path: "/faq" },
];

export const OVERLAY_LINKS = [
  ...NAV_LINKS,
  { label: "Contact", path: "/contact" },
];

const Menu = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const pathname = usePathname();
  const router = useTransitionRouter();
  const lenis = useLenis();

  const menuRef = useRef(null);
  const navRef = useRef(null);
  const menuOverlayRef = useRef(null);

  const navLogoRef = useRef(null);
  const menuBtnRef = useRef(null);

  const closeBtnRef = useRef(null);

  const menuItemsRef = useRef(null);
  const menuFooterColsRef = useRef(null);

  // ponytail: home starts display-size; page scrub shrinks to p; other pages p
  useEffect(() => {
    const el = document.querySelector(".nav .nav-logo-wordmark");
    if (!el) return;
    if (pathname === "/") {
      gsap.set(el, {
        fontSize: "var(--type-display)",
        lineHeight: 1.1,
        autoAlpha: 1,
      });
    } else {
      gsap.set(el, {
        fontSize: "var(--type-body)",
        lineHeight: 1.1,
        autoAlpha: 1,
      });
    }
  }, [pathname]);

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

  const goTo = (path) => {
    if (path.startsWith("/#")) {
      const id = path.slice(2);
      if (pathname === "/") {
        const el = document.getElementById(id);
        if (el) lenis?.scrollTo(el, { duration: 1.2 });
        return;
      }
      router.push(`/#${id}`, { onTransitionReady: slideInOut });
      return;
    }
    if (isExactPath(path)) return;
    router.push(path, { onTransitionReady: slideInOut });
  };

  const navigateTo = (path) => {
    if (isAnimating) return;
    closeMenu();
    setTimeout(() => goTo(path), 0);
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
        <div className="nav layout-grid" ref={navRef}>
          <div className="nav-logo col-span-7 col-start-1">
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
                <span className="nav-logo-target">
                  <span className="nav-logo-wordmark">GXO Studio</span>
                </span>
              </a>
            </div>
          </div>
          <div className="nav-items col-span-5 col-start-8">
            <nav className="nav-links" aria-label="Primary">
              {NAV_LINKS.map(({ label, path }) => (
                <div className="revealer" key={path}>
                  <a
                    href={path}
                    className="nav-link"
                    data-cursor="fill"
                    onClick={(e) => {
                      e.preventDefault();
                      goTo(path);
                    }}
                  >
                    {label}
                  </a>
                </div>
              ))}
            </nav>

            <div className="revealer nav-contact">
              <a
                href="/contact"
                className="nav-link"
                data-cursor="fill"
                onClick={(e) => {
                  e.preventDefault();
                  goTo("/contact");
                }}
              >
                Contact
              </a>
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
          <div className="menu-overlay-nav layout-grid">
            <div className="menu-overlay-nav-logo col-span-7 col-start-1">
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
            <div className="menu-overlay-nav-items col-span-5 col-start-8">
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
            {OVERLAY_LINKS.map(({ label, path }) => (
              <div className="revealer" key={path}>
                <a
                  href={path}
                  data-cursor="fill"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(path);
                  }}
                >
                  <h1 className="display">{label}</h1>
                </a>
              </div>
            ))}
          </div>
          <div className="menu-footer layout-grid" ref={menuFooterColsRef}>
            <div className="menu-footer-col col-span-7 col-start-1">
              <div className="revealer">
                <p className="caps">&copy; 2025 All Rights Reserved</p>
              </div>
            </div>
            <div className="menu-footer-col col-span-5 col-start-8">
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
                    LinkedIn
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
