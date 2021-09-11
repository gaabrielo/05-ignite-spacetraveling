import { useRouter } from 'next/router';
import Link from 'next/link';

import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  const { route } = useRouter();

  return (
    <header
      className={route === '/' ? styles.largeContainer : styles.smallContainer}
    >
      <div className={`${commonStyles.container} ${styles.contentContainer}`}>
        <Link href="/">
          <a>
            <img src="/logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  );
}
