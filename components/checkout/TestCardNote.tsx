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
    <p className="meta" style={{ color: "var(--stone)", marginTop: 28 }}>
      Test mode. Use card{" "}
      <button
        onClick={copy}
        className="meta"
        style={{
          color: "var(--stone)",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          textDecoration: "underline",
          textUnderlineOffset: 3,
          fontFamily: "inherit",
          fontSize: "inherit",
        }}
      >
        4242 4242 4242 4242
      </button>
      {copied ? " · Copied!" : " · tap to copy"}
      , any future expiry, any CVC. No real payment is taken.
    </p>
  );
}
