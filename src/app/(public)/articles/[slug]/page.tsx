import {type Metadata} from "next";
import {Suspense} from "react";
import {notFound} from "next/navigation";
import {Container, Box, Group, Title} from "@mantine/core";
import {IconMessage} from "@tabler/icons-react";
import {
  Content,
  ContentSkeleton,
  Comments,
  CommentsSkeleton,
} from "@/features/articles/components/article-detail";
import {fetchArticleByUUID} from "@/dal/public/articles";

type Props = {
  params: Promise<{
    slug?: string;
  }>;
};

export async function generateMetadata(props: Props): Promise<Metadata | null> {
  const params = await props.params;
  const slug = params.slug;
  if (slug === undefined) {
    return null;
  }
  const article = await fetchArticleByUUID(slug);
  return {
    title: `${article.title}`,
  };
}

async function ArticleDetailPage(props: Props) {
  const params = await props.params;
  const {slug} = params;

  if (slug === undefined) {
    notFound();
  }

  return (
    <Container component="section" px={{ base: "0", sm: "md" }} size="sm" mt="xl">
      <Suspense fallback={<ContentSkeleton />}>
        <Content uuid={slug} />
      </Suspense>
      <Box mt={"xl"}>
        <Group align="center" gap={"sm"}>
          <IconMessage />
          <Title ta={"right"} order={3}>
            دیدگاه ها
          </Title>
        </Group>
        <Suspense fallback={<CommentsSkeleton />}>
          <Comments uuid={slug} />
        </Suspense>
      </Box>
    </Container>
  );
}

export default ArticleDetailPage;
