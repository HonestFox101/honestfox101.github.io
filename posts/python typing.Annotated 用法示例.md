---
title: python typing.Annotated 用法示例
date: 2025-07-15 10:48:00
tags: Python
---
# 概述
typing.Annotated 是 Python 3.9 引入的一个类型提示工具，允许开发者为类型添加元数据。元数据可以是任何对象，通常用于提供额外的上下文信息，例如文档字符串、验证规则或其他说明。

# 示例代码
以下为类Pydantic的示例。
```python
from typing import Annotated, get_type_hints, get_origin, get_args

class User:
    id: Annotated[str, "This is a metadata"]

# 获取类型提示，包括额外信息
type_hints = get_type_hints(User, include_extras=True)
print(type_hints)  # {'id': typing.Annotated[str, 'This is a metadata']}

# 检查类型的原始类型和参数
print(get_origin(type_hints["id"]) is Annotated and get_args(type_hints["id"])) 
# 输出: (<class 'str'>, 'This is a metadata')

# 访问元数据
print(type_hints["id"].__metadata__)  # ('This is a metadata',)
```

