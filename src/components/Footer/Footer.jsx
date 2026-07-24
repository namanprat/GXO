"use client";

import { useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ContactBox from "@/components/ContactBox/ContactBox";
import "./Footer.css";

gsap.registerPlugin(ScrollTrigger);

const SOCIALS = [
  { label: "Email", href: "mailto:hello@gxostudio.com" },
  { label: "LinkedIn", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "YouTube", href: "#" },
];

const FOOTER_NAV = [
  { label: "About", href: "/#about" },
  { label: "Process", href: "/#values" },
  { label: "Proof", href: "/#testimonials" },
  { label: "FAQ's", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  const footerRef = useRef(null);

  useGSAP(
    () => {
      const textElements = footerRef.current.querySelectorAll(".footer-text");

      textElements.forEach((element) => {
        const textContent = element.querySelector(".footer-text-content");
        gsap.set(textContent, { y: "100%" });
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
              delay: index * 0.05,
              ease: "power3.out",
            });
          });
        },
      });
    },
    { scope: footerRef }
  );

  return (
    <footer className="footer" ref={footerRef}>
      <div className="footer-child">
        <div className="footer-panel layout-grid">
          <div className="footer-form col-span-6 col-start-1">
            <ContactBox />
          </div>

          <div className="footer-links col-span-4 col-start-8">
            <div className="footer-col footer-col-nav">
              <div className="footer-text">
                <div className="footer-text-content">
                  <h5 className="footer-col-label">( Links )</h5>
                </div>
              </div>
              {FOOTER_NAV.map((item) => (
                <div className="footer-text" key={item.label}>
                  <div className="footer-text-content">
                    <a href={item.href} data-cursor="fill">
                      <h3 className="footer-link-title">{item.label}</h3>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="footer-col footer-col-socials">
              <div className="footer-text">
                <div className="footer-text-content">
                  <h5 className="footer-col-label">( Socials )</h5>
                </div>
              </div>
              {SOCIALS.map((social) => (
                <div className="footer-text" key={social.label}>
                  <div className="footer-text-content">
                    <a
                      href={social.href}
                      data-cursor="fill"
                      target={
                        social.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        social.href.startsWith("http")
                          ? "noreferrer"
                          : undefined
                      }
                    >
                      <h3 className="footer-link-title">{social.label}</h3>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
