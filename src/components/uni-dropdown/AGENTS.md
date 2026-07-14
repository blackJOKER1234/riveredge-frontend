# uni-dropdown

## 说明
下拉快捷操作组件，提供快捷新建、高级搜索等下拉面板。

## 核心文件
- AdvancedSearchModal.tsx: 高级搜索弹窗
- QuickCreateAnchorPopover.tsx: 快捷创建浮层
- index.tsx: 下拉组件入口
- types.ts: 类型定义

## 开发要点
- 下拉面板位置自适应，避免越界
- 快捷创建需按模块动态注册入口
- 与 uni-query/uni-search 共享搜索协议
