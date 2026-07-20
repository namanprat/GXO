"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { IoMdArrowForward } from "react-icons/io";
import "@/components/BtnLink/BtnLink.css";
import "./Footer.css";

gsap.registerPlugin(ScrollTrigger);

const ROLES = ["Client", "Partner", "Collaborator", "Press", "Other"];

const SOCIALS = [
  { label: "Email", href: "mailto:hello@gxo.studio" },
  { label: "LinkedIn", href: "#" },
  { label: "Behance", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "Vimeo", href: "#" },
];

const DELHI_COORDS = "28.6139° N, 77.2090° E";

export default function Footer() {
  const footerRef = useRef(null);
  const [role, setRole] = useState("Client");
  const pathname = usePathname();
  const isContact = pathname === "/contact";
  const lenis = useLenis();

  useGSAP(
    () => {
      const textElements = footerRef.current.querySelectorAll(".footer-text");

      textElements.forEach((element) => {
        const textContent = element.querySelector(".footer-text-content");
        gsap.set(textContent, {
          y: "100%",
        });
      });

      ScrollTrigger.create({
        trigger: footerRef.current,
        start: "top 80%",
        onEnter: () => {
          textElements.forEach((element, index) => {
            const textContent = element.querySelector(".footer-text-content");
            gsap.to(textContent, {
              y: "0%",
              duration: 0.8,
              delay: index * 0.1,
              ease: "power3.out",
            });
          });
        },
      });
    },
    { scope: footerRef }
  );

  const scrollToTop = (e) => {
    e.preventDefault();
    lenis?.scrollTo(0, { duration: 1.2 });
  };

  return (
    <footer className="footer" ref={footerRef}>
      <div className="footer-main">
        <div className="footer-socials">
          <div className="fs-col-lg">
            <form
              className="footer-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="footer-form-roles">
                <h5 className="footer-form-label">I&apos;m a [select one]</h5>
                <div className="footer-form-role-list" role="listbox">
                  {ROLES.map((item) => {
                    const active = role === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`footer-form-role${
                          active ? " is-active" : ""
                        }`}
                        onClick={() => setRole(item)}
                      >
                        {active && <span className="footer-form-role-dot" />}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="footer-form-section">
                <h5 className="footer-form-section-title">About you</h5>
                <div className="footer-form-grid">
                  <label className="footer-field">
                    <input
                      type="text"
                      placeholder="First name"
                      name="firstName"
                    />
                  </label>
                  <label className="footer-field">
                    <input
                      type="text"
                      placeholder="Last name"
                      name="lastName"
                    />
                  </label>
                  <label className="footer-field">
                    <input type="email" placeholder="Email" name="email" />
                  </label>
                  <label className="footer-field">
                    <input type="tel" placeholder="Phone" name="phone" />
                  </label>
                </div>
              </div>

              <div className="footer-form-section">
                <h5 className="footer-form-section-title">Your project</h5>
                <div className="footer-form-stack">
                  <label className="footer-field">
                    <input
                      type="text"
                      placeholder="Company / project name"
                      name="company"
                    />
                  </label>
                  <label className="footer-field">
                    <input
                      type="text"
                      placeholder="Type of project"
                      name="projectType"
                    />
                  </label>
                  <label className="footer-field footer-field-textarea">
                    <textarea
                      placeholder="Message (Optional)"
                      name="message"
                      rows={3}
                    />
                  </label>
                </div>
              </div>

              <label className="footer-form-consent">
                <input type="checkbox" name="privacy" />
                <h5>
                  By checking this box I agree to the{" "}
                  <a href="/faq">Privacy Policy</a>
                </h5>
              </label>

              <button type="submit" className="link-dark">
                <div className="anime-link anime-link-dark">
                  <div className="anime-link-label">
                    <h5>
                      <span>Send Message</span>
                    </h5>
                  </div>
                  <div className="anime-link-icon">
                    <IoMdArrowForward color="#fff" />
                  </div>
                </div>
              </button>
            </form>
          </div>

          <div className="fs-col-sm">
            <div className="fs-header">
              <div className="footer-text">
                <div className="footer-text-content">
                  <p className="caps">( Socials )</p>
                </div>
              </div>
            </div>
            {SOCIALS.map((social) => (
              <div className="footer-social" key={social.label}>
                <a
                  href={social.href}
                  target={
                    social.href.startsWith("http") ? "_blank" : undefined
                  }
                  rel={
                    social.href.startsWith("http") ? "noreferrer" : undefined
                  }
                >
                  <div className="footer-text">
                    <div className="footer-text-content">
                      <h2>{social.label}</h2>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-copy">
        <div className="fc-col-lg">
          <div className="footer-text">
            <div className="footer-text-content">
              {isContact ? (
                <p className="caps">{DELHI_COORDS}</p>
              ) : (
                <button
                  type="button"
                  className="footer-scroll-top caps"
                  onClick={scrollToTop}
                >
                  Back to top
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="fc-col-sm">
          <div className="footer-text">
            <div className="footer-text-content">
              <p className="caps">&copy; 2025 GXO All Rights Reserved</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
