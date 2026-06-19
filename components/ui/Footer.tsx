import styles from "./ui.module.css";

const socials = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <>
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </>
    ),
  },
  {
    label: "X",
    href: "#",
    icon: (
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    ),
  },
  {
    label: "Email",
    href: "#",
    icon: (
      <>
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="m3.5 7 8.5 6 8.5-6"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      </>
    ),
  },
];

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
      <div className={styles.footerRight}>
        <span className={styles.footerMeta}>TANAKA'S GALLERY · est. 2001</span>
        <div className={styles.socials}>
          {socials.map((s) => (
            <a key={s.label} href={s.href} className={styles.social} aria-label={s.label}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {s.icon}
              </svg>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
