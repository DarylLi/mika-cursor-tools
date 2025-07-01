<template>
  <div class="color-picker-container">
    <div class="tool-header">
      <h2>🎨 Color Picker</h2>
      <p>取色并复制十六进制颜色值</p>
    </div>

    <div class="color-inputs">
      <div class="color-input-section">
        <label>颜色选择器</label>
        <div class="color-picker-wrapper">
          <input 
            type="color" 
            v-model="currentColor" 
            class="color-input"
            @input="updateColor"
          >
          <div class="color-display" :style="{ backgroundColor: currentColor }"></div>
        </div>
      </div>

      <div class="manual-input-section">
        <label>手动输入</label>
        <input 
          type="text" 
          v-model="hexInput" 
          placeholder="#FF5733"
          @input="updateFromHex"
          class="hex-input"
        >
      </div>
    </div>

    <div class="color-info">
      <h3>颜色信息</h3>
      <div class="color-formats">
        <div class="format-item" @click="copyToClipboard(colorData.hex, 'HEX')">
          <span class="format-label">HEX:</span>
          <span class="format-value">{{ colorData.hex }}</span>
          <button class="copy-btn">📋</button>
        </div>
        <div class="format-item" @click="copyToClipboard(colorData.rgb, 'RGB')">
          <span class="format-label">RGB:</span>
          <span class="format-value">{{ colorData.rgb }}</span>
          <button class="copy-btn">📋</button>
        </div>
        <div class="format-item" @click="copyToClipboard(colorData.hsl, 'HSL')">
          <span class="format-label">HSL:</span>
          <span class="format-value">{{ colorData.hsl }}</span>
          <button class="copy-btn">📋</button>
        </div>
        <div class="format-item" @click="copyToClipboard(colorData.hsv, 'HSV')">
          <span class="format-label">HSV:</span>
          <span class="format-value">{{ colorData.hsv }}</span>
          <button class="copy-btn">📋</button>
        </div>
      </div>
    </div>

    <div class="color-palette">
      <h3>相似色调</h3>
      <div class="palette-grid">
        <div 
          v-for="(color, index) in similarColors" 
          :key="index"
          class="palette-color"
          :style="{ backgroundColor: color }"
          @click="selectColor(color)"
          :title="color"
        ></div>
      </div>
    </div>

    <div class="saved-colors">
      <h3>保存的颜色</h3>
      <div class="actions">
        <button @click="saveColor" class="save-btn">保存当前颜色</button>
        <button @click="clearSaved" class="clear-btn">清空保存</button>
      </div>
      <div class="saved-grid">
        <div 
          v-for="(color, index) in savedColors" 
          :key="index"
          class="saved-color"
          :style="{ backgroundColor: color }"
          @click="selectColor(color)"
          @dblclick="removeSavedColor(index)"
          :title="`${color} (双击删除)`"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'ColorPicker',
  setup() {
    const currentColor = ref('#FF5733')
    const hexInput = ref('#FF5733')
    const savedColors = ref([])

    const colorData = computed(() => {
      const hex = currentColor.value
      const rgb = hexToRgb(hex)
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
      
      return {
        hex: hex.toUpperCase(),
        rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
        hsv: `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`
      }
    })

    const similarColors = computed(() => {
      const base = hexToRgb(currentColor.value)
      const colors = []
      
      // 生成相似色调
      for (let i = 0; i < 12; i++) {
        const factor = (i - 6) * 0.1
        const r = Math.max(0, Math.min(255, base.r + factor * 100))
        const g = Math.max(0, Math.min(255, base.g + factor * 100))
        const b = Math.max(0, Math.min(255, base.b + factor * 100))
        colors.push(rgbToHex(Math.round(r), Math.round(g), Math.round(b)))
      }
      
      return colors
    })

    const updateColor = () => {
      hexInput.value = currentColor.value
    }

    const updateFromHex = () => {
      if (isValidHex(hexInput.value)) {
        currentColor.value = hexInput.value
      }
    }

    const selectColor = (color) => {
      currentColor.value = color
      hexInput.value = color
    }

    const saveColor = () => {
      if (!savedColors.value.includes(currentColor.value)) {
        savedColors.value.push(currentColor.value)
        localStorage.setItem('savedColors', JSON.stringify(savedColors.value))
      }
    }

    const removeSavedColor = (index) => {
      savedColors.value.splice(index, 1)
      localStorage.setItem('savedColors', JSON.stringify(savedColors.value))
    }

    const clearSaved = () => {
      savedColors.value = []
      localStorage.setItem('savedColors', JSON.stringify(savedColors.value))
    }

    const copyToClipboard = async (text, format) => {
      try {
        await navigator.clipboard.writeText(text)
        // 简单的提示
        const btn = event.target.closest('.format-item').querySelector('.copy-btn')
        const originalText = btn.textContent
        btn.textContent = '✅'
        setTimeout(() => {
          btn.textContent = originalText
        }, 1000)
      } catch (err) {
        console.error('复制失败:', err)
      }
    }

    // 颜色转换工具函数
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 }
    }

    const rgbToHex = (r, g, b) => {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
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

    const rgbToHsv = (r, g, b) => {
      r /= 255
      g /= 255
      b /= 255
      
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const diff = max - min
      
      let h = 0
      const s = max === 0 ? 0 : diff / max
      const v = max
      
      if (diff !== 0) {
        switch (max) {
          case r: h = ((g - b) / diff) % 6; break
          case g: h = (b - r) / diff + 2; break
          case b: h = (r - g) / diff + 4; break
        }
        h *= 60
        if (h < 0) h += 360
      }
      
      return { h, s: s * 100, v: v * 100 }
    }

    const isValidHex = (hex) => {
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
    }

    onMounted(() => {
      // 加载保存的颜色
      const saved = localStorage.getItem('savedColors')
      if (saved) {
        savedColors.value = JSON.parse(saved)
      }
    })

    return {
      currentColor,
      hexInput,
      colorData,
      similarColors,
      savedColors,
      updateColor,
      updateFromHex,
      selectColor,
      saveColor,
      removeSavedColor,
      clearSaved,
      copyToClipboard
    }
  }
}
</script>

<style scoped>
.color-picker-container {
  max-width: 100%;
  padding: 1rem;
}

.tool-header {
  text-align: center;
  margin-bottom: 2rem;
}

.tool-header h2 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.tool-header p {
  margin: 0;
  color: var(--text-muted);
}

.color-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.color-input-section, .manual-input-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.color-input-section label, .manual-input-section label {
  font-weight: 500;
  color: var(--text-primary);
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.color-input {
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.color-display {
  width: 100px;
  height: 60px;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  flex: 1;
}

.hex-input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: 'Courier New', monospace;
}

.color-info {
  margin-bottom: 2rem;
}

.color-info h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.color-formats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.format-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.format-item:hover {
  background: var(--bg-hover);
}

.format-label {
  font-weight: 500;
  color: var(--text-primary);
}

.format-value {
  font-family: 'Courier New', monospace;
  color: var(--text-secondary);
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.color-palette, .saved-colors {
  margin-bottom: 2rem;
}

.color-palette h3, .saved-colors h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.palette-grid, .saved-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
  gap: 0.5rem;
}

.palette-color, .saved-color {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid var(--border-color);
  transition: transform 0.2s;
}

.palette-color:hover, .saved-color:hover {
  transform: scale(1.1);
}

.actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.save-btn, .clear-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-btn:hover, .clear-btn:hover {
  background: var(--bg-hover);
}

@media (max-width: 768px) {
  .color-inputs {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .color-formats {
    grid-template-columns: 1fr;
  }
}
</style> 