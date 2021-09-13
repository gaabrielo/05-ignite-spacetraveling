import React, { useEffect, useState } from 'react'; // eslint-disable-line
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Head from 'next/head';
import Prismic from '@prismicio/client';

import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import PostInfo from '../../components/PostInfo';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className={commonStyles.container}>
        <h1>Carregando...</h1>
      </div>
    );
  }
  const [postContent, setPostContent] = useState<Post>();
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    const words = post.data.content?.reduce((acc, content) => {
      const { body, heading } = content;

      const bodyText = body.reduce((fullText, text) => {
        return fullText + text.text;
      }, '');

      const wordsAmount =
        (bodyText?.split(' ').length || 0) + (heading?.split(' ').length || 0);

      return acc + wordsAmount;
    }, 0);

    setReadingTime(Math.ceil(words / 200));
  }, [post.data.content]);

  useEffect(() => {
    const postFormatted = {
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        banner: {
          url: post.data.banner.url ?? '',
        },
        author: post.data.author,
        content: post.data.content.map(item => {
          return {
            heading: item.heading,
            body: item.body.map(bodyItem => {
              return { text: bodyItem.text };
            }),
          };
        }),
      },
    };

    setPostContent(postFormatted);
  }, [post]);

  return (
    <>
      <Head>
        <title>{postContent?.data.title || 'spacetraveling'}</title>
      </Head>

      <main className={styles.container}>
        <Header />
        {!postContent ? (
          <h1>Carregando...</h1>
        ) : (
          <>
            {postContent.data.banner.url && (
              <section className={styles.banner}>
                <img src={String(postContent.data.banner.url)} alt="banner" />
              </section>
            )}
            <section className={`${commonStyles.container} ${styles.content}`}>
              <h1>{postContent.data.title}</h1>
              <div className={styles.info}>
                <time>
                  <FiCalendar />
                  {postContent.first_publication_date}
                </time>
                <span>
                  <FiUser />
                  {postContent.data.author}
                </span>
                <span>
                  <FiClock />
                  {readingTime} min
                </span>
              </div>

              <div className={styles.postTextContainer}>
                {post.data.content.map(item => (
                  <React.Fragment key={uuidv4()}>
                    <h1>{item.heading}</h1>
                    {item.body.map(text => (
                      <div
                        key={uuidv4()}
                        className={styles.postTextBody}
                        dangerouslySetInnerHTML={{ __html: text.text }}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'blog_post'),
    {
      orderings: '[document.first_publication_date]',
      pageSize: 3,
    }
  );

  const slugs = posts.results.reduce((arr, post) => {
    arr.push(post.uid);

    return arr;
  }, []);

  const params = slugs.map(slug => {
    return {
      params: { slug },
    };
  });

  return {
    paths: params,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('blog_post', String(slug), {});

  // console.log(JSON.stringify(response, null, 2));

  return {
    props: {
      post: response,
    },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};
