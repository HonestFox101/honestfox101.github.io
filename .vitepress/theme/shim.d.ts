import "vitepress";
import { Config } from "../config";
import { VitePressData } from "vitepress";

declare module "vitepress" {
  export function useData<T = Config["themeConfig"]>(): VitePressData<T>;
}
