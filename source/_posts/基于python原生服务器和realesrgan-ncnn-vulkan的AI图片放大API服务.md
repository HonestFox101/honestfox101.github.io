---
title: 基于python原生服务器和realesrgan-ncnn-vulkan的AI图片放大API服务
date: 2023-06-29 10:00:00
tags: Java
---
# 介绍
通过python原生的模块http.server，将realesrgan-ncnn-vulkan.exe命令行工具包装成API
# 源码
```python
from enum import Enum
from http.server import BaseHTTPRequestHandler, HTTPServer
import subprocess
import os
from urllib.parse import parse_qsl, urlparse


class HTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        self.wfile.write(
            """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Realesgan Upscaler</title>
                <meta charset="UTF-8" />
                <style>
                .code-box {
                    margin: 10px;
                    padding: 10px 20px;
                    color: #eee;
                    background-color: #222;
                }
                .request-body {
                    margin-top: 40px;
                }
                </style>
            </head>
            <body>
            <h3>Request example: </h3>
            <div class="code-box">
                <p>POST http://127.0.0.1:8000/?upscale_ratio=2&mode=normal</p>
                <p>Content-Type: image/png</p>
                <p class="request-body">---Image Data---</p>
            </div>
            </body>
            </html>
            """.encode("utf-8")
        )
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Allow","GET, POST, OPTIONS")
        self.send_header('Access-Control-Allow-Headers', 'x-requested-with, accept, origin, content-type')
        self.end_headers()

    def do_POST(self):
        # Initial params
        img_buffer = None
        receive_file = ""
        upscaler_output_file = "output.png"
        model = Model.ESGAN_X4_PLUS_ANIME
        upscale_ratio = 4
        # Parse request
        if self.headers["Content-Type"] == "image/jpeg":
            receive_file = "raw.jpg"
        elif self.headers["Content-Type"] == "image/png":
            receive_file = "raw.png"
        elif self.headers["Content-Type"] == "image/webp":
            receive_file = "raw.webp"
        else:
            self.send_error(400, "Invalid Content-Type")
            return

        content_length = int(self.headers["Content-Length"])  # <--Retrieve size of request body
        if content_length == 0:
            self.send_error(400, "Missing Request body")
        post_data = self.rfile.read(content_length)  # <-- Restrieve request body itself
        img_buffer = post_data

        query_dict = parse_query(self.path)
        if query_dict.get("mode") is not None:
            model = (
                Model.ESGAN_X4_PLUS_ANIME
                if query_dict.get("mode").lower() == "anime"
                else Model.ESGAN_X4_PLUS
                if query_dict.get("mode").lower() == "normal"
                else model
            )
        if query_dict.get("upscale_ratio") is not None:
            upscale_ratio = (
                int(query_dict.get("upscale_ratio"))
                if int(query_dict.get("upscale_ratio")) in [2, 3, 4]
                else upscale_ratio
            )

        # Request body to disk
        with open(receive_file, "+wb") as raw_file_buffer:
            raw_file_buffer.write(img_buffer)
        # Upscale
        completed_process = run_upscaler(
            input_path=receive_file,
            output_path=upscaler_output_file,
            model=model,
            upscale_ratio=upscale_ratio,
        )
        if(completed_process.returncode != 0):
            self.send_error(400, completed_process.stderr.decode())
        # Write upscale image to response body
        self.send_response(200)
        self.send_header("Content-type", "image/png")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        if completed_process:
            with open(upscaler_output_file, "rb") as img_result_buffer:
                img_data = img_result_buffer.read()
                self.wfile.write(img_data)


def parse_query(url: str) -> dict[str, str]:
    query_tuple_list = parse_qsl(urlparse(url).params)
    query_dict = {}
    for k, v in query_tuple_list:
        query_dict[k] = v
    return query_dict


def run_server(server_class=HTTPServer, handler_class=HTTPRequestHandler, port=8000):
    server_address = ("127.0.0.1", port)
    with server_class(server_address, handler_class) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
        httpd.server_close()


class Model(str, Enum):
    ESGAN_ANIME_VIDEO_V3 = "realesr-animevideov3"
    ESGAN_X4_PLUS = "realesrgan-x4plus"
    ESGAN_X4_PLUS_ANIME = "realesrgan-x4plus-anime"
    ESRNET_X4_PLUS = "realesrnet-x4plus"

    def __str__(self) -> str:
        return self.value


def run_upscaler(
    input_path: str,
    output_path: str = "output.png",
    model: Model = Model.ESGAN_ANIME_VIDEO_V3,
    upscale_ratio: 2 | 3 | 4 = 4,
) -> subprocess.CompletedProcess[bytes]:
    """
    REALESGAN-NCNN-VULKAN subprocess
    """
    if input_path.find(" ") != -1:
        input_path = '"' + input_path + '"'

    if output_path.find(" ") != -1:
        output_path = '"' + output_path + '"'

    return subprocess.run(
        f"./realesrgan-ncnn-vulkan.exe -i {input_path} -o {output_path} -n {model} -s {upscale_ratio}",
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )


if __name__ == "__main__":
    dir = os.path.dirname(os.path.realpath(__file__))
    os.chdir(dir)

    # upscale("input.jpg", model=Model.ESGAN_X4_PLUS_ANIME)

    run_server(handler_class=HTTPRequestHandler)
```