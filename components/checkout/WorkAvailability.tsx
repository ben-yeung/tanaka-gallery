"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSandboxSold } from "@/lib/sandboxSold";
import { formatPrice } from "@/data/format";
import styles from "@/app/works/[slug]/detail.module.css";

interface Props {
  slug: string;
  priceCents: number;
  available: boolean;
}

export function WorkAvailability({ slug, priceCents, available }: Props) {
  const [sold, setSold] = useState(!available);

  useEffect(() => {
    if (!available) return;
    if (getSandboxSold().includes(slug)) setSold(true);
  }, [slug, available]);

  if (sold) {
    return <p className={`${styles.price} ${styles.sold}`}>Sold</p>;
  }

  return (
    <>
      <p className={styles.price}>{formatPrice(priceCents)}</p>
      <Link href={`/works/${slug}/inquire`} className={styles.inquire}>
        Inquire →
      </Link>
    </>
  );
}
