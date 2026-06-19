import type { Metadata } from "next";
import { Suspense } from "react";
import { allWorks } from "@/data/works";
import { GalleryView } from "@/components/motion/GalleryView";
import { GalleryLoading } from "@/components/motion/GalleryLoading";
import { SplashItem } from "@/components/motion/splash/SplashItem";
import { CONTENT_START } from "@/components/motion/splash/timing";
import styles from "@/components/motion/styles/grid.module.css";

export const metadata: Metadata = { title: "Works" };

export default function WorksPage() {
  return (
    <>
      <SplashItem as="header" delay={CONTENT_START} className={styles.head}>
        <h1>Works</h1>
      </SplashItem>
      <Suspense fallback={<GalleryLoading />}>
        <GalleryView works={allWorks()} />
      </Suspense>
    </>
  );
}
