import { getPosts, getPostLength } from "./theme/serverUtils.js";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";
import mathjax3 from "markdown-it-mathjax3";
import { DefaultTheme, defineConfigWithTheme } from "vitepress";

const themeConfig: DefaultTheme.Config & Record<string, unknown> = {
  // repo: "clark-cui/homeSite",
  outline: [1, 2],
  aside: true,
  logo: "/horse.svg",
  avator: "https://avatars.githubusercontent.com/u/76041876?v=4",
  search: {
    provider: "local",
  },
  docsDir: "/",
  // docsBranch: "master",
  posts: await getPosts(),
  pageSize: 5,
  postLength: await getPostLength(),
  nav: [
    {
      text: "🏡Blogs",
      link: "/",
    },
    {
      text: "🔖Tags",
      link: "/tags",
    },
    {
      text: "📃Archives",
      link: "/archives",
    },
  ],
};

const config = defineConfigWithTheme({
  lang: "zh-CN",
  title: "Magic Bubble!",
  description: "Home of Magic Bubble!",
  head: [
    [
      "link",
      {
        rel: "icon",
        type: "image/svg",
        href: "/horse.svg",
      },
    ],
    [
      "meta",
      {
        name: "author",
        content: "Magic Bubble!",
      },
    ],
    [
      "meta",
      {
        property: "og:title",
        content: "Home",
      },
    ],
    [
      "meta",
      {
        property: "og:description",
        content: "Home of Magic Bubble!",
      },
    ],
  ],
  // cleanUrls: "with-subfolders",
  // lastUpdated: false,
  themeConfig: themeConfig,
  markdown: {
    theme: {
      light: "github-light-default",
      dark: "vitesse-dark",
    },
    codeTransformers: [transformerTwoslash() as any],
    config: (md: any) => {
      md.use(mathjax3);
    },
  },
  // vite: {
  //   ssr: {
  //     noExternal: ["vitepress-plugin-twoslash"],
  //   },
  // },
});

export type Config = typeof config;

export default config;
