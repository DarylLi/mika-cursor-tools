<template>
  <div class="single-tool">
    <h2><i class="fas fa-fingerprint"></i> UUID v4 生成器</h2>
    <p>生成全球唯一标识符 (UUID Version 4)，基于随机数算法</p>
    
    <div class="example-section">
      <button class="example-btn" @click="generateUUID">
        <i class="fas fa-magic"></i> 生成 UUID
      </button>
    </div>

    <div class="generator-controls">
      <div class="quantity-control">
        <label for="quantity">生成数量:</label>
        <input 
          id="quantity"
          v-model.number="quantity" 
          type="number" 
          min="1" 
          max="20"
          class="quantity-input"
        >
        <button @click="generateMultiple">生成多个</button>
      </div>
      
      <div class="format-options">
        <label class="checkbox-label">
          <input v-model="includeHyphens" type="checkbox">
          <span>包含连字符</span>
        </label>
        <label class="checkbox-label">
          <input v-model="uppercase" type="checkbox">
          <span>大写字母</span>
        </label>
      </div>
    </div>

    <div v-if="uuids.length" class="result-display">
      <div class="results-header">
        <h4>生成的 UUID ({{ uuids.length }})</h4>
        <button @click="copyAllUUIDs" class="copy-all-btn">
          <i class="fas fa-copy"></i> 复制全部
        </button>
      </div>

      <div class="uuid-list">
        <div v-for="(uuid, index) in uuids" :key="index" class="uuid-item">
          <code class="uuid-value">{{ formatUUID(uuid) }}</code>
          <button @click="copyUUID(uuid)" class="copy-btn">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h4><i class="fas fa-info-circle"></i> 关于 UUID v4</h4>
      <p><strong>UUID</strong> 是一个128位的数字，用于唯一标识信息。Version 4 使用随机数生成，碰撞概率极低。</p>
      <div class="format-example">
        <strong>格式:</strong> <code>xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx</code>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'UuidGenerator',
  props: {
    toolData: Object
  },
  setup() {
    const quantity = ref(1)
    const includeHyphens = ref(true)
    const uppercase = ref(false)
    const uuids = ref([])

    // 生成UUID v4
    const generateUUIDv4 = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }

    // 格式化UUID
    const formatUUID = (uuid) => {
      let formatted = uuid
      if (!includeHyphens.value) {
        formatted = uuid.replace(/-/g, '')
      }
      if (uppercase.value) {
        formatted = formatted.toUpperCase()
      }
      return formatted
    }

    // 生成单个UUID
    const generateUUID = () => {
      uuids.value = [generateUUIDv4()]
    }

    // 生成多个UUID
    const generateMultiple = () => {
      const newUUIDs = []
      for (let i = 0; i < quantity.value; i++) {
        newUUIDs.push(generateUUIDv4())
      }
      uuids.value = newUUIDs
    }

    // 复制单个UUID
    const copyUUID = async (uuid) => {
      try {
        await navigator.clipboard.writeText(formatUUID(uuid))
      } catch (e) {
        console.error('复制失败:', e)
      }
    }

    // 复制全部UUID
    const copyAllUUIDs = async () => {
      try {
        const formatted = uuids.value.map(uuid => formatUUID(uuid)).join('\n')
        await navigator.clipboard.writeText(formatted)
      } catch (e) {
        console.error('复制失败:', e)
      }
    }

    return {
      quantity,
      includeHyphens,
      uppercase,
      uuids,
      generateUUID,
      generateMultiple,
      formatUUID,
      copyUUID,
      copyAllUUIDs
    }
  }
}
</script>

<style scoped>
.generator-controls {
  margin-bottom: 20px;
  padding: 15px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.quantity-input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  text-align: center;
}

.format-options {
  display: flex;
  gap: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.copy-all-btn {
  padding: 6px 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.uuid-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.uuid-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f3f4f6;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.uuid-value {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  background: transparent;
  flex: 1;
}

.copy-btn {
  padding: 4px 8px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-section {
  margin-top: 20px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.info-section h4 {
  margin: 0 0 10px 0;
  color: #1e40af;
}

.info-section p {
  margin: 0 0 10px 0;
  color: #1e40af;
  line-height: 1.5;
}

.format-example {
  background: white;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #e0f2fe;
  font-family: 'Courier New', monospace;
  color: #1e40af;
}
</style> 