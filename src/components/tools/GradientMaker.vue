<template>
  <div class="gradient-maker-container">
    <div class="tool-header">
      <h2>🌈 Gradient Maker</h2>
      <p>CSS 渐变生成器</p>
    </div>

    <div class="gradient-preview">
      <div class="preview-box" :style="{ background: gradientCSS }"></div>
      <div class="css-output">
        <textarea 
          v-model="gradientCSS" 
          readonly 
          class="css-textarea"
          @click="copyCSS"
        ></textarea>
        <button @click="copyCSS" class="copy-btn">📋 复制CSS</button>
      </div>
    </div>

    <div class="gradient-controls">
      <div class="gradient-type">
        <label>渐变类型</label>
        <select v-model="gradientType" @change="updateGradient" class="type-select">
          <option value="linear">线性渐变</option>
          <option value="radial">径向渐变</option>
          <option value="conic">圆锥渐变</option>
        </select>
      </div>

      <div v-if="gradientType === 'linear'" class="direction-control">
        <label>方向 ({{ direction }}°)</label>
        <input 
          type="range" 
          class="modern-slider direction-slider"
          v-model="direction" 
          min="0" 
          max="360" 
          @input="updateGradient"
        >
        <div class="direction-presets">
          <button 
            v-for="preset in directionPresets" 
            :key="preset.name"
            @click="setDirection(preset.angle)"
            class="preset-btn"
          >
            {{ preset.name }}
          </button>
        </div>
      </div>

      <div v-if="gradientType === 'radial'" class="radial-controls">
        <div class="shape-control">
          <label>形状</label>
          <select v-model="radialShape" @change="updateGradient" class="shape-select">
            <option value="circle">圆形</option>
            <option value="ellipse">椭圆</option>
          </select>
        </div>
        <div class="position-control">
          <label>位置</label>
          <select v-model="radialPosition" @change="updateGradient" class="position-select">
            <option value="center">中心</option>
            <option value="top left">左上</option>
            <option value="top right">右上</option>
            <option value="bottom left">左下</option>
            <option value="bottom right">右下</option>
          </select>
        </div>
      </div>
    </div>

    <div class="color-stops">
      <div class="stops-header">
        <h3>颜色节点</h3>
        <button @click="addColorStop" class="add-stop-btn">+ 添加颜色</button>
      </div>
      
      <div class="stops-list">
        <div 
          v-for="(stop, index) in colorStops" 
          :key="index"
          class="color-stop"
        >
          <input 
            type="color" 
            v-model="stop.color" 
            @input="updateGradient"
            class="stop-color"
          >
          <input 
            type="range" 
            class="modern-slider stop-position"
            v-model="stop.position" 
            min="0" 
            max="100"
            @input="updateGradient"
          >
          <span class="position-label">{{ stop.position }}%</span>
          <button 
            @click="removeColorStop(index)" 
            class="remove-stop"
            :disabled="colorStops.length <= 2"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <div class="gradient-presets">
      <h3>预设渐变</h3>
      <div class="presets-grid">
        <div 
          v-for="preset in gradientPresets" 
          :key="preset.name"
          class="preset-item"
          @click="loadPreset(preset)"
        >
          <div class="preset-preview" :style="{ background: preset.css }"></div>
          <span class="preset-name">{{ preset.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'GradientMaker',
  setup() {
    const gradientType = ref('linear')
    const direction = ref(90)
    const radialShape = ref('circle')
    const radialPosition = ref('center')
    const colorStops = ref([
      { color: '#FF6B6B', position: 0 },
      { color: '#4ECDC4', position: 100 }
    ])

    const directionPresets = [
      { name: '上', angle: 0 },
      { name: '右', angle: 90 },
      { name: '下', angle: 180 },
      { name: '左', angle: 270 }
    ]

    const gradientPresets = [
      { name: '日落', css: 'linear-gradient(45deg, #FF6B6B, #FFE66D, #FF6B6B)' },
      { name: '海洋', css: 'linear-gradient(135deg, #667eea, #764ba2)' },
      { name: '森林', css: 'linear-gradient(to right, #56ab2f, #a8e6cf)' },
      { name: '夜空', css: 'linear-gradient(to bottom, #2c3e50, #34495e)' },
      { name: '彩虹', css: 'linear-gradient(45deg, #f093fb, #f5576c, #4facfe, #43e97b)' },
      { name: '金属', css: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)' }
    ]

    const gradientCSS = computed(() => {
      const stops = colorStops.value
        .sort((a, b) => a.position - b.position)
        .map(stop => `${stop.color} ${stop.position}%`)
        .join(', ')

      switch (gradientType.value) {
        case 'linear':
          return `linear-gradient(${direction.value}deg, ${stops})`
        case 'radial':
          return `radial-gradient(${radialShape.value} at ${radialPosition.value}, ${stops})`
        case 'conic':
          return `conic-gradient(from ${direction.value}deg, ${stops})`
        default:
          return `linear-gradient(${direction.value}deg, ${stops})`
      }
    })

    const updateGradient = () => {
      // 触发响应式更新
    }

    const addColorStop = () => {
      const newPosition = colorStops.value.length > 0 
        ? Math.max(...colorStops.value.map(s => s.position)) + 10
        : 50
      
      colorStops.value.push({
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        position: Math.min(100, newPosition)
      })
      updateGradient()
    }

    const removeColorStop = (index) => {
      if (colorStops.value.length > 2) {
        colorStops.value.splice(index, 1)
        updateGradient()
      }
    }

    const setDirection = (angle) => {
      direction.value = angle
      updateGradient()
    }

    const loadPreset = (preset) => {
      // 简单解析预设CSS（仅作演示）
      if (preset.css.includes('linear-gradient')) {
        gradientType.value = 'linear'
        // 可以添加更复杂的解析逻辑
      }
    }

    const copyCSS = async () => {
      try {
        await navigator.clipboard.writeText(gradientCSS.value)
        console.log('CSS已复制')
      } catch (err) {
        console.error('复制失败:', err)
      }
    }

    return {
      gradientType,
      direction,
      radialShape,
      radialPosition,
      colorStops,
      directionPresets,
      gradientPresets,
      gradientCSS,
      updateGradient,
      addColorStop,
      removeColorStop,
      setDirection,
      loadPreset,
      copyCSS
    }
  }
}
</script>

<style scoped>
.gradient-maker-container {
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

.gradient-preview {
  margin-bottom: 10px;
}

.preview-box {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  border: 2px solid var(--border-color);
  margin-bottom: 10px;
}

.css-output {
  display: flex;
  gap: 1rem;
  align-items: stretch;
}

.css-textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  background: var(--bg-surface);
  color: var(--text-primary);
  resize: none;
  height: 80px;
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

.gradient-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 10px;
  padding: 1.5rem;
  background: var(--bg-surface);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.gradient-type label,
.direction-control label,
.shape-control label,
.position-control label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.type-select,
.shape-select,
.position-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.direction-slider,
.stop-position {
  width: 100%;
  margin-bottom: 10px;
}

.direction-presets {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 0.25rem 0.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.preset-btn:hover {
  background: var(--bg-hover);
}

.radial-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.color-stops {
  margin-bottom: 10px;
  padding: 1.5rem;
  background: var(--bg-surface);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.stops-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.stops-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.add-stop-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-stop-btn:hover {
  background: var(--bg-hover);
}

.stops-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.color-stop {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--bg-primary);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.stop-color {
  width: 50px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.stop-position {
  flex: 1;
}

.position-label {
  min-width: 40px;
  font-family: 'Courier New', monospace;
  color: var(--text-primary);
}

.remove-stop {
  width: 30px;
  height: 30px;
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
}

.remove-stop:disabled {
  background: var(--text-muted);
  cursor: not-allowed;
}

.gradient-presets {
  padding: 1.5rem;
  background: var(--bg-surface);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.gradient-presets h3 {
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
  width: 100%;
  height: 60px;
  border-radius: 6px;
  border: 2px solid var(--border-color);
  margin-bottom: 0.5rem;
}

.preset-name {
  font-size: 0.875rem;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .css-output {
    flex-direction: column;
  }
  
  .gradient-controls {
    grid-template-columns: 1fr;
  }
  
  .radial-controls {
    grid-template-columns: 1fr;
  }
  
  .color-stop {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}
</style> 