"use client";

import { createContext, useContext, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { itemVariants } from "../splash/variants";

type Tag = "div" | "p" | "h2" | "span";

// True once the section has scrolled into view. Latched (once:true) so it never
// flips back, and read by every animated child so all delays share one zero point.
export const AboutInViewContext = createContext(false);

// Section wrapper owning the single viewport trigger. once:true never re-hides;
// amount:0.2 fires as the reader arrives (matches the retired ScrollReveal).
export function AboutReveal({
  children,
  id,
  className,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <section ref={ref} id={id} className={className}>
      <AboutInViewContext.Provider value={inView}>{children}</AboutInViewContext.Provider>
    </section>
  );
}

// A splash block (label, lead, or a body column) that rises/deblurs/fades in when the
// section enters view, at its own section-relative delay. Reuses the splash
// itemVariants so it shares the homepage rise-in (opacity-only under reduced motion).
export function AboutRevealItem({
  children,
  as = "div",
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  as?: Tag;
  delay?: number;
  className?: string;
}) {
  const reduce = !!useReducedMotion();
  const inView = useContext(AboutInViewContext);
  const Comp = motion[as] as React.ElementType;
  return (
    <Comp
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={itemVariants(reduce, delay)}
    >
      {children}
    </Comp>
  );
}
