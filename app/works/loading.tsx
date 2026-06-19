import { GalleryLoading } from "@/components/motion/GalleryLoading";
import styles from "@/components/motion/styles/grid.module.css";

export default function Loading() {
  return (
    <>
      <header className={styles.head}>
        <h1>Works</h1>
      </header>
      <GalleryLoading />
    </>
  );
}
