import Link from "next/link";
import styles from "./ui.module.css";

export function Nav() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.wordmark}>Tanaka Projects</Link>
      <div className={styles.navLinks}>
        <Link href="/works" className={styles.navLink}>Works</Link>
        <Link href="/artists" className={styles.navLink}>Artists</Link>
      </div>
    </nav>
  );
}
