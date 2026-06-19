import type { Metadata } from "next";
import { allWorks } from "@/data/works";
import { WorkGrid } from "@/components/motion/WorkGrid";
import styles from "@/components/motion/grid.module.css";

export const metadata: Metadata = { title: "Works" };

export default function WorksPage() {
  return (
    <>
      <header className={styles.head}>
        <h1>Works</h1>
        <p className={`subhead ${styles.subhead}`}>The complete index</p>
      </header>
      <WorkGrid works={allWorks()} />
    </>
  );
}
