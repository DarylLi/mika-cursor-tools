<template>
  <div class="border-radius-container">
    <div class="tool-header">
      <h2>📐 Radius Preview</h2>
      <p>圆角可视化工具</p>
    </div>

    <div class="preview-section">
      <div class="preview-box" :style="{ borderRadius: borderRadiusCSS }">
        圆角预览
      </div>
    </div>

    <div class="radius-controls">
      <div class="control-group">
        <label>左上角 ({{ topLeft }}px)</label>
        <input type="range" v-model="topLeft" min="0" max="100" @input="updateRadius">
      </div>

      <div class="control-group">
        <label>右上角 ({{ topRight }}px)</label>
        <input type="range" v-model="topRight" min="0" max="100" @input="updateRadius">
      </div>

      <div class="control-group">
        <label>左下角 ({{ bottomLeft }}px)</label>
        <input type="range" v-model="bottomLeft" min="0" max="100" @input="updateRadius">
      </div>

      <div class="control-group">
        <label>右下角 ({{ bottomRight }}px)</label>
        <input type="range" v-model="bottomRight" min="0" max="100" @input="updateRadius">
      </div>

      <div class="control-group span-2">
        <label>
          <input type="checkbox" v-model="syncAll" @change="syncCorners">
          同步所有角
        </label>
      </div>
    </div>

    <div class="css-output">
      <label>CSS 代码</label>
      <textarea v-model="borderRadiusCSS" readonly class="css-textarea" @click="copyCSS"></textarea>
      <button @click="copyCSS" class="copy-btn">📋 复制CSS</button>
    </div>

    <div class="radius-presets">
      <h3>预设形状</h3>
      <div class="presets-grid">
        <div 
          v-for="preset in radiusPresets" 
          :key="preset.name"
          class="preset-item"
          @click="loadPreset(preset)"
        >
          <div class="preset-preview" :style="{ borderRadius: preset.radius }"></div>
          <span class="preset-name">{{ preset.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'BorderRadius',
  setup() {
    const topLeft = ref(0)
    const topRight = ref(0)
    const bottomLeft = ref(0)
    const bottomRight = ref(0)
    const syncAll = ref(false)

    const radiusPresets = [
      { name: '无圆角', radius: '0px' },
      { name: '小圆角', radius: '4px' },
      { name: '中圆角', radius: '8px' },
      { name: '大圆角', radius: '16px' },
      { name: '圆形', radius: '50%' },
      { name: '胶囊', radius: '100px' },
      { name: '左圆', radius: '50px 0 0 50px' },
      { name: '右圆', radius: '0 50px 50px 0' },
      { name: '上圆', radius: '50px 50px 0 0' },
      { name: '下圆', radius: '0 0 50px 50px' }
    ]

    const borderRadiusCSS = computed(() => {
      const tl = topLeft.value
      const tr = topRight.value
      const bl = bottomLeft.value
      const br = bottomRight.value
      
      // 如果所有值相同，使用简写
      if (tl === tr && tr === bl && bl === br) {
        return `${tl}px`
      }
      
      // 使用完整写法
      return `${tl}px ${tr}px ${br}px ${bl}px`
    })

    // 监听同步状态
    watch(syncAll, (newVal) => {
      if (newVal) {
        syncCorners()
      }
    })

    // 当同步开启时，监听任意角的变化
    watch([topLeft, topRight, bottomLeft, bottomRight], () => {
      if (syncAll.value) {
        // 不再自动同步，避免循环
      }
    })

    const updateRadius = () => {
      if (syncAll.value) {
        // 如果开启同步，则所有角使用相同值
        const value = topLeft.value
        topRight.value = value
        bottomLeft.value = value
        bottomRight.value = value
      }
    }

    const syncCorners = () => {
      if (syncAll.value) {
        const value = topLeft.value
        topRight.value = value
        bottomLeft.value = value
        bottomRight.value = value
      }
    }

    const loadPreset = (preset) => {
      if (preset.radius.includes('%')) {
        // 百分比圆角
        const value = 50
        topLeft.value = value
        topRight.value = value
        bottomLeft.value = value
        bottomRight.value = value
      } else if (preset.radius.includes(' ')) {
        // 多个值
        const values = preset.radius.split(' ').map(v => parseInt(v) || 0)
        if (values.length === 4) {
          topLeft.value = values[0]
          topRight.value = values[1]
          bottomRight.value = values[2]
          bottomLeft.value = values[3]
        }
      } else {
        // 单个值
        const value = parseInt(preset.radius) || 0
        topLeft.value = value
        topRight.value = value
        bottomLeft.value = value
        bottomRight.value = value
      }
      syncAll.value = false
    }

    const copyCSS = async () => {
      try {
        await navigator.clipboard.writeText(`border-radius: ${borderRadiusCSS.value};`)
        console.log('CSS已复制')
      } catch (err) {
        console.error('复制失败:', err)
      }
    }

    return {
      topLeft,
      topRight,
      bottomLeft,
      bottomRight,
      syncAll,
      radiusPresets,
      borderRadiusCSS,
      updateRadius,
      syncCorners,
      loadPreset,
      copyCSS
    }
  }
}
</script>

<style scoped>
.border-radius-container {
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

.preview-section {
  text-align: center;
  margin-bottom: 2rem;
}

.preview-box {
  display: inline-block;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 1.1rem;
}

.radius-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-surface);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.control-group.span-2 {
  grid-column: span 2;
}

.control-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.control-group input[type="range"] {
  width: 100%;
}

.css-output {
  margin-bottom: 2rem;
}

.css-output label {
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

.radius-presets h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
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
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 0 auto 0.5rem;
  border: 2px solid var(--border-color);
}

.preset-name {
  font-size: 0.875rem;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .radius-controls {
    grid-template-columns: 1fr;
  }
  
  .control-group.span-2 {
    grid-column: span 1;
  }
}
</style> 