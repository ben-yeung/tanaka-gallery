import styles from "./ui.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div>
        <span className={styles.tagline}>Made in Japan. Curated in SF.</span>
        <span className={styles.notice}>
          Purely a mockup of a gallery design I had in mind • Artworks are AI generated
          for display only
        </span>
      </div>
      <span className={styles.footerMeta}>San Francisco · est. 2001</span>
    </footer>
  );
}
