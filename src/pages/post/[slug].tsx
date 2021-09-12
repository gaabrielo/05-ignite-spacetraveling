import React from 'react'; // eslint-disable-line
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Head from 'next/head';
import Prismic from '@prismicio/client';

import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
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
      url?: string;
    };
    author: string;
    content: {
      heading: string;
      body: string;
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback)
    return (
      <div className={commonStyles.container}>
        <h1>Carregando...</h1>
      </div>
    );

  return (
    <>
      <Head>
        <title>{post.data.title || 'spacetraveling'}</title>
      </Head>

      <main className={styles.container}>
        <Header />
        {post.data.banner.url && (
          <section className={styles.banner}>
            <img src={String(post.data.banner.url)} alt="banner" />
          </section>
        )}
        <section className={`${commonStyles.container} ${styles.content}`}>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <PostInfo
              data={{
                date: post.first_publication_date,
                author: post.data.author,
                content: post.data.content,
              }}
            />
          </div>

          <div className={styles.postTextContainer}>
            {post.data.content.map(item => (
              <React.Fragment key={uuidv4()}>
                <h1>{item.heading}</h1>
                <div
                  className={styles.postTextBody}
                  dangerouslySetInnerHTML={{ __html: item.body }}
                />
              </React.Fragment>
            ))}
          </div>
        </section>
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

  const postContent = response.data.content.map(item => {
    return {
      heading: item.heading,
      body: RichText.asHtml(item.body),
    };
  });

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url ?? null,
      },
      author: response.data.author,
      content: postContent,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};
