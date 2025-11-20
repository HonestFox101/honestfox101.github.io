---
title: 使用SQLModel Relationship中的坑
date: 2025-11-20 00:00:00
tags: 
- Python
---

### 问题描述
问题代码如下
```python
class ProjectItem(BaseDBModel, table=True):
    # some other fields...
    labels: Annotated[
        list["Label"],
        Relationship(
            sa_relationship=relationship(
                uselist=True,
                back_populates="project",
                cascade="all, delete-orphan",
            )
        ),
    ]
```
控制台输出如下
```
  File "/Users/honestfox101/code-space/python-service/.venv/lib/python3.13/site-packages/sqlmodel/main.py", line 703, in get_sqlalchemy_type
    raise ValueError(f"{type_} has no matching SQLAlchemy type")
ValueError: <class 'list'> has no matching SQLAlchemy type
```
### 问题解析
项目中的SQLModel类的Fields都使用了`Annotated[TypeName, Field(...)`的方法定义，**然而该方法不适用于特殊的Relationship**。因而做出修改，使用等号定义Relationship字段，上述的问题代码后如下。
```python
class ProjectItem(BaseDBModel, table=True):
    # some other fields...
    labels: list["Label"] = Relationship(
        sa_relationship=relationship(
            uselist=True,
            back_populates="project",
            cascade="all, delete-orphan",
        )
    )
```
