import "vitepress";
import { VitePressData } from "vitepress";

declare module "vitepress" {
  export namespace DefaultTheme {
    interface Config {
      avator: string;
      docsDir: string;
      posts: {
        frontMatter: {
          [key: string]: any;
        };
        regularPath: string;
      }[];
      pageSize: number;
      postLength: number;
    }
  }

  export function useData(): VitePressData<DefaultTheme.Config>
}