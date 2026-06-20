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
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <p
        className="meta"
        style={{
          color: "var(--stone)",
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          fontSize: "max(9px, 0.6vw)",
          marginBottom: 6,
        }}
      >
        Test mode
      </p>

      <p className="meta" style={{ color: "var(--stone)" }}>Card number</p>
      <button
        onClick={copy}
        className="meta"
        style={{
          display: "block",
          textAlign: "left",
          color: "var(--stone)",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          textDecoration: "underline",
          textUnderlineOffset: 3,
          fontFamily: "inherit",
          fontSize: "inherit",
          letterSpacing: "0.06em",
        }}
      >
        4242 4242 4242 4242
      </button>
      <p className="meta" style={{ color: "var(--stone)", opacity: 0.7, fontSize: "0.85em" }}>
        {copied ? "Copied!" : "tap to copy"}
      </p>

      <p className="meta" style={{ color: "var(--stone)", marginTop: 8 }}>Expiry</p>
      <p className="meta" style={{ color: "var(--stone)" }}>Any future date</p>

      <p className="meta" style={{ color: "var(--stone)", marginTop: 8 }}>CVC</p>
      <p className="meta" style={{ color: "var(--stone)" }}>Any 3 digits</p>

      <p className="meta" style={{ color: "var(--stone)", marginTop: 12, opacity: 0.6 }}>
        No real payment taken.
      </p>
    </div>
  );
}
