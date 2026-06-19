import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWork } from "@/data/works";
import { formatMeta } from "@/data/works";
import { formatPrice } from "@/data/format";
import { CheckoutPanel } from "@/components/checkout/CheckoutPanel";
import styles from "./inquire.module.css";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  return { title: work ? `Inquire — ${work.title}` : "Not found" };
}

export default async function Inquire({ params }: Params) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work || !work.available) notFound();

  return (
    <section className={styles.wrap}>
      <h1 className={styles.title}>{work.title}</h1>
      <p className={`meta ${styles.line}`}>{formatMeta(work)}</p>
      <p className={styles.price}>{formatPrice(work.priceCents)}</p>
      <CheckoutPanel slug={work.slug} />
      <p className={`meta ${styles.testnote}`}>
        Test mode. Use card 4242 4242 4242 4242, any future expiry, any CVC. No real payment is taken.
      </p>
    </section>
  );
}
