# AI 助手 (ai-assistant)

## 说明
AI 助手组件，支持 Markdown 渲染和智能对话交互。

## 核心文件
- AiAssistantMarkdown.tsx: Markdown 渲染
- index.tsx: 助手主组件
- index.less: 样式

## 开发要点
- Markdown 渲染注意 XSS 防护
- 流式输出时保持光标跟随
- 对话上下文通过 Zustand 管理
