import styles from "./ui.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.tagline}>Art. Objects. San Francisco.</span>
      <span className={styles.footerMeta}>San Francisco · est. 2001</span>
    </footer>
  );
}
