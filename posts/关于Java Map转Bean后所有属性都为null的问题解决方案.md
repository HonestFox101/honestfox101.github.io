---
title: 关于Java Map转Bean后所有属性都为null的问题解决方案
date: 2023-06-29 10:00:00
tags: Java
---
# 运行环境
Java 1.8
# 问题描述
在公司的脚手架里有这么一个函数：
```Java
/**
 * 将一个 Map 对象转化为一个 JavaBean
 *
 * @param type 要转化的类型
 * @param map 包含属性值的 map
 * @return 转化出来的 JavaBean 对象
 */
@SuppressWarnings("rawtypes")
public static Object convertMap(Class type, Map map)
```
而在实际使用的过程中，无论Map是什么，转换得到的Bean所有属性字段都为null。经断点测试发现，问题出在以下代码行

```java
method = descriptor.getWriteMethod();
method.invoke(obj, args);
```
即不能调用属性的设置方法。
# 解决方案
需要传入的Bean实体类中，修改@Accessors注解。

将
```Java
@Accessors(chain = true)
```
改为
```Java
@Accessors(chain = false)
```
