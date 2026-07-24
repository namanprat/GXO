"use client";

import { useState } from "react";
import { IoMdArrowForward } from "react-icons/io";
import "@/components/BtnLink/BtnLink.css";
import "./ContactBox.css";

const ROLES = ["Client", "Partner", "Collaborator", "Press", "Other"];

function Field({
  label,
  name,
  type = "text",
  as: Tag = "input",
  className = "",
  ...rest
}) {
  return (
    <label
      className={`contact-box-field${className ? ` ${className}` : ""}`}
    >
      <Tag
        name={name}
        type={Tag === "input" ? type : undefined}
        placeholder={label}
        aria-label={label}
        {...rest}
      />
    </label>
  );
}

export default function ContactBox() {
  const [role, setRole] = useState("Client");

  return (
    <form className="contact-box" onSubmit={(e) => e.preventDefault()}>
      <div className="contact-box-roles">
        <h5 className="contact-box-label">I&apos;m a [select one]</h5>
        <div className="contact-box-role-list" role="listbox">
          {ROLES.map((item) => {
            const active = role === item;
            return (
              <button
                key={item}
                type="button"
                role="option"
                aria-selected={active}
                className={`contact-box-role${active ? " is-active" : ""}`}
                onClick={() => setRole(item)}
              >
                {active && <span className="contact-box-role-dot" />}
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="contact-box-section">
        <h5 className="contact-box-section-title">About you</h5>
        <div className="contact-box-grid">
          <Field label="First name" name="firstName" />
          <Field label="Last name" name="lastName" />
          <Field label="Email" name="email" type="email" />
          <Field label="Phone" name="phone" type="tel" />
        </div>
      </div>

      <div className="contact-box-section">
        <h5 className="contact-box-section-title">Your project</h5>
        <div className="contact-box-stack">
          <Field label="Company / project name" name="company" />
          <Field label="Type of project" name="projectType" />
          <Field
            label="Message (Optional)"
            name="message"
            as="textarea"
            rows={3}
            className="contact-box-field-textarea"
          />
        </div>
      </div>

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
  );
}
