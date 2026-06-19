import type { Metadata } from "next";
import Link from "next/link";
import { getWork } from "@/data/works";

export const metadata: Metadata = { title: "Confirmed" };

type Search = { searchParams: Promise<{ work?: string; redirect_status?: string }> };

export default async function Confirmed({ searchParams }: Search) {
  const { work: slug, redirect_status } = await searchParams;
  const work = slug ? getWork(slug) : undefined;
  const ok = redirect_status === "succeeded";

  return (
    <section style={{ padding: "80px var(--gutter)", maxWidth: 520 }}>
      <h1>{ok ? "Thank you." : "Order incomplete."}</h1>
      <p className="meta" style={{ marginTop: 12 }}>
        {ok && work
          ? `${work.title} — a test-mode order. No real payment was taken and nothing ships.`
          : "No payment was completed."}
      </p>
      <p style={{ marginTop: 28 }}>
        <Link href="/works" className="subhead" style={{ borderBottom: "1px solid currentColor" }}>
          ← Back to works
        </Link>
      </p>
    </section>
  );
}
