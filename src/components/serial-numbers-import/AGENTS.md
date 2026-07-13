# 序列号导入 (serial-numbers-import)

## 说明
批量导入序列号的弹窗和触发器，支持解析粘贴文本或文件上传。

## 核心文件
- SerialNumbersImportModal.tsx: 导入弹窗
- SerialNumbersImportTrigger.tsx: 导入触发按钮
- parseSerialNumbersImport.ts: 解析逻辑
- index.ts: 入口导出

## 开发要点
- 支持粘贴文本和 CSV/Excel 文件导入
- 解析后实时校验格式并反馈错误行
- 合法数据提交至后端保存
