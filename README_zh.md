# Gemini 电话语音生成器 (IVR Voice Generator)

一个专业的 Web 工具，利用 Google Gemini AI 生成电话答录机问候语和提示音。支持导出电话硬件所需的特定旧版格式 (WAV)。

## 功能特点
*   **AI 文本转语音**: 使用 `gemini-2.5-flash-preview-tts` 生成自然语音。
*   **安全部署**: API Key 存储在后端 (Vercel Serverless)，前端零泄露。
*   **电话格式支持**:
    *   音频降采样至 **5kHz** (用户需求) 或 **8kHz** (标准电话系统)。
    *   导出为 **.wav** 格式 (16-bit PCM)。
*   **双语界面**: 支持中文和英文。

## 开发与部署

### 1. 本地开发 (Local Development)
**注意**: 由于本项目使用了 Serverless Function (`api/tts.ts`) 来保护 Key，普通的 `npm run dev` **无法** 运行后端 API。

必须使用 **Vercel CLI** 进行本地开发：

1.  安装 Vercel CLI: `npm i -g vercel`
2.  拉取环境变量 (可选): `vercel env pull`
3.  **启动开发服务器**:
    ```bash
    vercel dev
    ```
    *(不要只运行 `npm run dev`，否则 /api/tts 请求会失败)*

### 2. 部署 (Deployment)
1.  Push 代码到 GitHub。
2.  在 Vercel Dashboard 导入项目。
3.  在 Vercel 项目设置中添加环境变量:
    *   `API_KEY`: 您的 Google Gemini API Key。

## 使用说明
1.  配置好环境变量后启动程序。
2.  输入您的问候语文本。
3.  选择声音和语速。
4.  点击 "生成 (Generate)"。
5.  试听并下载格式化后的 WAV 文件。