<template>
  <div class="random-color-tool">
    <div class="tool-header">
      <h3><i class="fas fa-palette"></i> 随机颜色生成器</h3>
      <p>生成随机颜色，支持多种格式和调色方案</p>
    </div>

    <div class="tool-content">
      <div class="generation-controls">
        <div class="control-group">
          <label for="colorSpace">颜色空间</label>
          <select id="colorSpace" v-model="colorSpace">
            <option value="hex">HEX</option>
            <option value="rgb">RGB</option>
            <option value="hsl">HSL</option>
            <option value="hsv">HSV</option>
          </select>
        </div>
        
        <div class="control-group">
          <label for="scheme">配色方案</label>
          <select id="scheme" v-model="scheme">
            <option value="random">完全随机</option>
            <option value="warm">暖色调</option>
            <option value="cool">冷色调</option>
            <option value="pastel">柔和色调</option>
            <option value="vibrant">鲜艳色调</option>
            <option value="monochrome">单色调</option>
            <option value="analogous">相似色</option>
            <option value="complementary">互补色</option>
            <option value="triadic">三色调和</option>
          </select>
        </div>
        
        <div class="control-group">
          <label for="count">生成数量</label>
          <input type="number" id="count" v-model.number="count" min="1" max="50" />
        </div>
        
        <div class="control-group">
          <label for="includeNames">包含颜色名称</label>
          <input type="checkbox" id="includeNames" v-model="includeNames" />
        </div>
      </div>

      <div class="actions">
        <button @click="generateColors" class="btn-primary">
          <i class="fas fa-palette"></i> 生成颜色
        </button>
        <button @click="exportColors" class="btn-secondary" :disabled="!colors.length">
          <i class="fas fa-download"></i> 导出色板
        </button>
        <button @click="copyAllColors" class="btn-secondary" :disabled="!colors.length">
          <i class="fas fa-copy"></i> 复制全部
        </button>
        <button @click="clearHistory" class="btn-secondary" :disabled="!favoriteColors.length">
          <i class="fas fa-trash"></i> 清空收藏
        </button>
      </div>

      <div class="colors-display" v-if="colors.length">
        <h4>生成的颜色 ({{ colors.length }})</h4>
        <div class="colors-grid">
          <div v-for="(color, index) in colors" :key="index" class="color-card">
            <div class="color-preview" :style="{ backgroundColor: color.hex }">
              <div class="color-overlay">
                <button @click="copyColor(color)" class="copy-btn" title="复制颜色值">
                  <i class="fas fa-copy"></i>
                </button>
                <button @click="addToFavorites(color)" class="favorite-btn" 
                        :class="{ active: isFavorite(color) }"
                        :title="isFavorite(color) ? '取消收藏' : '添加收藏'">
                  <i class="fas fa-heart"></i>
                </button>
              </div>
            </div>
            
            <div class="color-info">
              <div class="color-values">
                <div class="color-value">
                  <strong>HEX:</strong> {{ color.hex }}
                </div>
                <div class="color-value">
                  <strong>RGB:</strong> {{ color.rgb }}
                </div>
                <div class="color-value">
                  <strong>HSL:</strong> {{ color.hsl }}
                </div>
                <div v-if="colorSpace === 'hsv'" class="color-value">
                  <strong>HSV:</strong> {{ color.hsv }}
                </div>
              </div>
              
              <div v-if="includeNames && color.name" class="color-name">
                <strong>名称:</strong> {{ color.name }}
              </div>
              
              <div class="color-meta">
                <span class="brightness-tag" :class="getBrightnessClass(color.brightness)">
                  {{ getBrightnessText(color.brightness) }}
                </span>
                <span class="scheme-tag">{{ getSchemeText(scheme) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="favorites-section" v-if="favoriteColors.length">
        <h4>收藏的颜色 ({{ favoriteColors.length }})</h4>
        <div class="favorites-grid">
          <div v-for="(color, index) in favoriteColors" :key="index" class="favorite-color">
            <div class="favorite-preview" :style="{ backgroundColor: color.hex }"></div>
            <div class="favorite-info">
              <div class="favorite-hex">{{ color.hex }}</div>
              <div class="favorite-scheme">{{ getSchemeText(color.scheme) }}</div>
            </div>
            <button @click="removeFromFavorites(index)" class="remove-btn" title="移除">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'RandomColor',
  setup() {
    const colorSpace = ref('hex')
    const scheme = ref('random')
    const count = ref(6)
    const includeNames = ref(false)
    const colors = ref([])
    const favoriteColors = ref([])

    // 颜色名称数据库（简化版）
    const colorNames = {
      '#FF0000': '红色', '#00FF00': '绿色', '#0000FF': '蓝色',
      '#FFFF00': '黄色', '#FF00FF': '紫红色', '#00FFFF': '青色',
      '#FFA500': '橙色', '#800080': '紫色', '#FFC0CB': '粉色',
      '#A52A2A': '棕色', '#808080': '灰色', '#000000': '黑色',
      '#FFFFFF': '白色', '#F0F8FF': '淡蓝色', '#FAEBD7': '古董白'
    }

    const generateRandomColor = () => {
      let hue, saturation, lightness
      
      switch (scheme.value) {
        case 'warm':
          hue = Math.random() * 120 + 330 // 红黄色系
          if (hue > 360) hue -= 360
          break
        case 'cool':
          hue = Math.random() * 120 + 180 // 蓝绿色系
          break
        case 'pastel':
          hue = Math.random() * 360
          saturation = Math.random() * 30 + 20 // 低饱和度
          lightness = Math.random() * 20 + 70 // 高亮度
          break
        case 'vibrant':
          hue = Math.random() * 360
          saturation = Math.random() * 30 + 70 // 高饱和度
          lightness = Math.random() * 30 + 40 // 中等亮度
          break
        case 'monochrome':
          hue = colors.value.length > 0 ? colors.value[0].h : Math.random() * 360
          saturation = Math.random() * 100
          lightness = Math.random() * 100
          break
        default:
          hue = Math.random() * 360
          saturation = Math.random() * 100
          lightness = Math.random() * 100
      }
      
      if (saturation === undefined) saturation = Math.random() * 100
      if (lightness === undefined) lightness = Math.random() * 100
      
      return generateColorFromHSL(hue, saturation, lightness)
    }

    const generateColorFromHSL = (h, s, l) => {
      const hslToRgb = (h, s, l) => {
        h /= 360; s /= 100; l /= 100
        const c = (1 - Math.abs(2 * l - 1)) * s
        const x = c * (1 - Math.abs((h * 6) % 2 - 1))
        const m = l - c / 2
        let r, g, b
        
        if (h < 1/6) [r, g, b] = [c, x, 0]
        else if (h < 2/6) [r, g, b] = [x, c, 0]
        else if (h < 3/6) [r, g, b] = [0, c, x]
        else if (h < 4/6) [r, g, b] = [0, x, c]
        else if (h < 5/6) [r, g, b] = [x, 0, c]
        else [r, g, b] = [c, 0, x]
        
        return [
          Math.round((r + m) * 255),
          Math.round((g + m) * 255),
          Math.round((b + m) * 255)
        ]
      }
      
      const [r, g, b] = hslToRgb(h, s, l)
      const hex = `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`
      const rgb = `rgb(${r}, ${g}, ${b})`
      const hsl = `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`
      
      // HSV 转换
      const rgbToHsv = (r, g, b) => {
        r /= 255; g /= 255; b /= 255
        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const diff = max - min
        
        let h_hsv = 0
        if (diff !== 0) {
          if (max === r) h_hsv = ((g - b) / diff) % 6
          else if (max === g) h_hsv = (b - r) / diff + 2
          else h_hsv = (r - g) / diff + 4
        }
        h_hsv = Math.round(h_hsv * 60)
        if (h_hsv < 0) h_hsv += 360
        
        const s_hsv = max === 0 ? 0 : Math.round((diff / max) * 100)
        const v = Math.round(max * 100)
        
        return [h_hsv, s_hsv, v]
      }
      
      const [h_hsv, s_hsv, v] = rgbToHsv(r, g, b)
      const hsv = `hsv(${h_hsv}, ${s_hsv}%, ${v}%)`
      
      // 计算亮度
      const brightness = (r * 299 + g * 587 + b * 114) / 1000 / 255
      
      // 寻找最接近的颜色名称
      let name = ''
      if (includeNames.value) {
        let minDistance = Infinity
        for (const [colorHex, colorName] of Object.entries(colorNames)) {
          const distance = calculateColorDistance(hex, colorHex)
          if (distance < minDistance) {
            minDistance = distance
            name = colorName
          }
        }
      }
      
      return {
        hex: hex.toUpperCase(),
        rgb,
        hsl,
        hsv,
        h: Math.round(h),
        s: Math.round(s),
        l: Math.round(l),
        brightness,
        name,
        scheme: scheme.value
      }
    }

    const calculateColorDistance = (color1, color2) => {
      const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return [r, g, b]
      }
      
      const [r1, g1, b1] = hexToRgb(color1)
      const [r2, g2, b2] = hexToRgb(color2)
      
      return Math.sqrt((r2-r1)**2 + (g2-g1)**2 + (b2-b1)**2)
    }

    const generateColors = () => {
      colors.value = []
      
      if (scheme.value === 'analogous') {
        const baseHue = Math.random() * 360
        for (let i = 0; i < count.value; i++) {
          const hue = (baseHue + i * 30) % 360
          const saturation = Math.random() * 40 + 50
          const lightness = Math.random() * 40 + 30
          colors.value.push(generateColorFromHSL(hue, saturation, lightness))
        }
      } else if (scheme.value === 'complementary') {
        const baseHue = Math.random() * 360
        for (let i = 0; i < count.value; i++) {
          const hue = i % 2 === 0 ? baseHue : (baseHue + 180) % 360
          const saturation = Math.random() * 40 + 50
          const lightness = Math.random() * 40 + 30
          colors.value.push(generateColorFromHSL(hue, saturation, lightness))
        }
      } else if (scheme.value === 'triadic') {
        const baseHue = Math.random() * 360
        for (let i = 0; i < count.value; i++) {
          const hue = (baseHue + (i % 3) * 120) % 360
          const saturation = Math.random() * 40 + 50
          const lightness = Math.random() * 40 + 30
          colors.value.push(generateColorFromHSL(hue, saturation, lightness))
        }
      } else {
        for (let i = 0; i < count.value; i++) {
          colors.value.push(generateRandomColor())
        }
      }
    }

    const copyColor = async (color) => {
      const colorValue = color[colorSpace.value] || color.hex
      try {
        await navigator.clipboard.writeText(colorValue)
        // 简单的成功提示
        const button = event.target.closest('button')
        if (button) {
          button.style.transform = 'scale(0.95)'
          setTimeout(() => {
            button.style.transform = 'scale(1)'
          }, 150)
        }
      } catch (error) {
        console.error('复制失败:', error)
      }
    }

    const copyAllColors = async () => {
      const colorList = colors.value.map(color => {
        const value = color[colorSpace.value] || color.hex
        return includeNames.value && color.name ? `${value} (${color.name})` : value
      }).join('\n')
      
      try {
        await navigator.clipboard.writeText(colorList)
        alert('所有颜色已复制到剪贴板！')
      } catch (error) {
        console.error('复制失败:', error)
      }
    }

    const exportColors = () => {
      const exportData = {
        colors: colors.value,
        settings: {
          colorSpace: colorSpace.value,
          scheme: scheme.value,
          includeNames: includeNames.value
        },
        generatedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `colors_${scheme.value}_${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    }

    const addToFavorites = (color) => {
      const exists = favoriteColors.value.some(fav => fav.hex === color.hex)
      if (exists) {
        favoriteColors.value = favoriteColors.value.filter(fav => fav.hex !== color.hex)
      } else {
        favoriteColors.value.push({ ...color })
      }
    }

    const isFavorite = (color) => {
      return favoriteColors.value.some(fav => fav.hex === color.hex)
    }

    const removeFromFavorites = (index) => {
      favoriteColors.value.splice(index, 1)
    }

    const clearHistory = () => {
      if (confirm('确定要清空所有收藏的颜色吗？')) {
        favoriteColors.value = []
      }
    }

    const getBrightnessClass = (brightness) => {
      if (brightness < 0.3) return 'dark'
      if (brightness > 0.7) return 'light'
      return 'medium'
    }

    const getBrightnessText = (brightness) => {
      if (brightness < 0.3) return '深色'
      if (brightness > 0.7) return '浅色'
      return '中等'
    }

    const getSchemeText = (schemeValue) => {
      const schemeMap = {
        random: '随机',
        warm: '暖色调',
        cool: '冷色调',
        pastel: '柔和色调',
        vibrant: '鲜艳色调',
        monochrome: '单色调',
        analogous: '相似色',
        complementary: '互补色',
        triadic: '三色调和'
      }
      return schemeMap[schemeValue] || schemeValue
    }

    return {
      colorSpace,
      scheme,
      count,
      includeNames,
      colors,
      favoriteColors,
      generateColors,
      copyColor,
      copyAllColors,
      exportColors,
      addToFavorites,
      isFavorite,
      removeFromFavorites,
      clearHistory,
      getBrightnessClass,
      getBrightnessText,
      getSchemeText
    }
  }
}
</script>

<style scoped>
.random-color-tool {
  max-width: 1200px;
  margin: 0 auto;
}

.tool-header {
  text-align: center;
  margin-bottom: 2rem;
}

.tool-header h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.tool-header p {
  color: var(--text-secondary);
}

.generation-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.control-group {
  display: flex;
  flex-direction: column;
}

.control-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.control-group select,
.control-group input[type="number"] {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.control-group input[type="checkbox"] {
  width: 20px;
  height: 20px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--accent-color);
  color: white;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.colors-display h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.color-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.color-preview {
  height: 120px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-overlay {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.color-preview:hover .color-overlay {
  opacity: 1;
}

.copy-btn,
.favorite-btn {
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.favorite-btn.active {
  color: #e74c3c;
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.2);
}

.copy-btn:hover,
.favorite-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.color-info {
  padding: 1rem;
}

.color-values {
  margin-bottom: 0.5rem;
}

.color-value {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  color: var(--text-secondary);
  font-family: monospace;
}

.color-name {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.color-meta {
  display: flex;
  gap: 0.5rem;
}

.brightness-tag,
.scheme-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
}

.brightness-tag.dark {
  color: #2c3e50;
  border-color: #2c3e50;
}

.brightness-tag.medium {
  color: #f39c12;
  border-color: #f39c12;
}

.brightness-tag.light {
  color: #3498db;
  border-color: #3498db;
}

.favorites-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.favorites-section h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.favorite-color {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background: var(--bg-primary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.favorite-preview {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.favorite-info {
  flex: 1;
}

.favorite-hex {
  font-weight: 500;
  color: var(--text-primary);
  font-family: monospace;
}

.favorite-scheme {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.remove-btn {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  color: #e74c3c;
  border-color: #e74c3c;
}
</style> 