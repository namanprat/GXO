"use client";
import "./home.css";
import "./studio/studio.css";
import { useState, useEffect, useRef, useCallback } from "react";

import DynamicBackground, {
  dynamicBgState,
} from "@/components/DynamicBackground/DynamicBackground";
import Copy from "@/components/Copy/Copy";
import WhoWeAre from "@/components/WhoWeAre/WhoWeAre";
import ProcessCards from "@/components/ProcessCards/ProcessCards";
import Testimonials from "@/components/Testimonials/Testimonials";
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

  // ponytail: one class per section via ScrollTrigger - nothing else
  useGSAP(() => {
    const nav = document.querySelector(".nav-container");
    if (!nav) return;

    const setNav = (mode) => {
      nav.classList.remove("nav-dark", "nav-white");
      nav.classList.add(mode);
    };

    setNav("nav-dark");

    // 1 hero black, 2 studio white, 3 whoweare black … testimonials dark
    const sections = [
      { trigger: ".hero", mode: "nav-dark" },
      { trigger: ".studio-header", mode: "nav-white" },
      { trigger: ".whoweare", mode: "nav-dark" },
      { trigger: ".mission-intro", mode: "nav-dark" },
      { trigger: ".testimonials", mode: "nav-dark" },
    ];

    const triggers = sections.map(({ trigger, mode }) =>
      ScrollTrigger.create({
        trigger,
        // ponytail: flip 10% early - section top hits 10% from viewport top
        start: "top 10%",
        end: "bottom 10%",
        onEnter: () => setNav(mode),
        onEnterBack: () => setNav(mode),
      })
    );

    return () => {
      triggers.forEach((t) => t.kill());
      nav.classList.remove("nav-dark", "nav-white");
    };
  });

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

    const studioHeader = document.querySelector(".studio-header");
    const accentLight = "#999136";
    const accentDark = "#2e2c10";
    let bgTween = null;

    // Body → dark accent when nav flips white (same "top 10%" as nav ScrollTrigger)
    if (studioHeader) {
      dynamicBgState.canvasBg = accentLight;
      gsap.set(document.body, { backgroundColor: accentLight });

      bgTween = ScrollTrigger.create({
        trigger: studioHeader,
        start: "top 10%",
        onEnter: () => {
          gsap.to(document.body, {
            backgroundColor: accentDark,
            duration: 0.45,
            ease: "power2.out",
            onComplete: () => {
              dynamicBgState.canvasBg = accentDark;
            },
          });
          dynamicBgState.canvasBg = accentDark;
        },
        onLeaveBack: () => {
          gsap.to(document.body, {
            backgroundColor: accentLight,
            duration: 0.45,
            ease: "power2.out",
            onComplete: () => {
              dynamicBgState.canvasBg = accentLight;
            },
          });
          dynamicBgState.canvasBg = accentLight;
        },
      });
    }

    // Hero elements fade out; opacity hits 0 at 80% of hero scroll
    const heroContent = document.querySelector(".hero-content");
    const heroParticles = document.querySelector(".hero-particles");
    const fadeTargets = [heroContent, heroParticles].filter(Boolean);
    let heroFade = null;
    if (fadeTargets.length) {
      heroFade = gsap.to(fadeTargets, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "80% top",
          scrub: true,
        },
      });
    }

    // ponytail: scale nav logo text directly - target hugs child size
    const navWordmark = document.querySelector(".nav .nav-logo-wordmark");
    const heroFooterSm = document.querySelector(".hero-footer-col-sm");
    let scaleTween = null;
    let footerFade = null;

    if (navWordmark) {
      gsap.set(navWordmark, {
        fontSize: "var(--type-display)",
        lineHeight: 1.1,
        autoAlpha: 1,
      });

      const fromSize = parseFloat(getComputedStyle(navWordmark).fontSize);
      // end size = p / body token (same as CSS default on wordmark)
      gsap.set(navWordmark, {
        fontSize: "var(--type-body)",
        lineHeight: 1.1,
      });
      const toSize = parseFloat(getComputedStyle(navWordmark).fontSize);
      gsap.set(navWordmark, { fontSize: fromSize, lineHeight: 1.1 });

      scaleTween = gsap.fromTo(
        navWordmark,
        { fontSize: fromSize, lineHeight: 1.1 },
        {
          fontSize: toSize,
          lineHeight: 1.1,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "+=55%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );

      if (heroFooterSm) {
        gsap.set(heroFooterSm, { opacity: 1 });
        footerFade = gsap.fromTo(
          heroFooterSm,
          { opacity: 1 },
          {
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "+=55%",
              scrub: true,
            },
          }
        );
      }
    }

    document.fonts?.ready?.then(() => ScrollTrigger.refresh());

    return () => {
      scaleTween?.scrollTrigger?.kill();
      scaleTween?.kill();
      footerFade?.scrollTrigger?.kill();
      footerFade?.kill();
      heroFade?.scrollTrigger?.kill();
      heroFade?.kill();
      gsap.set(fadeTargets, { clearProps: "opacity" });
      bgTween?.kill();
      gsap.set(document.body, { clearProps: "backgroundColor" });
      dynamicBgState.canvasBg = accentLight;
      if (navWordmark) {
        gsap.set(navWordmark, { clearProps: "fontSize,lineHeight" });
      }
      if (heroFooterSm) gsap.set(heroFooterSm, { clearProps: "opacity" });
    };
  }, [contentReady]);

  return (
    <>
      {showIntro && <IntroTransition onComplete={handleIntroComplete} />}

      <section className="hero">
        <DynamicBackground />

        <div className="hero-content">
          <div className="hero-headline layout-grid">
            <div className="hero-headline-left col-span-5 col-start-1">
              {contentReady ? (
                <Copy animateOnScroll={false} delay={0.15}>
                  <h1 className="hero-headline-text">
                    Transformation
                    <br />
                    you can trust,
                  </h1>
                </Copy>
              ) : (
                <h1 className="hero-headline-text" style={{ opacity: 0 }}>
                  Transformation
                  <br />
                  you can trust,
                </h1>
              )}
            </div>
            <div className="hero-headline-right col-span-5 col-start-8">
              {contentReady ? (
                <Copy animateOnScroll={false} delay={0.3}>
                  <h1 className="hero-headline-text">
                    owned from
                    <br />
                    diagnosis to revenue
                  </h1>
                </Copy>
              ) : (
                <h1 className="hero-headline-text" style={{ opacity: 0 }}>
                  owned from
                  <br />
                  diagnosis to revenue
                </h1>
              )}
            </div>
          </div>

          <div className="hero-bottom layout-grid">
            <div className="hero-bottom-left hero-link col-span-7 col-start-1">
              <span className="hero-cta-badge" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
              <a href="/contact" className="hero-cta" data-cursor="outline">
                Contact us
              </a>
            </div>

            <h5 className="hero-bottom-desc col-span-5 col-start-8">
              GXO is a single commercial transformation partner. We diagnose
              what&apos;s broken, build the systems that fix it, and stay
              accountable until revenue moves.
            </h5>
          </div>
        </div>
      </section>

      <div className="studio" ref={studioRef}>
        <section className="studio-header layout-grid" id="about">
          <div className="studio-header-copy col-span-8 col-start-3">
            {contentReady ? (
              <BlockRevealCopy
                blockColor="#999136"
                stagger={0.3}
                firstLineIndent
              >
                <h1>
                  One partner. Full system. Revenue accountability. GXO operates
                  as a single commercial transformation partner, diagnosing
                  what&apos;s broken, building the systems that fix it, and
                  staying embedded until the business moves.
                </h1>
              </BlockRevealCopy>
            ) : (
              <h2 style={{ opacity: 0 }}>
                One partner. Full system. Revenue accountability. GXO operates as
                a single commercial transformation partner, diagnosing
                what&apos;s broken, building the systems that fix it, and staying
                embedded until the business moves.
              </h2>
            )}
          </div>
        </section>

        <WhoWeAre />

        <section className="mission-intro">
          <div className="mission-intro-copy-band layout-grid">
            <div className="mission-intro-col-lg col-span-5 col-start-4">
              <div className="mission-intro-copy">
                <Copy>
                  <h1>Process</h1>
                  <div>
                    <p>
                      If any of this sounds familiar, you don&apos;t need
                      another agency. You need a system. Voice gives you the
                      words. Visibility gives you the room. Velocity gives you
                      the revenue.
                    </p>
                  </div>
                </Copy>
              </div>
            </div>
          </div>

          <div className="mission-intro-cards-band layout-grid">
            <div className="mission-intro-cards col-span-8 col-start-3">
              <ProcessCards />
            </div>
          </div>
        </section>

        <Testimonials />
      </div>
      <Footer />
    </>
  );
}
