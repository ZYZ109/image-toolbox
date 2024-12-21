<!-- -*- coding: utf-8 -*- -->
# 图片工具箱

一个简单易用的在线图片处理工具集合，提供图片压缩、格式转换、尺寸调整等功能。

## 在线访问
访问地址：https://image-toolbox.vercel.app

## 功能特性

### 1. 图片压缩
- 支持批量上传（最多20张）
- 支持拖拽上传
- 智能压缩算法
  - JPEG/WEBP：最低10%质量
  - PNG（有透明）：保持最低60%质量
  - 小图片（<100KB）：保持最低70%质量
- 实时预览压缩效果
- 显示压缩前后的文件大小对比
- 支持单个下载和批量打包下载

### 2. 图片格式转换
- 支持多种格式互转（PNG、JPG、WEBP、GIF）
- 保持图片质量
- 智能处理透明通道

### 3. 图片尺寸调整
- 支持自定义像素调整
- 保持宽高比例
- 预设常用尺寸

## 技术实现

### 前端技术栈
- HTML5
- CSS3 (Flexbox & Grid)
- 原生 JavaScript (ES6+)
- 模块化开发

### 项目结构
```
.
├── index.html          # 主页面
├── css/               # 样式文件
│   ├── main.css       # 主样式
│   ├── components/    # 组件样式
│   └── pages/         # 页面样式
├── js/                # JavaScript 文件
│   ├── main.js        # 主逻辑
│   └── modules/       # 功能模块
│       ├── compressor.js  # 图片压缩模块
│       ├── converter.js   # 格式转换模块
│       └── resizer.js     # 尺寸调整模块
└── assets/            # 资源文件
    └── icons/         # 图标
```

### 核心功能实现
1. 图片压缩
   - 使用 Canvas API 进行图片压缩
   - 智能选择最佳压缩策略
   - 使用 Web Workers 处理大文件
   - JSZip 实现批量下载

2. 响应式设计
   - 使用 CSS Grid 和 Flexbox 布局
   - 适配移动端和桌面端
   - 流畅的动画效果

## 浏览器支持
- Chrome (推荐)
- Firefox
- Safari
- Edge

## 本地开发

1. 克隆项目
```bash
git clone https://github.com/ZYZ109/image-toolbox.git
cd image-toolbox
```

2. 使用本地服务器运行
```bash
# 使用 Python 的简单服务器
python -m http.server 8000
# 或使用 VS Code 的 Live Server 插件
```

3. 访问 `http://localhost:8000`

## 注意事项
- 文件大小限制：单个文件最大 10MB
- 批量处理限制：最多同时处理 20 张图片
- 支持的图片格式：JPG、PNG、WEBP、GIF
- 所有处理都在浏览器本地完成，不会上传到服务器

## 贡献指南
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 开源协议
MIT License