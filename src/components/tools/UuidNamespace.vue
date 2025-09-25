<template>
  <div class="uuid-namespace-tool">
    <div class="tool-header">
      <h3><i class="fas fa-fingerprint"></i> UUID v5 生成器</h3>
      <p>基于命名空间和名称生成确定性 UUID</p>
    </div>

    <div class="tool-content">
      <div class="input-section">
        <div class="input-group">
          <label>命名空间 UUID</label>
          <select v-model="namespaceUuid" class="namespace-select">
            <option value="6ba7b810-9dad-11d1-80b4-00c04fd430c8">DNS 命名空间</option>
            <option value="6ba7b811-9dad-11d1-80b4-00c04fd430c8">URL 命名空间</option>
            <option value="6ba7b812-9dad-11d1-80b4-00c04fd430c8">ISO OID 命名空间</option>
            <option value="6ba7b814-9dad-11d1-80b4-00c04fd430c8">X.500 DN 命名空间</option>
            <option value="custom">自定义命名空间</option>
          </select>
        </div>
        
        <div v-if="namespaceUuid === 'custom'" class="input-group">
          <label>自定义命名空间 UUID</label>
          <input v-model="customNamespace" type="text" class="uuid-input" placeholder="输入有效的 UUID" />
        </div>

        <div class="input-group">
          <label>名称</label>
          <input v-model="name" type="text" class="name-input" placeholder="输入要生成 UUID 的名称" />
        </div>

        <div class="actions">
          <button @click="generateUUID" class="action-btn primary" :disabled="!canGenerate">
            <i class="fas fa-cog"></i> 生成 UUID
          </button>
          <button @click="loadExample" class="action-btn">
            <i class="fas fa-lightbulb"></i> 示例
          </button>
          <button @click="clearAll" class="action-btn">
            <i class="fas fa-eraser"></i> 清空
          </button>
        </div>
      </div>

      <div v-if="generatedUuid" class="output-section">
        <div class="result-card">
          <div class="result-header">
            <h4>生成的 UUID v5</h4>
            <button @click="copyUuid" class="copy-btn">
              <i class="fas fa-copy"></i> 复制
            </button>
          </div>
          <div class="uuid-result">
            <code>{{ generatedUuid }}</code>
          </div>
        </div>

        <div class="info-card">
          <h4><i class="fas fa-info-circle"></i> 生成信息</h4>
          <div class="info-item">
            <span class="label">命名空间:</span>
            <span class="value">{{ getCurrentNamespace() }}</span>
          </div>
          <div class="info-item">
            <span class="label">名称:</span>
            <span class="value">{{ name }}</span>
          </div>
          <div class="info-item">
            <span class="label">算法:</span>
            <span class="value">SHA-1 + UUID v5</span>
          </div>
          <div class="info-item">
            <span class="label">确定性:</span>
            <span class="value">相同输入始终产生相同结果</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import CryptoJS from 'crypto-js'

export default {
  name: 'UuidNamespace',
  setup() {
    const namespaceUuid = ref('6ba7b810-9dad-11d1-80b4-00c04fd430c8')
    const customNamespace = ref('')
    const name = ref('')
    const generatedUuid = ref('')

    const canGenerate = computed(() => {
      return name.value.trim() && (
        namespaceUuid.value !== 'custom' || 
        (namespaceUuid.value === 'custom' && isValidUuid(customNamespace.value))
      )
    })

    const namespaceNames = {
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8': 'DNS 命名空间',
      '6ba7b811-9dad-11d1-80b4-00c04fd430c8': 'URL 命名空间',
      '6ba7b812-9dad-11d1-80b4-00c04fd430c8': 'ISO OID 命名空间',
      '6ba7b814-9dad-11d1-80b4-00c04fd430c8': 'X.500 DN 命名空间'
    }

    function isValidUuid(uuid) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      return uuidRegex.test(uuid)
    }

    function generateUUID() {
      if (!canGenerate.value) return

      const namespace = namespaceUuid.value === 'custom' ? customNamespace.value : namespaceUuid.value
      const nameStr = name.value.trim()

      try {
        // 将命名空间 UUID 转换为字节
        const namespaceBytes = uuidToBytes(namespace)
        const nameBytes = new TextEncoder().encode(nameStr)
        
        // 合并命名空间和名称
        const combined = new Uint8Array(namespaceBytes.length + nameBytes.length)
        combined.set(namespaceBytes)
        combined.set(nameBytes, namespaceBytes.length)
        
        // 计算 SHA-1 哈希
        const hash = CryptoJS.SHA1(CryptoJS.lib.WordArray.create(combined))
        const hashBytes = hexToBytes(hash.toString())
        
        // 设置版本 (5) 和变体位
        hashBytes[6] = (hashBytes[6] & 0x0f) | 0x50 // 版本 5
        hashBytes[8] = (hashBytes[8] & 0x3f) | 0x80 // 变体位
        
        // 格式化为 UUID 字符串
        generatedUuid.value = formatAsUuid(hashBytes)
      } catch (error) {
        console.error('UUID 生成失败:', error)
      }
    }

    function uuidToBytes(uuid) {
      const hex = uuid.replace(/-/g, '')
      const bytes = new Uint8Array(16)
      for (let i = 0; i < 16; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
      }
      return bytes
    }

    function hexToBytes(hex) {
      const bytes = new Uint8Array(16)
      for (let i = 0; i < 16; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
      }
      return bytes
    }

    function formatAsUuid(bytes) {
      const hex = Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      
      return [
        hex.substr(0, 8),
        hex.substr(8, 4),
        hex.substr(12, 4),
        hex.substr(16, 4),
        hex.substr(20, 12)
      ].join('-')
    }

    function loadExample() {
      namespaceUuid.value = '6ba7b811-9dad-11d1-80b4-00c04fd430c8' // URL namespace
      name.value = 'https://example.com'
      generateUUID()
    }

    function clearAll() {
      namespaceUuid.value = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
      customNamespace.value = ''
      name.value = ''
      generatedUuid.value = ''
    }

    function getCurrentNamespace() {
      if (namespaceUuid.value === 'custom') {
        return `自定义: ${customNamespace.value}`
      }
      return namespaceNames[namespaceUuid.value] || namespaceUuid.value
    }

    async function copyUuid() {
      if (!generatedUuid.value) return
      try {
        await navigator.clipboard.writeText(generatedUuid.value)
      } catch (err) {
        console.error('复制失败:', err)
      }
    }

    return {
      namespaceUuid,
      customNamespace,
      name,
      generatedUuid,
      canGenerate,
      generateUUID,
      loadExample,
      clearAll,
      getCurrentNamespace,
      copyUuid
    }
  }
}
</script>

<style scoped>
.uuid-namespace-tool {
  max-width: 800px;
  margin: 0 auto;
  padding: 10px;
}

.tool-header {
  text-align: center;
  margin-bottom: 10px;
  padding: 10px;
}

.tool-header h3 {
  font-size: 24px;
  margin-bottom: 10px;
  color: var(--text-primary);
}

.input-section {
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: 12px;
  margin-bottom: 10px;
}

.input-group {
  margin-bottom: 10px;
}

.input-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: var(--text-primary);
}

.namespace-select, .uuid-input, .name-input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 16px;
}

.uuid-input {
  font-family: 'Consolas', monospace;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.action-btn.primary {
  background: var(--accent-color);
  color: white;
}

.action-btn:not(.primary) {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.output-section {
  display: grid;
  gap: 20px;
}

.result-card, .info-card {
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.result-header h4 {
  margin: 0;
  color: var(--text-primary);
}

.copy-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.uuid-result {
  background: var(--bg-primary);
  padding: 10px;
  border-radius: 8px;
  text-align: center;
}

.uuid-result code {
  font-family: 'Consolas', monospace;
  font-size: 18px;
  color: var(--accent-color);
  font-weight: bold;
}

.info-card h4 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: var(--text-primary);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  color: var(--text-secondary);
  font-size: 14px;
}

.value {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
}

@media (max-width: 768px) {
  .actions {
    flex-direction: column;
  }
  
  .result-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style> 