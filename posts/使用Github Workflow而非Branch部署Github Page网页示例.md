---
title: 使用Github Workflow而非Branch部署Github Page网页
date: 2025-08-03 00:00:00
tags: 
  - CI&CD
---

## 概述
GitHub 提供了两种部署静态网站到 GitHub Pages 的方式：
- 传统方式：基于特定分支（默认为 gh-pages）的内容部署
- 新方式：通过 GitHub Workflow 直接部署构建产物

相比之下，Workflow 部署方式具有以下优势：
- **节省存储空间**：无需维护一个额外的部署分支
- **自动化程度高**：构建和部署过程完全自动化
- **灵活性更强**：可以自定义构建过程和部署条件

## 示例代码
以下为本人的Github Page部署Workflow示例，项目使用的是`Pnpm`+`vitepress`的技术栈。
```yml
on:
  push:
    branches: [master]
  workflow_dispatch:
name: Build Blog
permissions:
  pages: write
  id-token: write
concurrency:
  group: "pages"
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
        with:
          fetch-depth: 2

      - name: Setup Pnpm
        uses: pnpm/action-setup@v4.1.0
        with:
          run_install: false
          version: latest

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Build Packages
        run: pnpm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: .vitepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

```
