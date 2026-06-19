import Link from "next/link";
import { Logo } from "./Logo";
import styles from "./ui.module.css";

export function Nav() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.wordmark}>
        <Logo size={22} title="" className={styles.wordmarkLogo} />
        Tanaka&apos;s Gallery
      </Link>
      <div className={styles.navLinks}>
        <Link href="/works" className={styles.navLink}>Works</Link>
        <Link href="/artists" className={styles.navLink}>Artists</Link>
      </div>
    </nav>
  );
}
