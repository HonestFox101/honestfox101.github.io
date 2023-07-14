---
title: 记录一次Unity游戏机翻过程
date: 2022-07-14 10:06:25
tags: 数据挖掘
---

# 环境工具
编码环境：Jupyter、python、vscode

游戏样本：Eclipse no majo

游戏解包工具: Assets studio、UnityPy、uabead


# 游戏资源分析

## 资源文件目录分析
AssetBundle目录的结构如下:
```
-AssetBundle
    -- Japanese
        --- lc_tables
        --- scenario
    -- English
        --- lc_tables
        --- scenario
    -- ...
```
可见有Japanese和English两个分语言的文件夹，可以推断游戏有采取i18n方案。

在Assets Studio浏览i18n游戏资源发现，English文本不完善，故而选择进一步分析**Japanese文件夹**下的资源文件

## 文件资源分析
主要分析的是两个文件：**lc_tables**和**scenario**
### lc_tables
存放的是主要为游戏的基础信息，如道具名称，结局名称，格式为json。
### scenario
存放的是游戏的对话场景台本，需要翻译的内容大致分为以下几类:
1. 人物台词：以“「”开头以“」”结尾
2. 旁白：同人物台词，但是没有“「”和“」”作为前导或尾随字符
3. 功能文本：形如：\\[A-Z]{2}["*+"]

## 翻译过程
1. 使用UnityPy对游戏资源解包
2. 翻译匹配形式的文本
3. 重新封包，需要使用到uabead重新压缩

## 完整代码
### 提取资源
```python
import os
import UnityPy

def extract_TextAsset(game_path: str, output_path: str = "output"):
    """提取Texture2D"""
    for root, dirs, files in os.walk(game_path):
        for file_name in files:
            asset_file_path = os.path.join(root, file_name)
            env = UnityPy.load(asset_file_path)
            for obj in env.objects:
                if(obj.type.name == "TextAsset"): 
                    path_id = obj.path_id
                    data = obj.read()
                    container_path = str(obj.container)
                    data_name = container_path[container_path.rindex("/")+1:container_path.rindex(".")]
                    ext = container_path[container_path.rindex(".")+1:]
                    with open(os.path.join(output_path ,f"{file_name}_{data_name}_{path_id}.{ext}"), "wb+") as f:
                        f.write(bytes(data.script))

extract_TextAsset("game\AssetBundles", "raw")
```
### 翻译
```python
import os
import re
import json
from hashlib import md5
import random
import requests
import time

def baidu_translate(content: str) -> str|None:
    """基于requests的百度翻译"""
    url = "https://api.fanyi.baidu.com/api/trans/vip/translate"
    q = content
    from_lang = "jp"
    to_lang = "zh"
    appid = "******"
    secret = "******"
    salt = str(random.randint(100000,999999))
    sign = md5((appid + q + salt + secret).encode()).hexdigest()
    data = {
        "q": q,
        "from": from_lang,
        "to": to_lang,
        "appid": appid,
        "salt": salt,
        "sign": sign
    }

    try:
        resp = requests.post(url, data, headers={
            "Content-Type": "application/x-www-form-urlencoded"
        })
    except Exception as e:
        print(e)
        return None

    if resp.status_code != 200:
        print("Http请求错误!")
        return None
    
    return "".join(result['dst'] + '\n' for result in resp.json()['trans_result'])[0:-1]

class TextAssetsTranslator:
    def __init__(self) -> None:
        self.charaters: dict[str, str] = {"リズ":"丽兹","エリ":"艾丽","ロクサーヌ":"罗克珊"}

    # def test(self, content: str, start_and_end: str):
    #     return start_and_end + content + start_and_end
    
    def send_translate_request(self, content: str) -> str:
        time.sleep(.1)
        content = content.replace("<color=#f59aa0>♥</color>", "♥").replace("\V[EnemyName]", "EnemyName")
        result = baidu_translate(content)
        if result == None:
            time.sleep(.1)
            result = baidu_translate(content)
            if result == None:
                raise Exception("百度翻译请求失败！")
        result = result.replace("♥","<color=#f59aa0>♥</color>").replace("EnemyName", "\V[EnemyName]")
        
        origin_length = len(content.split("\n"))
        result_length = len(result.split("\n"))
        result = result + "\n" * (origin_length - result_length)
        return result
    
    def translate_scenarios(self, raw_text_folder_path: str = "raw", output_path: str = "translated", match_pattern: str|None = None):
        """批量翻译场景文件"""
        for item in os.scandir(raw_text_folder_path):
            if item.is_dir():
                continue

            file_name = item.name
            # Skip when file name don't match the pattern
            if match_pattern != None:
                if re.match(match_pattern, file_name) == None:
                    continue
            # Skip when file is already exist
            if file_name in os.listdir(output_path):
                continue

            raw_file_path = os.path.join(raw_text_folder_path, file_name)
            print(f"loading {raw_file_path}\n")
            # Read data
            with open(raw_file_path, "r", encoding="utf-8") as f:
                line_list = f.readlines()
            
            # Edit data by line
            read_index = 0
            while read_index < len(line_list):
                line = line_list[read_index]
                # Skip no japanese content line
                if re.search(r"([^\x00-\xff])+", line) == None:
                    read_index = read_index + 1
                    continue
                # Skip comment
                if re.match(r"^\s*//", line):
                    read_index = read_index + 1
                    continue
                # Skip logical syntax
                if re.match(r"^\s*:", line):
                    read_index = read_index + 1
                    continue
                
                # Handle charater name
                if re.match(r"\s*\\CN\[.+\]",line):
                    raw_charater_name = line[line.find('"') + 1:line.rindex('"')]
                    if self.charaters.get(raw_charater_name) == None:
                        charater_name = self.send_translate_request(raw_charater_name)
                        self.charaters[raw_charater_name] = charater_name
                        print(f"[角色名]{raw_charater_name} => {charater_name}")
                    else:
                        charater_name = self.charaters[raw_charater_name]
                    # Edit
                    line = line.replace(raw_charater_name, charater_name)
                    # Save edit
                    line_list[read_index] = line
                
                # Handle choice
                if re.match(r"\s*\\CI\[.+\]",line):
                    raw = line[line.find('"') + 1:line.rindex('"')]
                    result = self.send_translate_request(raw)
                    print(f"[选项]{raw} => {result}")
                    # Edit
                    line = line.replace(raw, result)
                    # Save edit
                    line_list[read_index] = line

                # Handle dialog
                elif re.match(r"^\s*「([^」]+」\s*$|[^」]+$)", line):
                    start = read_index
                    raw_contents = [line[line.find("「") + 1:]]
                    while re.match(r".+」$", line) == None:
                        read_index = read_index + 1
                        line = line_list[read_index]
                        raw_contents.append(line)
                    raw_contents[-1] = raw_contents[-1][:raw_contents[-1].rindex("」")]
                    
                    # Handle
                    wrapped_content = "".join(raw_contents)
                    handled_content = self.send_translate_request(wrapped_content)
                    
                    result_contents = [content + "\n" for content in handled_content.split("\n")]
                    result_contents[-1] = result_contents[-1][:-1]
                    # Edit
                    for i in range(len(raw_contents)):
                        raw = raw_contents[i].replace("\n","").replace(" ", "").replace("\t", "").replace("　","")
                        result = result_contents[i].replace("\n","").replace(" ","").replace("\t", "").replace("　","")
                        line_list[start + i] = line_list[start + i].replace(raw, result)
                        print(f"[对话]{raw} => {result}")

                # Handle voice-over
                elif re.match(r"^\s*(\\V\[EnemyName\])?[^\x00-\xff]+", line):
                    start = read_index
                    raw_contents: list[str] = []
                    while re.match(r"^\s*(\\V\[EnemyName\])?[^\x00-\xff]+", line) and re.match(r"^\s*「([^」]+」\s*$|[^」]+$)", line) == None:
                        raw_contents.append(line)
                        read_index = read_index + 1
                        if read_index >= len(line_list): break
                        line = line_list[read_index]

                    raw_contents[-1] = raw_contents[-1][:-1]
                    # Handle
                    wrapped_content = "".join(raw_contents)
                    handled_content = self.send_translate_request(wrapped_content)

                    result_contents = [content + "\n" for content in handled_content.split("\n")]
                    # Edit
                    for i in range(len(raw_contents)):
                        raw = raw_contents[i].replace("\n","").replace(" ","").replace("\t","").replace("　","")
                        result = result_contents[i].replace("\n","").replace(" ","").replace("\t", "").replace("　","")
                        line_list[start + i] = line_list[start + i].replace(raw, result)
                        print(f"[旁白]{raw} => {result}")

                read_index = read_index + 1
                
            # Write data
            output_file_path = os.path.join(output_path, file_name)
            with open(output_file_path, "w+", encoding="utf-8") as f:
                f.write("".join(line_list))

    def translate_json(self, raw_text_folder_path: str = "raw", output_path: str = "translated", match_pattern: str|None = None):
        """翻译json"""
        for item in os.scandir(raw_text_folder_path):
            if item.is_dir():
                continue
            file_name = item.name
             # Skip when file name don't match the pattern
            if match_pattern != None:
                if re.match(match_pattern, file_name) == None:
                    continue
            # Skip when file is already exist
            if file_name in os.listdir(output_path):
                continue

            json_file_path = os.path.join(raw_text_folder_path, file_name)
            print(f"loading {json_file_path}")
            with open(json_file_path, "r", encoding="utf-8") as f:
                str_data = f.read()
                data = json.loads(str_data)

            stack: list[dict|list|bool|int|float|str] = [data]
            trans_dict: dict[str,str] = {}
            while len(stack) > 0:
                current_node = stack.pop()
                if type(current_node) is dict:
                    for key, value in current_node.items():
                        if type(value) is str:
                            if re.search(r"[^\x00-\xff◯×]+", value):
                                # Translate
                                if trans_dict.get(value) == None:
                                    trans_dict[value] = self.send_translate_request(value)
                                    print(f"{value} => {trans_dict[value]}")
                                # Edit
                                current_node[key] = trans_dict[value]
                        else:
                            stack.append(value)
                if type(current_node) is list:
                    for i, item in enumerate(current_node):
                        if type(item) is str:
                            if re.search(r"[^\x00-\xff◯×]+", item):
                                # Translate
                                if trans_dict.get(item) == None:
                                    trans_dict[item] = self.send_translate_request(item)
                                    print(f"{item} => {trans_dict[item]}")
                                # Edit
                                current_node[i] = trans_dict[item]
                        else:
                            stack.append(item)
                
            # Save
            output_file_path = os.path.join(output_path, file_name)
            with open(output_file_path, "w+", encoding="utf-8") as f:
                str_data = json.dumps(data)
                f.write(str_data)

translator = TextAssetsTranslator()
translator.translate_scenarios(match_pattern=r"scenarios_.+\.txt")
translator.translate_json(match_pattern=r"(lc_)?tables_.+\.json")
```
### 打包
```python
import os
import UnityPy

def inject_TextAsset(game_path: str, source_path: str = "translated", output_path: str = "output", match_pattern: str|None = None):
    """写入文本"""
    source_files = os.listdir(source_path)
    for root, dirs, files in os.walk(game_path):
        for file_name in files:
            asset_file_path = os.path.join(root, file_name)
            env = UnityPy.load(asset_file_path)
            change_flag = False
            for container_path, obj in env.container.items():
                if obj.type.name == "TextAsset":
                    path_id = obj.path_id
                    asset_name = container_path[container_path.rindex("/") + 1 : container_path.rindex(".")]
                    ext = container_path[container_path.rindex(".") + 1:]
                    
                    source_file_name = f"{file_name}_{asset_name}_{path_id}.{ext}"

                    if source_file_name not in source_files:
                        continue
                    if match_pattern != None:
                        if re.match(match_pattern, source_file_name) == None:
                            continue

                    # Edit
                    change_flag = True
                    data = obj.read()
                    with open(os.path.join(source_path, source_file_name), "rb") as f:
                        source_data = f.read()
                        data.script = source_data
                    data.save()
            # Important: Save the file as a new file(decompressed)
            if change_flag:
                with open(f"{output_path}/{file_name}_decompressed", "wb+") as f:
                    f.write(env.file.save())
                        

inject_TextAsset("game/AssetBundles", "translated")
```
