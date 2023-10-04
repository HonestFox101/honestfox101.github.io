---
title: Linux Debian下自定义守护进程的配置文件
date: 2022-10-05 00:00:00
tags: Linux
---
# 文件位置
systemd有系统和用户区分；系统（/user/lib/systemd/system/）、用户（/etc/lib/systemd/user/），一般系统管理员手工创建的单元文件存放在/etc/systemd/system/目录下面。

# 部分配置文件的区块

## [Unit]区块
- Description：简短描述
- Documentation：文档地址
- Requires：当前 Unit 依赖的其他 Unit，如果它们没有运行，当前 Unit 会启动失败
- Wants：与当前 Unit 配合的其他 Unit，如果它们没有运行，当前 Unit 不会启动失败
- BindsTo：与Requires类似，它指定的 Unit 如果退出，会导致当前 Unit 停止运行
- Before：如果该字段指定的 Unit 也要启动，那么必须在当前 Unit 之后启动
- After：如果该字段指定的 Unit 也要启动，那么必须在当前 Unit 之前启动
- Conflicts：这里指定的 Unit 不能与当前 Unit 同时运行
- Condition...：当前 Unit 运行必须满足的条件，否则不会运行
- Assert...：当前 Unit 运行必须满足的条件，否则会报启动失败

## [Service]区块
- Type：定义启动时的进程行为。它有以下几种值。
    - simple：默认值，执行ExecStart指定的命令，启动主进程
    - forking：以 fork 方式从父进程创建子进程，创建后父进程会立即退出
    - oneshot：一次性进程，Systemd 会等当前服务退出，再继续往下执行
    - dbus：当前服务通过D-Bus启动
    - notify：当前服务启动完毕，会通知Systemd，再继续往下执行
    - idle：若有其他任务执行完毕，当前服务才会运行

- ExecStart：启动当前服务的命令
- ExecStartPre：启动当前服务之前执行的命令
- ExecStartPost：启动当前服务之后执行的命令
- ExecReload：重启当前服务时执行的命令
- ExecStop：停止当前服务时执行的命令
- ExecStopPost：停止当其服务之后执行的命令
- RestartSec：自动重启当前服务间隔的秒数
- Restart：定义何种情况 Systemd 会自动重启当前服务，可能的值包括always（总是重启）、on-success、on-failure、on-abnormal、on-abort、on-watchdog
- TimeoutSec：定义 Systemd 停止当前服务之前等待的秒数
- Environment：指定环境变量

## [Install]区块
- Alias：为单元提供一个空间分离的附加名字。
- RequiredBy：单元被允许运行需要的一系列依赖单元，RequiredBy列表从Require获得依赖信息。
- WantBy：单元被允许运行需要的弱依赖性单元，Wantby从Want列表获得依赖信息。
- Also：指出和单元一起安装或者被协助的单元。
- DefaultInstance：实例单元的限制，这个选项指定如果单元被允许运行默认的实例。

# 配置文件示例
```
[Unit]
Description=Brook Service # 描述
Documentation=https://txthinking.github.io/brook/ # 文档链接
After=network.target nss-lookup.target # 启动的前置为网络服务

[Service]
User=root # 用户
Type=simple # 默认值，执行ExecStart指定的命令，启动主进程
CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_RAW # 允许执行网络管理任务和原始套接字
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_RAW # 允许执行网络管理任务和原始套接字
NoNewPrivileges=true # 该服务的所有进程与子进程都不可以获得任何新权限。
ExecStart=brook server --listen :8888 --password 123456 # 启动当前服务的命令
```