<template>
  <div class="contrast-checker-container">
    <div class="tool-header">
      <h2>📊 Contrast Checker</h2>
      <p>颜色对比度检测工具</p>
    </div>

    <div class="color-inputs">
      <div class="color-input-group">
        <label>前景色 (文字颜色)</label>
        <div class="color-control">
          <input type="color" v-model="foregroundColor" class="color-picker">
          <input type="text" v-model="foregroundColor" class="color-text">
        </div>
      </div>

      <div class="color-input-group">
        <label>背景色</label>
        <div class="color-control">
          <input type="color" v-model="backgroundColor" class="color-picker">
          <input type="text" v-model="backgroundColor" class="color-text">
        </div>
      </div>
    </div>

    <div class="preview-section">
      <div class="preview-card" :style="{ backgroundColor: backgroundColor, color: foregroundColor }">
        <h3>预览效果</h3>
        <p>这是一段示例文本，用于预览颜色对比效果。</p>
        <p style="font-size: 14px;">小号文字示例</p>
        <p style="font-size: 18px; font-weight: bold;">大号粗体文字示例</p>
      </div>
    </div>

    <div class="contrast-results">
      <div class="ratio-display">
        <span class="ratio-number">{{ contrastRatio }}</span>
        <span class="ratio-label">:1</span>
      </div>

      <div class="compliance-grid">
        <div class="compliance-item" :class="{ pass: wcagAANormal }">
          <span>{{ wcagAANormal ? '✅' : '❌' }}</span>
          <div>
            <div>WCAG AA 普通文本</div>
            <small>需要 4.5:1</small>
          </div>
        </div>

        <div class="compliance-item" :class="{ pass: wcagAALarge }">
          <span>{{ wcagAALarge ? '✅' : '❌' }}</span>
          <div>
            <div>WCAG AA 大文本</div>
            <small>需要 3:1</small>
          </div>
        </div>

        <div class="compliance-item" :class="{ pass: wcagAAANormal }">
          <span>{{ wcagAAANormal ? '✅' : '❌' }}</span>
          <div>
            <div>WCAG AAA 普通文本</div>
            <small>需要 7:1</small>
          </div>
        </div>

        <div class="compliance-item" :class="{ pass: wcagAAALarge }">
          <span>{{ wcagAAALarge ? '✅' : '❌' }}</span>
          <div>
            <div>WCAG AAA 大文本</div>
            <small>需要 4.5:1</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ContrastChecker',
  setup() {
    const foregroundColor = ref('#000000')
    const backgroundColor = ref('#FFFFFF')

    const contrastRatio = computed(() => {
      return calculateContrastRatio(foregroundColor.value, backgroundColor.value)
    })

    const wcagAANormal = computed(() => contrastRatio.value >= 4.5)
    const wcagAALarge = computed(() => contrastRatio.value >= 3.0)
    const wcagAAANormal = computed(() => contrastRatio.value >= 7.0)
    const wcagAAALarge = computed(() => contrastRatio.value >= 4.5)

    const calculateContrastRatio = (color1, color2) => {
      const l1 = getLuminance(color1)
      const l2 = getLuminance(color2)
      const lighter = Math.max(l1, l2)
      const darker = Math.min(l1, l2)
      return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100
    }

    const getLuminance = (hex) => {
      const rgb = hexToRgb(hex)
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 }
    }

    return {
      foregroundColor,
      backgroundColor,
      contrastRatio,
      wcagAANormal,
      wcagAALarge,
      wcagAAANormal,
      wcagAAALarge
    }
  }
}
</script>

<style scoped>
.contrast-checker-container {
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

.color-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 10px;
}

.color-input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.color-control {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.color-picker {
  width: 60px;
  height: 40px;
  border: none;
  border-radius: 6px;
}

.color-text {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: monospace;
}

.preview-section {
  margin-bottom: 10px;
}

.preview-card {
  padding: 10px;
  border-radius: 12px;
  border: 2px solid var(--border-color);
  text-align: center;
}

.contrast-results {
  text-align: center;
}

.ratio-display {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.ratio-number {
  color: var(--accent-color);
}

.compliance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.compliance-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid;
}

.compliance-item.pass {
  border-color: #10B981;
  background: rgba(16, 185, 129, 0.1);
}

.compliance-item:not(.pass) {
  border-color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
}

@media (max-width: 768px) {
  .color-inputs {
    grid-template-columns: 1fr;
  }
  
  .compliance-grid {
    grid-template-columns: 1fr;
  }
}
</style> 