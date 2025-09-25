<template>
  <div class="shadow-generator-container">
    <div class="tool-header">
      <h2>🔳 Shadow CSS</h2>
      <p>盒阴影调配器</p>
    </div>

    <div class="preview-section">
      <div class="preview-box" :style="{ boxShadow: shadowCSS }">
        盒阴影预览
      </div>
    </div>

    <div class="shadow-controls">
      <div class="control-group">
        <label>水平偏移 ({{ horizontalOffset }}px)</label>
        <input type="range" class="modern-slider" v-model="horizontalOffset" min="-50" max="50" @input="updateShadow">
      </div>

      <div class="control-group">
        <label>垂直偏移 ({{ verticalOffset }}px)</label>
        <input type="range" class="modern-slider" v-model="verticalOffset" min="-50" max="50" @input="updateShadow">
      </div>

      <div class="control-group">
        <label>模糊半径 ({{ blurRadius }}px)</label>
        <input type="range" class="modern-slider" v-model="blurRadius" min="0" max="50" @input="updateShadow">
      </div>

      <div class="control-group">
        <label>扩展半径 ({{ spreadRadius }}px)</label>
        <input type="range" class="modern-slider" v-model="spreadRadius" min="-20" max="20" @input="updateShadow">
      </div>

      <div class="control-group">
        <label>阴影颜色</label>
        <div class="color-control">
          <input type="color" v-model="shadowColor" @input="updateShadow">
          <input type="text" v-model="shadowColor" @input="updateShadow" class="color-text">
        </div>
      </div>

      <div class="control-group">
        <label>不透明度 ({{ opacity }}%)</label>
        <input type="range" class="modern-slider" v-model="opacity" min="0" max="100" @input="updateShadow">
      </div>

      <div class="control-group">
        <label>
          <input type="checkbox" v-model="inset" @change="updateShadow">
          内阴影
        </label>
      </div>
    </div>

    <div class="css-output">
      <label>CSS 代码</label>
      <textarea v-model="shadowCSS" readonly class="css-textarea" @click="copyCSS"></textarea>
      <button @click="copyCSS" class="copy-btn">📋 复制CSS</button>
    </div>

    <div class="shadow-presets">
      <h3>预设阴影</h3>
      <div class="presets-grid">
        <div 
          v-for="preset in shadowPresets" 
          :key="preset.name"
          class="preset-item"
          @click="loadPreset(preset)"
        >
          <div class="preset-preview" :style="{ boxShadow: preset.shadow }"></div>
          <span class="preset-name">{{ preset.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ShadowGenerator',
  setup() {
    const horizontalOffset = ref(0)
    const verticalOffset = ref(4)
    const blurRadius = ref(8)
    const spreadRadius = ref(0)
    const shadowColor = ref('#000000')
    const opacity = ref(25)
    const inset = ref(false)

    const shadowPresets = [
      { name: '轻微', shadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' },
      { name: '中等', shadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)' },
      { name: '较强', shadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)' },
      { name: '很强', shadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)' },
      { name: '彩色', shadow: '0 4px 8px rgba(255,107,107,0.3)' },
      { name: '内阴影', shadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }
    ]

    const shadowCSS = computed(() => {
      const hex = shadowColor.value
      const rgb = hexToRgb(hex)
      const alpha = opacity.value / 100
      const rgbaColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
      
      const insetText = inset.value ? 'inset ' : ''
      return `${insetText}${horizontalOffset.value}px ${verticalOffset.value}px ${blurRadius.value}px ${spreadRadius.value}px ${rgbaColor}`
    })

    const updateShadow = () => {
      // 触发响应式更新
    }

    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 }
    }

    const loadPreset = (preset) => {
      // 简单设置，更复杂的解析可以后续添加
      if (preset.name === '内阴影') {
        inset.value = true
        horizontalOffset.value = 0
        verticalOffset.value = 2
        blurRadius.value = 4
        spreadRadius.value = 0
        opacity.value = 10
      } else if (preset.name === '彩色') {
        shadowColor.value = '#FF6B6B'
        horizontalOffset.value = 0
        verticalOffset.value = 4
        blurRadius.value = 8
        spreadRadius.value = 0
        opacity.value = 30
      } else {
        // 重置为默认值
        inset.value = false
        horizontalOffset.value = 0
        verticalOffset.value = parseInt(preset.name === '轻微' ? 1 : preset.name === '中等' ? 3 : preset.name === '较强' ? 10 : 14)
        blurRadius.value = parseInt(preset.name === '轻微' ? 3 : preset.name === '中等' ? 6 : preset.name === '较强' ? 20 : 28)
        spreadRadius.value = 0
        shadowColor.value = '#000000'
        opacity.value = preset.name === '轻微' ? 12 : preset.name === '中等' ? 16 : preset.name === '较强' ? 19 : 25
      }
      updateShadow()
    }

    const copyCSS = async () => {
      try {
        await navigator.clipboard.writeText(`box-shadow: ${shadowCSS.value};`)
        console.log('CSS已复制')
      } catch (err) {
        console.error('复制失败:', err)
      }
    }

    return {
      horizontalOffset,
      verticalOffset,
      blurRadius,
      spreadRadius,
      shadowColor,
      opacity,
      inset,
      shadowPresets,
      shadowCSS,
      updateShadow,
      loadPreset,
      copyCSS
    }
  }
}
</script>

<style scoped>
.shadow-generator-container {
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

.preview-section {
  text-align: center;
  margin-bottom: 10px;
}

.preview-box {
  display: inline-block;
  padding: 10px;
  background: white;
  border-radius: 8px;
  font-weight: 500;
  color: #333;
}

.shadow-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 10px;
  padding: 1.5rem;
  background: var(--bg-surface);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.control-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.control-group input[type="range"].modern-slider {
  width: 100%;
}

.color-control {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-control input[type="color"] {
  width: 50px;
  height: 30px;
  border: none;
  border-radius: 4px;
}

.color-text {
  flex: 1;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: monospace;
}

.css-output {
  margin-bottom: 10px;
}

.css-output label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.css-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  background: var(--bg-surface);
  color: var(--text-primary);
  resize: none;
  height: 60px;
  margin-bottom: 0.5rem;
}

.copy-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.copy-btn:hover {
  background: var(--bg-hover);
}

.shadow-presets h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.preset-item {
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s;
}

.preset-item:hover {
  transform: scale(1.05);
}

.preset-preview {
  width: 80px;
  height: 60px;
  background: white;
  border-radius: 6px;
  margin: 0 auto 0.5rem;
  border: 1px solid #eee;
}

.preset-name {
  font-size: 0.875rem;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .shadow-controls {
    grid-template-columns: 1fr;
  }
}
</style> 