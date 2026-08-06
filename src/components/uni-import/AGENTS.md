# 通用导入组件 (uni-import)

## 全局 Agent 规范

以下规范对本目录及其子目录的所有 Agent 强制生效，优先级高于本文件其余内容。

### 回复语言与交互规范

1. 语言要求：全程使用简体中文回复；除代码片段、专有名词、引用原文外，默认不使用英文输出。
2. 需求回显（绝对强制，不得跳过）：每次用户输入后，首先输出需求回显区块，然后才能执行任何工具或读取任何文件。回显需按主题分类整理为清晰要点，并追加“我已了解规则”。
3. 输入纠错：能确定的输入问题自动修正；语义模糊、逻辑冲突、缺少关键信息或可能导致严重后果时，禁止猜测，必须向用户反问确认。
4. 询问机制：
   - 必须询问：语义模糊、逻辑冲突、重大技术决策（如框架选型、架构方案）。
   - 禁止询问：版本号、依赖库等可从项目文件自主获取的信息；明显可推断的同音字错误。

### 网页搜索

- `web_search` 失效时，改用 `ddg-search` MCP 进行搜索。

### Team 与 Agent 调用

- 探索型任务优先通过子 Agent 处理。
- 工具调用优先使用 haiku 模型；探索型任务与子 Agent 优先使用 haiku 或 `deepseek-v4-flash` 模型。

## 模块说明

统一数据导入组件，支持 Excel 导入、模板下载、映射配置与错误处理。

## 目录结构

```
uni-import/
├── index.tsx                       # 主组件/导出入口
├── UniImportToolbarButton.tsx      # 导入工具栏按钮
├── uni-import-custom-modal.tsx     # 自定义导入弹窗
├── uni-import-mapping-modal.tsx    # 字段映射弹窗
├── uni-import-preview-modal.tsx    # 预览弹窗
├── uni-import-relation-modal.tsx   # 关联关系弹窗
├── uni-import-sheet-host.tsx       # 表格宿主
├── uni-import-xlsx.ts              # Excel 解析
├── apply-import-mapping.ts         # 映射应用
├── build-import-cell-data.ts       # 单元格数据构建
├── build-import-template-file-name.ts # 模板文件名
└── import-preview-utils.ts         # 预览工具
```

## 核心功能

- 文件上传：支持 xlsx/csv 格式。
- 模板下载：按业务规则生成模板文件名。
- 数据预览：导入前预览与字段映射。
- 错误处理：错误行标记与修复。

## 约定

- Excel 解析与单元格构建逻辑集中在纯工具文件，弹窗内不重复解析。
- 弹窗通过主组件统一装配，页面侧优先调用 `UniImportToolbarButton`。
