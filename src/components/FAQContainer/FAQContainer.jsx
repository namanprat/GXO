"use client";

import { useState, useRef, useEffect } from "react";
import { HiArrowRight } from "react-icons/hi2";
import gsap from "gsap";

import { faqItems } from "@/data/faqs";
import Copy from "@/components/Copy/Copy";

import "./FAQContainer.css";

export default function FAQContainer() {
  const [activeIndices, setActiveIndices] = useState([]);
  const iconRefs = useRef([]);
  const contentRefs = useRef([]);
  const faqItemsRef = useRef([]);

  useEffect(() => {
    iconRefs.current = iconRefs.current.slice(0, faqItems.length);
    contentRefs.current = contentRefs.current.slice(0, faqItems.length);
    faqItemsRef.current = faqItemsRef.current.slice(0, faqItems.length);

    gsap.fromTo(
      faqItemsRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.1,
        delay: 0.85,
      }
    );
  }, []);

  const toggleFAQ = (index) => {
    if (activeIndices.includes(index)) {
      gsap.to(iconRefs.current[index], {
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(contentRefs.current[index], {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        paddingTop: 0,
        paddingBottom: 0,
      });

      setActiveIndices(activeIndices.filter((i) => i !== index));
    } else {
      gsap.to(iconRefs.current[index], {
        rotation: 90,
        duration: 0.3,
        ease: "power2.out",
      });

      const contentHeight = contentRefs.current[index].scrollHeight;

      gsap.to(contentRefs.current[index], {
        height: contentHeight + 24,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        paddingTop: "0.5em",
        paddingBottom: "0.5em",
      });

      setActiveIndices([...activeIndices, index]);
    }
  };

  return (
    <div className="faq-container layout-grid">
      <div className="faq-wrapper col-span-8 col-start-3">
        <div className="faq-title">
          <Copy animateOnScroll={false} delay={0.5}>
            <h2>
              Frequently <br /> Asked Questions
            </h2>
          </Copy>
        </div>

        <div className="faq-items">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="faq-item"
              ref={(el) => {
                faqItemsRef.current[index] = el;
              }}
            >
              <div
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleFAQ(index);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <h4>{item.question}</h4>
                <span
                  className="faq-icon"
                  ref={(el) => {
                    iconRefs.current[index] = el;
                  }}
                >
                  <HiArrowRight size={20} />
                </span>
              </div>
              <div
                className="faq-answer"
                ref={(el) => {
                  contentRefs.current[index] = el;
                }}
                style={{ height: 0, opacity: 0, overflow: "hidden" }}
              >
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
