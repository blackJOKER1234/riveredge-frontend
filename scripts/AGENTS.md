# 脚本工具 (scripts/)

## 模块说明
构建辅助、代码生成、数据迁移等自动化脚本。

## 脚本分类
- **国际化生成**: generate_*_locale.py — 从 JSON 词表生成 locales 代码
- **代码迁移**: migrate/codemod *.mjs — 代码重构和约定迁移
- **数据辅助**: .json 文件为国际化词表数据源

## 开发要点
1. Python 脚本（`*.py`）用于国际化生成类任务
2. Node.js 脚本（`.mjs`/`.cjs`）用于代码迁移和重构
3. 脚本运行可能需要先安装依赖，注意 README 说明
4. 生成类脚本输出到 src/locales/generated/ 或 src/utils/generated/
5. 迁移脚本一次性使用，保留作历史参考
