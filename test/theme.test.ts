// @vitest-environment node
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

describe("theme tokens", () => {
  const tokens = ["--paper", "--ink", "--matcha", "--stone"];
  it("defines all light-mode tokens in :root", () => {
    for (const t of tokens) expect(css).toMatch(new RegExp(`${t}\\s*:`));
  });
  it("redefines tokens under prefers-color-scheme: dark", () => {
    const dark = css.slice(css.indexOf("prefers-color-scheme: dark"));
    for (const t of tokens) expect(dark).toMatch(new RegExp(`${t}\\s*:`));
  });
  it("uses the corrected light --stone (#7E766A), not the low-contrast value", () => {
    expect(css).toMatch(/--stone:\s*#7E766A/i);
    expect(css).not.toMatch(/#B8B0A1/i);
  });
});
