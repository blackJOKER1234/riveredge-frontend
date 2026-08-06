# 颜色映射表：TailwindCSS → Ant Design Token

## 颜色映射规则

### 文字颜色

| TailwindCSS 模式 | Hex 值 | Ant Design Token | Token 值 |
|------------------|--------|------------------|----------|
| text-[#1F1F1F] | #1F1F1F | token.colorMenuItemIcon | #1F1F1F |
| text-[#ADADAD] | #ADADAD | token.colorTipsText | #ADADADFF |
| text-[#0958D9] | #0958D9 | token.colorPrimary | #0958D9FF |
| text-[#FF4D4F] | #FF4D4F | token.colorError | #FF4D4FFF |
| text-[#000000E0] | #000000E0 | token.colorBodyText | #000000E0 |
| text-[#00000072] | #00000072 | 使用 rgba(0,0,0,0.45) | - |
| text-[#CCCCCC] | #CCCCCC | token.gray["gray 20%"] | #CCCCCC |
| text-[#858585] | #858585 | token.gray["gray 48%"] | #858585 |
| text-[#818283FF] | #818283FF | token.gray["gray 50%"] | #808080 |
| text-[#0000007A] | #0000007A | 使用 rgba(0,0,0,0.48) | - |
| text-[#52C41A] | #52C41A | token.colorSuccess | #52C41AFF |
| text-[#FA6843] | #FA6843 | 使用 token.orange.scale.orange3 | #FA8C16 |

### 背景颜色

| TailwindCSS 模式 | Hex 值 | Ant Design Token | Token 值 |
|------------------|--------|------------------|----------|
| bg-[#F3F5F7] | #F3F5F7 | token.other.pageBg | #F3F5F7 |
| bg-[#F5F5F5] | #F5F5F5 | token.gray["gray 4%"] | #F5F5F5 |
| bg-[#FFFFFF] | #FFFFFF | token.colorWhite | #FFFFFF |
| bg-[#F7F7F7] | #F7F7F7 | token.other.uploadBg | #F8F9FB |
| bg-[#FBFBFB] | #FBFBFB | token.gray["gray 2%"] | #FAFAFA |
| bg-[#F8F9FB] | #F8F9FB | token.other.darkGrayBg | #F8F9FB |
| bg-[#FAFBFC] | #FAFBFC | token.modalBg | #FAFBFC |
| bg-[#00000005] | #00000005 | 使用 rgba(0,0,0,0.02) | - |
| bg-[#0000000A] | #0000000A | 使用 rgba(0,0,0,0.06) | - |
| bg-[#00000099] | #00000099 | 使用 rgba(0,0,0,0.6) | - |
| bg-[#E6E6E6] | #E6E6E6 | token.gray["gray 10%"] | #E5E5E5 |
| bg-[#1677FF] | #1677FF | 使用 token.colorPrimary | #0958D9FF |
| bg-[#0958D9] | #0958D9 | token.colorPrimary | #0958D9FF |
| bg-[#F5F8FE] | #F5F8FE | token.blue.scale.blue9 | #F5F9FE |

### 边框颜色

| TailwindCSS 模式 | Hex 值 | Ant Design Token | Token 值 |
|------------------|--------|------------------|----------|
| border-[#D9D9D9] | #D9D9D9 | token.colorBorder | #D9D9D9 |
| border-[#F0F0F0] | #F0F0F0 | token.gray["gray 6%"] | #F0F0F0 |
| border-[#FFFFFF] | #FFFFFF | token.colorWhite | #FFFFFF |
| border-[#FF4D4F] | #FF4D4F | token.colorError | #FF4D4FFF |
| border-[#ADADAD] | #ADADAD | token.colorTipsText | #ADADADFF |
| border-[#0958D9] | #0958D9 | token.colorPrimary | #0958D9FF |

### TailwindCSS 标准颜色类映射

| TailwindCSS 类 | Token 映射 |
|----------------|------------|
| text-gray-400 | 使用 token.gray["gray 40%"] 或直接设置 style={{ color: token.colorTipsText }} |
| text-gray-500 | 使用 token.gray["gray 55%"] 或 token.colorHeader |
| text-gray-600 | 使用 token.gray["gray 62%"] |
| text-gray-700 | 使用 token.gray["gray 72%"] |
| bg-gray-100 | 使用 token.gray["gray 8%"] 或 token.other.uploadBg |
| bg-gray-400/10 | 使用 rgba(0,0,0,0.06) |
| text-green-700 | 使用 token.green.scale.green2 |
| bg-green-100 | 使用 token.green.scale.green8 |
| text-red-500 | 使用 token.colorError |
| bg-blue-50 | 使用 token.blue.scale.blue9 |
| border-blue-400 | 使用 token.blue.scale.blue4 |
| text-blue-600 | 使用 token.blue.scale.blue3 |
| bg-blue-200 | 使用 token.blue.scale.blue6 |
| text-orange-600 | 使用 token.orange.scale.orange3 |
| bg-orange-50 | 使用 token.orange.scale.orange9 |

## 使用示例

### 替换前
```tsx
<span className="text-[#ADADAD]">提示文字</span>
<div className="bg-[#F3F5F7] p-4">内容</div>
<button className="text-[#0958D9] hover:text-[#0958D9FF]">按钮</button>
```

### 替换后
```tsx
import { useTheme } from "@/core";

const token = useTheme();

<span style={{ color: token.colorTipsText }}>提示文字</span>
<div style={{ backgroundColor: token.other.pageBg }} className="p-4">内容</div>
<button style={{ color: token.colorPrimary }}>按钮</button>
```

## 注意事项

1. 某些颜色没有直接对应的 token，需要使用 rgba 值或自定义
2. 优先使用语义化 token（colorPrimary, colorError 等）
3. 对于灰色系，使用 token.gray 中的值
4. 对于蓝色系，使用 token.blue 中的值
5. 对于绿色系，使用 token.green 中的值
6. 对于红色系，使用 token.red 中的值
7. 对于橙色系，使用 token.orange 中的值
