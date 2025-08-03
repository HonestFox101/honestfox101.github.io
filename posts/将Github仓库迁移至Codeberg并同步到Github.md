---
title: 将Github仓库迁移至Codeberg并同步到Github
date: 2025-08-03 12:00:00
tags: 
- CI&CD
---

## 背景
在使用中国移动宽带时，访问Github经常遇到连接不稳定、速度缓慢等问题，严重影响了日常开发效率。

近期发现了一个优秀的替代方案——由开源非盈利组织建立的Git托管平台[`Codeberg`](https://codeberg.org/)。

经过实际测试，Codeberg在国内网络环境下访问流畅，功能完善，完全能够满足开发需求，因此决定将项目迁移至该平台。

## Codeberg介绍

<img width="48" height="39" alt="Codeberg" src="https://github.com/user-attachments/assets/1b3f5a08-966e-45b5-a3d2-b791c1784244" />

Codeberg是一个由开源社区驱动的非营利的代码托管平台。

其网站架构基于[`Forgejo`](https://forgejo.org/)构建（软件源代码托管平台自部署工具，`Gitea`的硬分叉版本）。

Codeberg具有以下的优势。

- **完全免费**：作为非盈利组织运营，不设任何收费项目；
- **访问稳定**：国内网络连接顺畅，解决了Github访问不稳定的痛点；
- **迁移便捷**：仓库迁移便捷，支持Github、Gitlab等多个平台的源代码仓库一键迁移；
- **功能完善**：支持部署静态网页，项目镜像，Workflow等功能；

## 迁移步骤
### 1. 准备Codeberg账号
访问[`https://codeberg.org`](https://codeberg.org)，注册账号并登录。

### 2. 选择项目迁移
登录后点击右上角"+"按钮，选择“开始迁移”，然后选择”Github“。
<img width="1870" height="934" alt="Image" src="https://github.com/user-attachments/assets/48175ce4-b6d1-47a4-88a5-4e4b3a6a98e8" />

### 3. 填写仓库信息
填写需要迁移的Github仓库信息，一般只需填写必填项。

确认信息无误后，点击"迁移仓库"按钮，等待仓库创建。

<img width="801" height="888" alt="Image" src="https://github.com/user-attachments/assets/34e6978f-eb15-4322-802f-76662b1f82dd" />

### 4. 为Codeberg仓库设置镜像
访问位于codeberg的仓库，选择“设置”，滚动到“镜像设置”区间。

复制Github仓库的**ssh**地址（**注意必须使用SSH协议**），然后勾选使用ssh验证、提交推送。

<img width="1020" height="663" alt="Image" src="https://github.com/user-attachments/assets/4d63a4c1-fffb-46b7-862b-ff3be3df03cb" />

### 5. 复制公钥，添加到Github仓库
设置完镜像仓库后，在镜像仓库列表选择复制公钥。

然后访问Github仓库地址，选择“设置（settings）”。然后侧边栏选择“Deploy keys”。然后点击“Add deploy key”。

粘贴复制的公钥并保存。

<img width="1500" height="874" alt="Image" src="https://github.com/user-attachments/assets/cac1cb56-e9d3-4fd9-b99b-5ac4b35024a9" />


