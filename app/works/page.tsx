import type { Metadata } from "next";
import { Suspense } from "react";
import { allWorks } from "@/data/works";
import { GalleryView } from "@/components/motion/GalleryView";
import { GalleryLoading } from "@/components/motion/GalleryLoading";
import styles from "@/components/motion/styles/grid.module.css";

export const metadata: Metadata = { title: "Works" };

export default function WorksPage() {
  return (
    <>
      <header className={styles.head}>
        <h1>Works</h1>
      </header>
      <Suspense fallback={<GalleryLoading />}>
        <GalleryView works={allWorks()} />
      </Suspense>
    </>
  );
}
