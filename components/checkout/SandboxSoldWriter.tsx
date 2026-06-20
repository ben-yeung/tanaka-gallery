"use client";
import { useEffect } from "react";
import { markSandboxSold } from "@/lib/sandboxSold";

export function SandboxSoldWriter({ slug }: { slug: string }) {
  useEffect(() => {
    markSandboxSold(slug);
  }, [slug]);
  return null;
}
