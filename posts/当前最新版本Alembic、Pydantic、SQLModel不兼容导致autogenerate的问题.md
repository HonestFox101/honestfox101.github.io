---
title: 当前最新版本Alembic、Pydantic、SQLModel不兼容导致autogenerate的问题
date: 2025-11-04 00:00:00
tags: 
- Python
---

### 背景
数据库：MySQL 8
关联Library:
- alembic~=1.17
- sqlmodel==0.0.27
- pydantic~=2.12

### 发现经过
升级Python依赖后，执行命令`alembic revision -m "<message>" --autogenerate`报错。

```
Traceback (most recent call last):
  File "/Users/honestfox101/code-space/lehi-service/.venv/bin/alembic", line 8, in <module>
    sys.exit(main())
             ~~~~^^
  File "/Users/honestfox101/code-space/lehi-service/.venv/lib/python3.13/site-packages/alembic/config.py", line 1022, in main
    CommandLine(prog=prog).main(argv=argv)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^
  File "/Users/honestfox101/code-space/lehi-service/.venv/lib/python3.13/site-packages/alembic/config.py", line 1012, in main
    self.run_cmd(cfg, options)
    ~~~~~~~~~~~~^^^^^^^^^^^^^^
  File "/Users/honestfox101/code-space/lehi-service/.venv/lib/python3.13/site-packages/alembic/config.py", line 946, in run_cmd
    fn(
    ~~^
        config,
        ^^^^^^^
        *[getattr(options, k, None) for k in positional],
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        **{k: getattr(options, k, None) for k in kwarg},
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    )
    ^
  File "/Users/honestfox101/code-space/lehi-service/.venv/lib/python3.13/site-packages/alembic/command.py", line 309, in revision
    script_directory.run_env()
    ~~~~~~~~~~~~~~~~~~~~~~~~^^
  File "/Users/honestfox101/code-space/lehi-service/.venv/lib/python3.13/site-packages/alembic/script/base.py", line 549, in run_env
    util.load_python_file(self.dir, "env.py")
    ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^
  File "/Users/honestfox101/code-space/lehi-service/.venv/lib/python3.13/site-packages/alembic/util/pyfiles.py", line 116, in load_python_file
    module = load_module_py(module_id, path)
  File "/Users/honestfox101/code-space/lehi-service/.venv/lib/python3.13/site-packages/alembic/util/pyfiles.py", line 136, in load_module_py
    spec.loader.exec_module(module)  # type: ignore
    ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^
  File "<frozen importlib._bootstrap_external>", line 1026, in exec_module
  File "<frozen importlib._bootstrap>", line 488, in _call_with_frames_removed
  File "/Users/honestfox101/code-space/lehi-service/.alembic/env.py", line 6, in <module>
    from models import BaseDBModel as Base
  File "/Users/honestfox101/code-space/lehi-service/models/__init__.py", line 2, in <module>
    from .sql_models import *  # noqa: F403
    ^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/honestfox101/code-space/lehi-service/models/sql_models/__init__.py", line 1, in <module>
    from .website_enum import WebsiteEnum  # noqa: F401
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/honestfox101/code-space/lehi-service/models/sql_models/website_enum.py", line 7, in <module>
    class WebsiteEnum(BaseDBModel, table=True):
    ...<19 lines>...
        ]
  File "/Users/honestfox101/code-space/lehi-service/.venv/lib/python3.13/site-packages/sqlmodel/main.py", line 644, in __init__
    DeclarativeMeta.__init__(cls, classname, bases, dict_, **kw)
    ~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/honestfox101/code-space/lehi-service/.venv/lib/python3.13/site-packages/sqlalchemy/orm/decl_api.py", line 198, in __init__
    _as_declarative(reg, cls, dict_)
    ~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^
  File "/Users/honestfox101/code-space/lehi-service/.venv/lib/python3.13/site-packages/sqlalchemy/orm/decl_base.py", line 245, in _as_declarative
    return _MapperConfig.setup_mapping(registry, cls, dict_, None, {})
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/honestfox101/code-space/lehi-service/.venv/lib/python3.13/site-packages/sqlalchemy/orm/decl_base.py", line 326, in setup_mapping
    return _ClassScanMapperConfig(
        registry, cls_, dict_, table, mapper_kw
    )
  File "/Users/honestfox101/code-space/lehi-service/.venv/lib/python3.13/site-packages/sqlalchemy/orm/decl_base.py", line 581, in __init__
    self._early_mapping(mapper_kw)
    ~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^
  File "/Users/honestfox101/code-space/lehi-service/.venv/lib/python3.13/site-packages/sqlalchemy/orm/decl_base.py", line 367, in _early_mapping
    self.map(mapper_kw)
    ~~~~~~~~^^^^^^^^^^^
  File "/Users/honestfox101/code-space/lehi-service/.venv/lib/python3.13/site-packages/sqlalchemy/orm/decl_base.py", line 1995, in map
    mapper_cls(self.cls, self.local_table, **self.mapper_args),
    ~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<string>", line 2, in __init__
  File "/Users/honestfox101/code-space/lehi-service/.venv/lib/python3.13/site-packages/sqlalchemy/util/deprecations.py", line 281, in warned
    return fn(*args, **kwargs)  # type: ignore[no-any-return]
  File "/Users/honestfox101/code-space/lehi-service/.venv/lib/python3.13/site-packages/sqlalchemy/orm/mapper.py", line 866, in __init__
    self._configure_pks()
    ~~~~~~~~~~~~~~~~~~~^^
  File "/Users/honestfox101/code-space/lehi-service/.venv/lib/python3.13/site-packages/sqlalchemy/orm/mapper.py", line 1652, in _configure_pks
    raise sa_exc.ArgumentError(
    ...<3 lines>...
    )
sqlalchemy.exc.ArgumentError: Mapper Mapper[WebsiteEnum(website_enum)] could not assemble any primary key columns for mapped table 'website_enum'
```

### 问题分析
根据报错断点调试，SQLModel的Field并没有被读取Alembic或SQLAlchemy正确地读取到Column信息。

### 解决方案
通过冻结pydantic版本<=2.11.10，解决alembic无法执行autogenerate的问题。
