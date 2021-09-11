import { useEffect, useState } from 'react';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import styles from './styles.module.scss';

interface PostContent {
  body: string;
  heading: string;
}

interface PostInfoProps {
  data: {
    date: string;
    author: string;
    content?: PostContent[];
  };
}

export default function PostInfo({ data }: PostInfoProps): JSX.Element {
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    const words = data.content?.reduce((acc, content) => {
      const { body, heading } = content;

      const wordsAmount =
        (body?.split(' ').length || 0) + (heading?.split(' ').length || 0);

      return acc + wordsAmount;
    }, 0);

    setReadingTime(Math.ceil(words / 200));
  }, [data.content]);

  return (
    <div className={styles.container}>
      <span>
        <FiCalendar />
        {data.date}
      </span>
      <span>
        <FiUser />
        {data.author}
      </span>
      {data.content && (
        <span>
          <FiClock />
          {readingTime} min.
        </span>
      )}
    </div>
  );
}
