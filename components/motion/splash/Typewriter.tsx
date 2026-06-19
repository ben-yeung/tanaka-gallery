"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { isFreshLoad } from "./splashGate";
import { TYPE_CHAR, TYPE_CHAR_DUR, TYPE_SENTENCE_GAP, REDUCED_DUR } from "./timing";

type TypewriterProps = {
  // One entry per sentence; rendered space-joined, typed sentence-by-sentence.
  sentences: string[];
  delay?: number;
  className?: string;
};

// Visually hidden but read by assistive tech: the animated glyphs below are split
// per-character (and aria-hidden), so we expose the whole line once, here.
const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

// A single typed glyph: snaps in (opacity, linear) on its scheduled beat. whiteSpace:pre
// keeps lone spaces from collapsing so the inter-word/-sentence gaps still render.
function Glyph({ ch, delay }: { ch: string; delay: number }) {
  return (
    <motion.span
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: TYPE_CHAR_DUR, ease: "linear", delay }}
      style={{ whiteSpace: "pre" }}
    >
      {ch}
    </motion.span>
  );
}

// Reveals text as if typed: each glyph appears in sequence, with an extra pause between
// sentences. Gated on the splash (static text on client navigation) and degraded to a
// single fade under reduced motion. Words are wrapped inline-block so a line break never
// lands mid-word; the spaces between them stay breakable.
export function Typewriter({ sentences, delay = 0, className }: TypewriterProps) {
  const reduce = !!useReducedMotion();
  const [play] = useState(() => isFreshLoad());
  const text = sentences.join(" ");

  if (!play) {
    return <p className={className}>{text}</p>;
  }

  if (reduce) {
    return (
      <motion.p
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: REDUCED_DUR, ease: "easeOut", delay }}
      >
        {text}
      </motion.p>
    );
  }

  // Walk the text once, accumulating each glyph's start time in reading order: one
  // TYPE_CHAR step per glyph, plus a TYPE_SENTENCE_GAP pause before each new sentence.
  let t = delay;
  const next = () => {
    const at = t;
    t += TYPE_CHAR;
    return at;
  };
  const lines = sentences.map((sentence, si) => {
    if (si > 0) t += TYPE_SENTENCE_GAP;
    // Leading space reconnects this sentence to the previous one in the flow.
    const leadingSpace = si > 0 ? next() : null;
    const words = sentence.split(" ").map((word, wi) => ({
      spaceDelay: wi > 0 ? next() : null,
      chars: Array.from(word).map((ch) => ({ ch, delay: next() })),
    }));
    return { leadingSpace, words };
  });

  return (
    <p className={className}>
      <span style={srOnly}>{text}</span>
      <span aria-hidden="true">
        {lines.map((line, si) => (
          <span key={si}>
            {line.leadingSpace !== null && <Glyph ch=" " delay={line.leadingSpace} />}
            {line.words.map((word, wi) => (
              <span key={wi}>
                {word.spaceDelay !== null && <Glyph ch=" " delay={word.spaceDelay} />}
                <span style={{ display: "inline-block", whiteSpace: "pre" }}>
                  {word.chars.map((g, ci) => (
                    <Glyph key={ci} ch={g.ch} delay={g.delay} />
                  ))}
                </span>
              </span>
            ))}
          </span>
        ))}
      </span>
    </p>
  );
}
