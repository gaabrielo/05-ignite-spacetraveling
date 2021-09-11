import Link from 'next/link';
import PostInfo from '../PostInfo';

import styles from './styles.module.scss';

interface PostSummaryProps {
  post: {
    uid?: string;
    first_publication_date: string | null;
    data: {
      title: string;
      subtitle: string;
      author: string;
    };
  };
}

export default function PostSummary({ post }: PostSummaryProps): JSX.Element {
  const postInfo = {
    date: post.first_publication_date,
    author: post.data.author,
  };

  return (
    <div className={styles.post}>
      <Link href={`/post/${post.uid}`}>
        <a>
          <h1>{post.data.title}</h1>
          <p>{post.data.subtitle}</p>
        </a>
      </Link>

      <div className={styles.infoContainer}>
        <PostInfo data={postInfo} />
      </div>
    </div>
  );
}
