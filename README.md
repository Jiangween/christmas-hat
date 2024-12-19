# AI 圣诞帽生成器

这是一个基于 Next.js 和 Stable Diffusion 的 AI 圣诞帽生成器，可以为任何图片中的人物或动物添加圣诞帽装饰。

## 功能特点

🎄 自动为图片添加圣诞帽

🎅 支持人物、动物等多种图片类型

✨ 保持原始图片风格

🎯 精确的帽子位置调整

💫 支持自定义提示词

## 本地开发

### 环境要求

Node.js 18+

pnpm

Stable Diffusion API Key

### 安装步骤

克隆项目

```Bash
git clone https://github.com/Jiangween/christmas-hat.git
cd christmas-hat
```

安装依赖

```Bash
pnpm install
```

\3. 配置环境变量

```Bash
cp .env.example .env.local
```

然后编辑 .env.local 文件，填入必要的配置：

```Bash
SD_API_KEY=your_api_key
SD_API_URL=your_api_url
NEXT_PUBLIC_DOMAIN=your_domain
```

创建必要的目录

```Bash
mkdir -p public/images
```

启动开发服务器

```Bash
pnpm dev
```

## API 使用

### 生成圣诞帽图片

```Bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/test.jpg","prompt": "可选的额外提示词"}' \
  https://curuszqlvenx.sealoshzh.site/api/image
```

响应格式：

```Bash
{
  "code": 200,
  "statusText": "success",
  "data": {
    "url": "生成的图片URL"
  }
}
```

## 技术栈

Next.js - React 框架

Stable Diffusion - AI 图像生成

Sharp - 图像处理

Axios - HTTP 客户端

## 注意事项

建议上传清晰的图片

图片会自动调整大小至 1024x1024

## License

MIT License - 详见 LICENSE 文件
