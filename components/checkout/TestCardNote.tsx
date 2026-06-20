"use client";
import { useState } from "react";

export function TestCardNote() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText("4242 4242 4242 4242");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      style={{
        border: "1px solid var(--stone)",
        borderRadius: 3,
        padding: "max(12px, 1.2vw)",
        background: "rgba(var(--matcha-rgb), 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "max(8px, 0.7vw)",
      }}
    >
      <p
        className="meta"
        style={{
          color: "var(--stone)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontSize: "max(10px, 0.65vw)",
          marginBottom: 2,
        }}
      >
        Sandbox mode
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "max(5px, 0.5vw)" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "max(8px, 0.8vw)" }}>
          <span className="meta" style={{ color: "var(--matcha)", minWidth: "max(40px, 3.5vw)" }}>Card</span>
          <button
            onClick={copy}
            className="meta"
            style={{
              color: "var(--ink)",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: 3,
              fontFamily: "inherit",
              letterSpacing: "0.04em",
            }}
          >
            4242 4242 4242 4242
          </button>
          <span className="meta" style={{ color: "var(--stone)" }}>
            {copied ? "· Copied!" : "· tap to copy"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: "max(8px, 0.8vw)" }}>
          <span className="meta" style={{ color: "var(--matcha)", minWidth: "max(40px, 3.5vw)" }}>Expiry</span>
          <span className="meta" style={{ color: "var(--ink)" }}>Any future date</span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: "max(8px, 0.8vw)" }}>
          <span className="meta" style={{ color: "var(--matcha)", minWidth: "max(40px, 3.5vw)" }}>CVC</span>
          <span className="meta" style={{ color: "var(--ink)" }}>Any 3 digits</span>
        </div>
      </div>

      <p className="meta" style={{ color: "var(--stone)", marginTop: 2 }}>
        No real payment taken.
      </p>
    </div>
  );
}
