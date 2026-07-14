# 登录页编辑器 (login-page-editor)

## 说明
可视化编辑登录页的背景、装饰、描述、域名和功能开关。

## 核心文件
- LoginBackgroundSettingsBlock.tsx: 背景设置
- LoginDecorationSettingsBlock.tsx: 装饰设置
- LoginDescriptionContent.tsx: 描述内容
- LoginDomainSettingsBlock.tsx: 域名设置
- LoginFeatureSwitchesBlock.tsx: 功能开关

## 开发要点
- 各模块独立，通过回调向上传递变更
- 预览效果实时同步
- 最终输出配置 JSON 供后端存储
