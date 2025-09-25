<template>
  <div class="css-clamp-container">
    <div class="tool-header">
      <h2>📏 CSS Clamp</h2>
      <p>Fluid size 响应式尺寸计算器</p>
    </div>

    <div class="clamp-inputs">
      <div class="input-group">
        <label>最小值 (rem)</label>
        <input type="number" v-model="minValue" step="0.1" @input="updateClamp" class="value-input">
      </div>

      <div class="input-group">
        <label>最大值 (rem)</label>
        <input type="number" v-model="maxValue" step="0.1" @input="updateClamp" class="value-input">
      </div>

      <div class="input-group">
        <label>最小视口 (px)</label>
        <input type="number" v-model="minViewport" @input="updateClamp" class="value-input">
      </div>

      <div class="input-group">
        <label>最大视口 (px)</label>
        <input type="number" v-model="maxViewport" @input="updateClamp" class="value-input">
      </div>
    </div>

    <div class="clamp-result">
      <label>CSS Clamp 代码</label>
      <textarea v-model="clampCSS" readonly class="css-textarea" @click="copyCSS"></textarea>
      <button @click="copyCSS" class="copy-btn">📋 复制CSS</button>
    </div>

    <div class="preview-section">
      <h3>响应式预览</h3>
      <div class="preview-controls">
        <label>当前视口宽度: {{ currentViewport }}px</label>
        <input type="range" v-model="currentViewport" :min="minViewport" :max="maxViewport" class="viewport-slider">
      </div>
      <div class="preview-box">
        <div class="sample-text" :style="{ fontSize: currentSize + 'rem' }">
          示例文字 ({{ currentSize.toFixed(2) }}rem)
        </div>
      </div>
    </div>

    <div class="size-table">
      <h3>尺寸对应表</h3>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>视口宽度</th>
              <th>计算尺寸</th>
              <th>像素值 (16px基准)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="viewport in sampleViewports" :key="viewport">
              <td>{{ viewport }}px</td>
              <td>{{ calculateSize(viewport).toFixed(2) }}rem</td>
              <td>{{ (calculateSize(viewport) * 16).toFixed(0) }}px</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="clamp-presets">
      <h3>常用预设</h3>
      <div class="presets-grid">
        <div 
          v-for="preset in clampPresets" 
          :key="preset.name"
          class="preset-item"
          @click="loadPreset(preset)"
        >
          <div class="preset-name">{{ preset.name }}</div>
          <div class="preset-description">{{ preset.description }}</div>
          <div class="preset-values">{{ preset.min }}rem - {{ preset.max }}rem</div>
        </div>
      </div>
    </div>

    <div class="clamp-info">
      <h3>CSS Clamp 说明</h3>
      <div class="info-content">
        <p><strong>语法:</strong> clamp(最小值, 首选值, 最大值)</p>
        <p><strong>首选值计算:</strong> 基础值 + 变化率 × (100vw - 最小视口)</p>
        <p><strong>变化率:</strong> (最大值 - 最小值) ÷ (最大视口 - 最小视口)</p>
        <p><strong>使用场景:</strong> 响应式字体大小、间距、容器宽度等</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'CssClamp',
  setup() {
    const minValue = ref(1.0)
    const maxValue = ref(3.0)
    const minViewport = ref(320)
    const maxViewport = ref(1200)
    const currentViewport = ref(768)

    const clampPresets = [
      { name: '标题', description: '大标题字体', min: 2.0, max: 4.0, minVp: 320, maxVp: 1200 },
      { name: '副标题', description: '副标题字体', min: 1.5, max: 2.5, minVp: 320, maxVp: 1200 },
      { name: '正文', description: '正文字体', min: 1.0, max: 1.2, minVp: 320, maxVp: 1200 },
      { name: '小字', description: '说明文字', min: 0.8, max: 1.0, minVp: 320, maxVp: 1200 },
      { name: '间距', description: '容器间距', min: 1.0, max: 3.0, minVp: 320, maxVp: 1200 },
      { name: '容器', description: '容器宽度(rem)', min: 20, max: 60, minVp: 320, maxVp: 1200 }
    ]

    const sampleViewports = [320, 480, 768, 1024, 1200, 1440, 1920]

    // 计算变化率和基础值
    const slope = computed(() => {
      return (maxValue.value - minValue.value) / (maxViewport.value - minViewport.value)
    })

    const yIntercept = computed(() => {
      return minValue.value - slope.value * minViewport.value
    })

    // 生成 clamp CSS
    const clampCSS = computed(() => {
      const preferredValue = `${yIntercept.value.toFixed(4)}rem + ${(slope.value * 100).toFixed(4)}vw`
      return `clamp(${minValue.value}rem, ${preferredValue}, ${maxValue.value}rem)`
    })

    // 当前视口下的实际尺寸
    const currentSize = computed(() => {
      return calculateSize(currentViewport.value)
    })

    const calculateSize = (viewport) => {
      const calculated = yIntercept.value + slope.value * viewport
      return Math.max(minValue.value, Math.min(maxValue.value, calculated))
    }

    const updateClamp = () => {
      // 触发响应式更新
    }

    const loadPreset = (preset) => {
      minValue.value = preset.min
      maxValue.value = preset.max
      minViewport.value = preset.minVp
      maxViewport.value = preset.maxVp
      currentViewport.value = Math.min(Math.max(currentViewport.value, preset.minVp), preset.maxVp)
    }

    const copyCSS = async () => {
      try {
        await navigator.clipboard.writeText(clampCSS.value)
        console.log('CSS已复制')
      } catch (err) {
        console.error('复制失败:', err)
      }
    }

    return {
      minValue,
      maxValue,
      minViewport,
      maxViewport,
      currentViewport,
      clampPresets,
      sampleViewports,
      clampCSS,
      currentSize,
      calculateSize,
      updateClamp,
      loadPreset,
      copyCSS
    }
  }
}
</script>

<style scoped>
.css-clamp-container {
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

.clamp-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-surface);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.value-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: monospace;
}

.clamp-result {
  margin-bottom: 2rem;
}

.clamp-result label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.css-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  background: var(--bg-surface);
  color: var(--text-primary);
  resize: none;
  height: 80px;
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

.preview-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-surface);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.preview-section h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.preview-controls {
  margin-bottom: 1rem;
}

.preview-controls label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.viewport-slider {
  width: 100%;
}

.preview-box {
  text-align: center;
  padding: 2rem;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
}

.sample-text {
  font-weight: 500;
  color: var(--text-primary);
  transition: font-size 0.3s ease;
}

.size-table {
  margin-bottom: 2rem;
}

.size-table h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-surface);
  border-radius: 8px;
  overflow: hidden;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  background: var(--bg-hover);
  font-weight: 500;
  color: var(--text-primary);
}

td {
  color: var(--text-secondary);
  font-family: monospace;
}

.clamp-presets {
  margin-bottom: 2rem;
}

.clamp-presets h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.preset-item {
  padding: 1rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
}

.preset-item:hover {
  transform: translateY(-2px);
  border-color: var(--accent-color);
}

.preset-name {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.preset-description {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.preset-values {
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.clamp-info {
  padding: 1.5rem;
  background: var(--bg-surface);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.clamp-info h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.info-content p {
  margin: 0.5rem 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.info-content strong {
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .clamp-inputs {
    grid-template-columns: 1fr;
  }
  
  .presets-grid {
    grid-template-columns: 1fr;
  }
}
</style> 