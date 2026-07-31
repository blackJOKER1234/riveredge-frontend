// 判断字符串是否是UUID格式
export const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const calculateColorBrightness = (color: string): number => {
  if (!color || typeof color !== 'string') return 255; // 默认返回浅色

  // 处理十六进制颜色
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    // 处理 3 位十六进制（如 #fff）
    const fullHex = hex.length === 3
      ? hex.split('').map(c => c + c).join('')
      : hex;
    const r = parseInt(fullHex.slice(0, 2), 16);
    const g = parseInt(fullHex.slice(2, 4), 16);
    const b = parseInt(fullHex.slice(4, 6), 16);
    // 计算亮度 (使用相对亮度公式)
    return (r * 299 + g * 587 + b * 114) / 1000;
  }

  // 处理 rgb/rgba 格式
  if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g);
    if (match && match.length >= 3) {
      const r = parseInt(match[0]);
      const g = parseInt(match[1]);
      const b = parseInt(match[2]);
      return (r * 299 + g * 587 + b * 114) / 1000;
    }
  }

  return 255; // 默认返回浅色
};
