import Link from "next/link";

export default function NotFound() {
  return (
    <section style={{ padding: "96px var(--gutter)", maxWidth: 520 }}>
      <h1>Not here.</h1>
      <p className="meta" style={{ marginTop: 12 }}>That page or work does not exist.</p>
      <p style={{ marginTop: 28 }}>
        <Link href="/" className="subhead" style={{ borderBottom: "1px solid currentColor" }}>
          ← Home
        </Link>
      </p>
    </section>
  );
}
