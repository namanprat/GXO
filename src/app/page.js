"use client";
import "./home.css";
import "./studio/studio.css";
import { useState, useEffect, useRef, useCallback } from "react";

import DynamicBackground, {
  dynamicBgState,
} from "@/components/DynamicBackground/DynamicBackground";
import Copy from "@/components/Copy/Copy";
import BtnLink from "@/components/BtnLink/BtnLink";
import WhoWeAre from "@/components/WhoWeAre/WhoWeAre";
import ProcessCards from "@/components/ProcessCards/ProcessCards";
import Footer from "@/components/Footer/Footer";
import IntroTransition from "@/components/IntroTransition/IntroTransition";
import BlockRevealCopy from "@/components/BlockRevealCopy/BlockRevealCopy";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let isInitialLoad = true;

export default function Home() {
  const [showIntro, setShowIntro] = useState(isInitialLoad);
  const [contentReady, setContentReady] = useState(!isInitialLoad);
  const studioRef = useRef(null);

  useEffect(() => {
    return () => {
      isInitialLoad = false;
    };
  }, []);

  const handleIntroComplete = useCallback(() => {
    setContentReady(true);
    setShowIntro(false);
  }, []);

  useGSAP(() => {
    if (!contentReady) return;

    const heroLink = document.querySelector(".hero-link");
    if (heroLink) {
      gsap.fromTo(
        heroLink,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.15, ease: "power4.out" }
      );
    }

    const hero = document.querySelector(".hero");
    const studioHeader = document.querySelector(".studio-header");
    const navContainer = document.querySelector(".nav-container");
    const accentLight = "#999136";
    const accentDark = "#2e2c10";
    let bgTween = null;
    let bgProgress = 0;
    let forceNavBlack = false;
    let forceNavWhite = false;

    const syncNavColor = () => {
      if (!navContainer) return;
      let useDark = bgProgress < 0.5;
      if (forceNavBlack) useDark = true;
      if (forceNavWhite) useDark = false;
      navContainer.classList.toggle("is-dark", useDark);
      document
        .querySelector(".hero-wordmark")
        ?.classList.toggle("is-light", !useDark);
    };

    if (hero && studioHeader) {
      dynamicBgState.canvasBg = accentLight;

      bgTween = gsap.fromTo(
        [hero, studioHeader],
        { backgroundColor: accentLight },
        {
          backgroundColor: accentDark,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            endTrigger: studioHeader,
            end: "top 20%",
            scrub: true,
            onUpdate: (self) => {
              bgProgress = self.progress;
              syncNavColor();

              // keep canvas clear in sync (hex only — DynamicBackground hexToRgb)
              const t = self.progress;
              const a = { r: 0x99, g: 0x91, b: 0x36 };
              const b = { r: 0x2e, g: 0x2c, b: 0x10 };
              const r = Math.round(a.r + (b.r - a.r) * t);
              const g = Math.round(a.g + (b.g - a.g) * t);
              const bl = Math.round(a.b + (b.b - a.b) * t);
              dynamicBgState.canvasBg = `#${[r, g, bl]
                .map((n) => n.toString(16).padStart(2, "0"))
                .join("")}`;
            },
          },
        }
      );
    }

    const whoWeAreNav = ScrollTrigger.create({
      trigger: ".whoweare",
      start: "top 7.5%",
      onEnter: () => {
        forceNavBlack = true;
        syncNavColor();
      },
      onEnterBack: () => {
        forceNavBlack = true;
        syncNavColor();
      },
      onLeaveBack: () => {
        forceNavBlack = false;
        syncNavColor();
      },
    });

    const recognitionNav = ScrollTrigger.create({
      trigger: ".recognition",
      start: "top top",
      end: "bottom top",
      onEnter: () => {
        forceNavWhite = true;
        syncNavColor();
      },
      onEnterBack: () => {
        forceNavWhite = true;
        syncNavColor();
      },
      onLeave: () => {
        forceNavWhite = false;
        syncNavColor();
      },
      onLeaveBack: () => {
        forceNavWhite = false;
        syncNavColor();
      },
    });

    syncNavColor();

    // ponytail: one scrubbed tween, fontSize + x/y — no spacer / manual lerp
    const wordmark = document.querySelector(".hero-wordmark");
    const slot = document.querySelector(".nav .nav-logo-target");
    const navWordmark = document.querySelector(".nav .nav-logo-wordmark");
    if (!wordmark || !slot || !navWordmark) {
      return () => {
        bgTween?.scrollTrigger?.kill();
        bgTween?.kill();
        whoWeAreNav.kill();
        recognitionNav.kill();
        navContainer?.classList.remove("is-dark");
        document.querySelector(".hero-wordmark")?.classList.remove("is-light");
        dynamicBgState.canvasBg = accentLight;
      };
    }

    let from = { left: 0, top: 0, fontSize: 0 };

    const measure = () => {
      gsap.set(wordmark, {
        clearProps: "position,left,top,x,y,fontSize,width,transform,opacity",
      });
      const a = wordmark.getBoundingClientRect();
      const heroTop =
        document.querySelector(".hero")?.getBoundingClientRect().top ?? 0;
      from = {
        left: a.left,
        top: a.top - heroTop,
        fontSize: parseFloat(getComputedStyle(wordmark).fontSize),
      };
    };

    gsap.set(navWordmark, { autoAlpha: 0 });
    measure();

    const st = ScrollTrigger.create({
      trigger: ".hero",
      start: "top top",
      end: "+=55%",
      scrub: true,
      invalidateOnRefresh: true,
      onRefresh: measure,
      onUpdate: ({ progress }) => {
        if (progress <= 0) {
          gsap.set(wordmark, {
            clearProps:
              "position,left,top,x,y,fontSize,width,transform,opacity",
          });
          gsap.set(navWordmark, { autoAlpha: 0 });
          return;
        }

        const p = progress;
        const to = slot.getBoundingClientRect();
        const toSize = parseFloat(getComputedStyle(slot).fontSize);

        gsap.set(wordmark, {
          position: "fixed",
          left: from.left + (to.left - from.left) * p,
          top: from.top + (to.top - from.top) * p,
          fontSize: from.fontSize + (toSize - from.fontSize) * p,
          width: "auto",
          x: 0,
          y: 0,
          autoAlpha: progress > 0.96 ? 0 : 1,
          zIndex: 1001,
        });
        gsap.set(navWordmark, { autoAlpha: progress > 0.96 ? 1 : 0 });
      },
    });

    document.fonts?.ready?.then(() => ScrollTrigger.refresh());

    return () => {
      st.kill();
      bgTween?.scrollTrigger?.kill();
      bgTween?.kill();
      whoWeAreNav.kill();
      recognitionNav.kill();
      navContainer?.classList.remove("is-dark");
      wordmark.classList.remove("is-light");
      dynamicBgState.canvasBg = accentLight;
      gsap.set(wordmark, { clearProps: "all" });
      gsap.set(navWordmark, { autoAlpha: 1 });
    };
  }, [contentReady]);

  useGSAP(() => {
    if (!studioRef.current) return;

    const missionLinkWrapper = studioRef.current.querySelector(".mission-link");

    if (missionLinkWrapper) {
      gsap.set(missionLinkWrapper, { y: 30, opacity: 0 });

      ScrollTrigger.create({
        trigger: missionLinkWrapper.closest(".mission-intro-copy"),
        start: "top 75%",
        once: true,
        onEnter: () => {
          gsap.to(missionLinkWrapper, {
            y: 0,
            opacity: 1,
            duration: 1,
            delay: 1.2,
            ease: "power3.out",
          });
        },
      });
    }
  });

  return (
    <>
      {showIntro && <IntroTransition onComplete={handleIntroComplete} />}

      <section className="hero">
        <DynamicBackground />

        <div className="hero-content">
          <div className="hero-header">
            <div className="hero-header-col-lg"></div>
            <div className="hero-header-col-sm">
              {contentReady ? (
                <Copy animateOnScroll={false} delay={0.15}>
                  <h3>
                    Systems thinking and creative execution brought into web
                    development for consistent outcomes.
                  </h3>
                </Copy>
              ) : (
                <h3 style={{ opacity: 0 }}>
                  Systems thinking and creative execution brought into web
                  development for consistent outcomes.
                </h3>
              )}
            </div>
          </div>

          <div className="hero-footer">
            <div className="hero-footer-col-lg">
              <h1 className="display hero-wordmark">GXO Studio</h1>
            </div>
            <div className="hero-footer-col-sm">
              <div className="hero-tags">
                {contentReady ? (
                  <Copy animateOnScroll={false} delay={0.15}>
                    <p className="caps">Web Systems</p>
                    <p className="caps">Interface Design</p>
                    <p className="caps">Creative Development</p>
                    <p className="caps">End to End Delivery</p>
                  </Copy>
                ) : (
                  <>
                    <p className="caps" style={{ opacity: 0 }}>
                      Web Systems
                    </p>
                    <p className="caps" style={{ opacity: 0 }}>
                      Interface Design
                    </p>
                    <p className="caps" style={{ opacity: 0 }}>
                      Creative Development
                    </p>
                    <p className="caps" style={{ opacity: 0 }}>
                      End to End Delivery
                    </p>
                  </>
                )}
              </div>

              <div className="hero-link">
                <BtnLink route="/contact" label="contact" dark />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="studio" ref={studioRef}>
        <section className="studio-header">
          <div className="studio-header-copy">
            {contentReady ? (
              <BlockRevealCopy blockColor="#999136" stagger={0.3}>
                <h2>
                  At GXO Studio, we approach every project with quiet focus.
                  Through close collaboration and considered process, we build
                  digital work that reflects both the needs of our clients and
                  the values of our practice.
                </h2>
              </BlockRevealCopy>
            ) : (
              <h2 style={{ opacity: 0 }}>
                At GXO Studio, we approach every project with quiet focus.
                Through close collaboration and considered process, we build
                digital work that reflects both the needs of our clients and the
                values of our practice.
              </h2>
            )}
          </div>
        </section>

        <WhoWeAre />

        <section className="mission-intro">
          <div className="mission-intro-col-sm"></div>
          <div className="mission-intro-col-lg">
            <div className="mission-intro-copy">
              <Copy>
                <h3>
                  We are a digital studio dedicated to creating clear and
                  purposeful online experiences. Our work is rooted in
                  structure, guided by systems, and shaped through close
                  collaboration.
                </h3>
                <br />
                <h3>
                  With a focus on design and development, we build scalable
                  solutions that reflect quiet precision and long-term value.
                  Every project is an exercise in restraint, intention, and
                  technical care.
                </h3>
              </Copy>

              <div className="mission-link">
                <BtnLink route="/work" label="View Work" dark />
              </div>
            </div>
          </div>
        </section>

        <ProcessCards />

        <section className="recognition">
          <div className="recognition-copy">
            <p className="caps">(Recognition)</p>
            {contentReady ? (
              <BlockRevealCopy blockColor="#999136" stagger={0.3}>
                <h2>
                  Our work has been recognized by digital platforms and design
                  communities for its clarity, consistency, and attention to
                  detail. We focus on building systems that go beyond visuals
                  experiences.
                </h2>
              </BlockRevealCopy>
            ) : (
              <h2 style={{ opacity: 0 }}>
                Our work has been recognized by digital platforms and design
                communities for its clarity, consistency, and attention to
                detail. We focus on building systems that go beyond visuals
                experiences.
              </h2>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
