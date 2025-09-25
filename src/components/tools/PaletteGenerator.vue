<template>
  <div class="palette-generator-container">
    <div class="tool-header">
      <h2>🎨 Palette Maker</h2>
      <p>自动配色调色板生成器</p>
    </div>

    <div class="base-color-section">
      <div class="base-color-input">
        <label>基础颜色</label>
        <div class="color-input-wrapper">
          <input type="color" v-model="baseColor" @input="generatePalettes" class="color-picker">
          <input type="text" v-model="baseColor" @input="generatePalettes" class="color-text" placeholder="#FF5733">
        </div>
      </div>

      <div class="harmony-selector">
        <label>配色方案</label>
        <select v-model="selectedHarmony" @change="generatePalettes" class="harmony-select">
          <option value="monochromatic">单色配色</option>
          <option value="analogous">相邻配色</option>
          <option value="complementary">互补配色</option>
          <option value="triadic">三角配色</option>
          <option value="tetradic">四角配色</option>
          <option value="splitComplementary">分离互补</option>
        </select>
      </div>
    </div>

    <div class="palettes-display">
      <div v-for="(palette, index) in palettes" :key="index" class="palette-section">
        <div class="palette-header">
          <h3>{{ palette.name }}</h3>
          <button @click="copyPalette(palette)" class="copy-palette-btn">📋 复制调色板</button>
        </div>
        <div class="color-row">
          <div 
            v-for="(color, colorIndex) in palette.colors" 
            :key="colorIndex"
            class="color-item"
            @click="copyColor(color)"
          >
            <div class="color-square" :style="{ backgroundColor: color }"></div>
            <div class="color-info">
              <span class="color-hex">{{ color.toUpperCase() }}</span>
              <span class="color-rgb">{{ hexToRgb(color) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="random-palettes">
      <div class="random-header">
        <h3>随机调色板</h3>
        <button @click="generateRandomPalettes" class="generate-btn">🎲 生成随机</button>
      </div>
      <div class="random-grid">
        <div 
          v-for="(randomPalette, index) in randomPalettes" 
          :key="index"
          class="random-palette"
          @click="useRandomPalette(randomPalette)"
        >
          <div class="random-colors">
            <div 
              v-for="color in randomPalette" 
              :key="color"
              class="random-color"
              :style="{ backgroundColor: color }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="export-section">
      <h3>导出格式</h3>
      <div class="export-options">
        <button @click="exportAsCSS" class="export-btn">CSS 变量</button>
        <button @click="exportAsSass" class="export-btn">SCSS 变量</button>
        <button @click="exportAsJSON" class="export-btn">JSON 格式</button>
        <button @click="exportAsASE" class="export-btn">Adobe ASE</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'PaletteGenerator',
  setup() {
    const baseColor = ref('#3B82F6')
    const selectedHarmony = ref('analogous')
    const palettes = ref([])
    const randomPalettes = ref([])

    const generatePalettes = () => {
      palettes.value = []
      
      switch (selectedHarmony.value) {
        case 'monochromatic':
          palettes.value.push(generateMonochromatic())
          break
        case 'analogous':
          palettes.value.push(generateAnalogous())
          break
        case 'complementary':
          palettes.value.push(generateComplementary())
          break
        case 'triadic':
          palettes.value.push(generateTriadic())
          break
        case 'tetradic':
          palettes.value.push(generateTetradic())
          break
        case 'splitComplementary':
          palettes.value.push(generateSplitComplementary())
          break
      }
    }

    const generateMonochromatic = () => {
      const hsl = hexToHsl(baseColor.value)
      const colors = []
      
      for (let i = 0; i < 5; i++) {
        const lightness = Math.max(10, Math.min(90, hsl.l + (i - 2) * 15))
        colors.push(hslToHex(hsl.h, hsl.s, lightness))
      }
      
      return { name: '单色配色', colors }
    }

    const generateAnalogous = () => {
      const hsl = hexToHsl(baseColor.value)
      const colors = []
      
      for (let i = -2; i <= 2; i++) {
        const hue = (hsl.h + i * 30 + 360) % 360
        colors.push(hslToHex(hue, hsl.s, hsl.l))
      }
      
      return { name: '相邻配色', colors }
    }

    const generateComplementary = () => {
      const hsl = hexToHsl(baseColor.value)
      const complementHue = (hsl.h + 180) % 360
      
      return {
        name: '互补配色',
        colors: [
          baseColor.value,
          hslToHex(complementHue, hsl.s, hsl.l),
          hslToHex(hsl.h, hsl.s, Math.max(10, hsl.l - 20)),
          hslToHex(complementHue, hsl.s, Math.max(10, hsl.l - 20)),
          hslToHex(hsl.h, Math.max(10, hsl.s - 30), Math.min(90, hsl.l + 20))
        ]
      }
    }

    const generateTriadic = () => {
      const hsl = hexToHsl(baseColor.value)
      const colors = []
      
      for (let i = 0; i < 3; i++) {
        const hue = (hsl.h + i * 120) % 360
        colors.push(hslToHex(hue, hsl.s, hsl.l))
        // 添加变化
        colors.push(hslToHex(hue, Math.max(10, hsl.s - 20), Math.min(90, hsl.l + 15)))
      }
      
      return { name: '三角配色', colors: colors.slice(0, 6) }
    }

    const generateTetradic = () => {
      const hsl = hexToHsl(baseColor.value)
      const colors = []
      
      for (let i = 0; i < 4; i++) {
        const hue = (hsl.h + i * 90) % 360
        colors.push(hslToHex(hue, hsl.s, hsl.l))
      }
      
      // 添加中性色
      colors.push(hslToHex(hsl.h, 10, 85))
      
      return { name: '四角配色', colors }
    }

    const generateSplitComplementary = () => {
      const hsl = hexToHsl(baseColor.value)
      const complement = (hsl.h + 180) % 360
      
      return {
        name: '分离互补',
        colors: [
          baseColor.value,
          hslToHex((complement - 30 + 360) % 360, hsl.s, hsl.l),
          hslToHex((complement + 30) % 360, hsl.s, hsl.l),
          hslToHex(hsl.h, Math.max(10, hsl.s - 40), Math.min(90, hsl.l + 25)),
          hslToHex(complement, Math.max(10, hsl.s - 20), Math.max(10, hsl.l - 20))
        ]
      }
    }

    const generateRandomPalettes = () => {
      randomPalettes.value = []
      
      for (let i = 0; i < 6; i++) {
        const palette = []
        const baseHue = Math.random() * 360
        
        for (let j = 0; j < 5; j++) {
          const hue = (baseHue + Math.random() * 60 - 30 + 360) % 360
          const saturation = 40 + Math.random() * 50
          const lightness = 30 + Math.random() * 50
          palette.push(hslToHex(hue, saturation, lightness))
        }
        
        randomPalettes.value.push(palette)
      }
    }

    const useRandomPalette = (palette) => {
      baseColor.value = palette[0]
      generatePalettes()
    }

    const copyColor = async (color) => {
      try {
        await navigator.clipboard.writeText(color)
        console.log('已复制颜色:', color)
      } catch (err) {
        console.error('复制失败:', err)
      }
    }

    const copyPalette = async (palette) => {
      const colors = palette.colors.join(', ')
      try {
        await navigator.clipboard.writeText(colors)
        console.log('已复制调色板')
      } catch (err) {
        console.error('复制失败:', err)
      }
    }

    const exportAsCSS = () => {
      let css = ':root {\n'
      palettes.value.forEach((palette, paletteIndex) => {
        palette.colors.forEach((color, colorIndex) => {
          css += `  --color-${paletteIndex}-${colorIndex}: ${color};\n`
        })
      })
      css += '}'
      
      downloadFile('palette.css', css)
    }

    const exportAsSass = () => {
      let sass = ''
      palettes.value.forEach((palette, paletteIndex) => {
        palette.colors.forEach((color, colorIndex) => {
          sass += `$color-${paletteIndex}-${colorIndex}: ${color};\n`
        })
      })
      
      downloadFile('palette.scss', sass)
    }

    const exportAsJSON = () => {
      const json = JSON.stringify(palettes.value, null, 2)
      downloadFile('palette.json', json)
    }

    const exportAsASE = () => {
      // Implementation for exporting as Adobe ASE
    }

    const downloadFile = (filename, content) => {
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }

    // 颜色转换工具函数
    const hexToHsl = (hex) => {
      const rgb = hexToRgbValue(hex)
      return rgbToHsl(rgb.r, rgb.g, rgb.b)
    }

    const hslToHex = (h, s, l) => {
      const rgb = hslToRgb(h, s, l)
      return rgbToHex(rgb.r, rgb.g, rgb.b)
    }

    const hexToRgbValue = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 }
    }

    const rgbToHex = (r, g, b) => {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
    }

    const rgbToHsl = (r, g, b) => {
      r /= 255
      g /= 255
      b /= 255
      
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h, s, l = (max + min) / 2
      
      if (max === min) {
        h = s = 0
      } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break
          case g: h = (b - r) / d + 2; break
          case b: h = (r - g) / d + 4; break
        }
        h /= 6
      }
      
      return { h: h * 360, s: s * 100, l: l * 100 }
    }

    const hslToRgb = (h, s, l) => {
      h /= 360
      s /= 100
      l /= 100
      
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }
      
      let r, g, b
      
      if (s === 0) {
        r = g = b = l
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hue2rgb(p, q, h + 1/3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1/3)
      }
      
      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
      }
    }

    const hexToRgb = (hex) => {
      const rgb = hexToRgbValue(hex)
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    }

    onMounted(() => {
      generatePalettes()
      generateRandomPalettes()
    })

    return {
      baseColor,
      selectedHarmony,
      palettes,
      randomPalettes,
      generatePalettes,
      generateRandomPalettes,
      useRandomPalette,
      copyColor,
      copyPalette,
      exportAsCSS,
      exportAsSass,
      exportAsJSON,
      exportAsASE,
      hexToRgb
    }
  }
}
</script>

<style scoped>
.palette-generator-container {
  max-width: 100%;
  padding: 10px;
}

.tool-header {
  text-align: center;
  margin-bottom: 10px;
  padding: 10px;
}

.tool-header h2 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.tool-header p {
  margin: 0;
  color: var(--text-muted);
}

.base-color-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 10px;
  padding: 1.5rem;
  background: var(--bg-surface);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.base-color-input label,
.harmony-selector label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.color-input-wrapper {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.color-picker {
  width: 60px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.color-text {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: 'Courier New', monospace;
}

.harmony-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.palettes-display {
  margin-bottom: 10px;
}

.palette-section {
  margin-bottom: 10px;
  padding: 1.5rem;
  background: var(--bg-surface);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.palette-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.palette-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.copy-palette-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.copy-palette-btn:hover {
  background: var(--bg-hover);
}

.color-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.color-item {
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-item:hover {
  transform: translateY(-2px);
}

.color-square {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  margin-bottom: 0.5rem;
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.color-hex {
  font-family: 'Courier New', monospace;
  font-weight: 500;
  color: var(--text-primary);
}

.color-rgb {
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.random-palettes {
  margin-bottom: 10px;
}

.random-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.random-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.generate-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.generate-btn:hover {
  background: var(--bg-hover);
}

.random-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.random-palette {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid var(--border-color);
  transition: transform 0.2s;
}

.random-palette:hover {
  transform: scale(1.02);
}

.random-colors {
  display: flex;
  height: 60px;
}

.random-color {
  flex: 1;
}

.export-section {
  padding: 1.5rem;
  background: var(--bg-surface);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.export-section h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.export-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.export-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.export-btn:hover {
  background: var(--bg-hover);
}

@media (max-width: 768px) {
  .base-color-section {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .color-row {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
  
  .palette-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .export-options {
    flex-direction: column;
  }
}
</style> 