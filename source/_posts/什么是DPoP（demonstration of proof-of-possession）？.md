---
title: 什么是DPoP（demonstration of proof-of-possession）？
date: 2023-10-08 22:42:32
tags: 
- 信息安全
- 用户认证
---

# 背景
标准的OAuth2.0/OpenID connect请求流程的任何时刻，都无法验证token的所有者和请求资源的用户之间的关系。

考虑到这种情况，IETF（因特网工程任务组）引入了DPoP（demonstration of proof-of-possession）作为一种证明所有权的演示，这是在无法使用MTLS时可以使用的另一种机制。DPoP仅用于检测访问token和刷新token的重放攻击。

这个新的规范仍处于互联网草案阶段（第5版）

# DPoP的工作流程
![](/images/DPoP_flow.png)

- 公共客户端（移动应用程序或单页应用程序）首先必须生成一对公钥和私钥（1）
- 通过将公钥嵌入头部部分来生成DPoP证明JWT。您可以参考Java客户端作为生成DPoP的示例（4）
- 使用这个DPoP作为token请求调用的头部，并调用授权服务器（5）
- 授权服务器首先提取DPoP头并验证DPoP（6）
- 使用JWT头部的公钥并验证DPoP证明的签名（7）
- 验证DPoP证明的到期时间和端点信息（htm和htu值）
- 仅当所有DPoP验证都通过时，才为用户生成访问token（8）
- 在发放访问token之前，此访问token将与DPoP证明的公钥指纹绑定。这将说明此访问token和刷新token是为这个公钥-私钥对或客户端发放的（9）
- 一旦客户端收到访问token和刷新token，客户端可以使用它们来访问受保护的资源（10）
- 在调用API时，客户端必须再次使用用于获取访问token的相同的私钥和公钥对来生成DPoP（13）
- 在调用API以访问资源服务器中的资源时，使用这个新的DPoP证明作为DPoP头部（14）
- 资源服务器接下来提取DPoP并进行DPoP证明验证（15）
- 验证DPoP的签名、到期时间和端点信息（16）
- 仅当DPoP经过验证时，才验证访问token
    - 如果它是不透明的访问令牌：执行内省并确保与访问令牌绑定的公钥指纹与用于生成DPoP jtk值的公钥的指纹相同