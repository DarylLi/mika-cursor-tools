<template>
  <div class="user-agent-tool">
    <div class="tool-header">
      <h3><i class="fas fa-laptop"></i> User Agent 解析器</h3>
      <p>解析 User Agent 字符串，获取浏览器、操作系统等信息</p>
    </div>

    <div class="tool-content">
      <div class="input-section">
        <div class="section-header">
          <label for="ua-input">User Agent 字符串</label>
          <div class="header-actions">
            <button @click="detectUserAgent" class="action-btn">
              <i class="fas fa-search"></i> 检测当前
            </button>
            <button @click="loadExample" class="action-btn">
              <i class="fas fa-lightbulb"></i> 示例
            </button>
            <button @click="clearInput" class="action-btn">
              <i class="fas fa-eraser"></i> 清空
            </button>
          </div>
        </div>
        <textarea
          id="ua-input"
          v-model="userAgent"
          @input="parseUserAgent"
          placeholder="在此输入或粘贴 User Agent 字符串..."
          class="ua-input"
        ></textarea>
      </div>

      <div class="results-section" v-if="parsed">
        <div class="result-grid">
          <div class="result-card">
            <h4><i class="fas fa-globe"></i> 浏览器</h4>
            <div class="result-item">
              <span class="label">名称:</span>
              <span class="value">{{ parsed.browser.name || '未知' }}</span>
            </div>
            <div class="result-item">
              <span class="label">版本:</span>
              <span class="value">{{ parsed.browser.version || '未知' }}</span>
            </div>
            <div class="result-item">
              <span class="label">引擎:</span>
              <span class="value">{{ parsed.engine.name || '未知' }}</span>
            </div>
          </div>

          <div class="result-card">
            <h4><i class="fas fa-desktop"></i> 操作系统</h4>
            <div class="result-item">
              <span class="label">系统:</span>
              <span class="value">{{ parsed.os.name || '未知' }}</span>
            </div>
            <div class="result-item">
              <span class="label">版本:</span>
              <span class="value">{{ parsed.os.version || '未知' }}</span>
            </div>
            <div class="result-item">
              <span class="label">架构:</span>
              <span class="value">{{ parsed.cpu.architecture || '未知' }}</span>
            </div>
          </div>

          <div class="result-card">
            <h4><i class="fas fa-mobile"></i> 设备</h4>
            <div class="result-item">
              <span class="label">类型:</span>
              <span class="value">{{ getDeviceType() }}</span>
            </div>
            <div class="result-item">
              <span class="label">厂商:</span>
              <span class="value">{{ parsed.device.vendor || '未知' }}</span>
            </div>
            <div class="result-item">
              <span class="label">型号:</span>
              <span class="value">{{ parsed.device.model || '未知' }}</span>
            </div>
          </div>
        </div>

        <div class="json-output">
          <div class="section-header">
            <label>解析结果 (JSON)</label>
            <button @click="copyResult" class="action-btn">
              <i class="fas fa-copy"></i> 复制
            </button>
          </div>
          <pre class="json-code">{{ formatJSON(parsed) }}</pre>
        </div>
      </div>

      <div class="examples-section">
        <h4><i class="fas fa-list"></i> 常见 User Agent 示例</h4>
        <div class="examples-grid">
          <div 
            v-for="example in examples" 
            :key="example.name"
            @click="useExample(example.ua)"
            class="example-card"
          >
            <div class="example-header">
              <i :class="example.icon"></i>
              <span>{{ example.name }}</span>
            </div>
            <div class="example-ua">{{ example.ua.substring(0, 100) }}...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  name: 'UserAgent',
  setup() {
    const userAgent = ref('')
    const parsed = ref(null)

    const examples = [
      {
        name: 'Chrome (Windows)',
        icon: 'fab fa-chrome',
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      {
        name: 'Firefox (macOS)',
        icon: 'fab fa-firefox',
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0'
      },
      {
        name: 'Safari (iOS)',
        icon: 'fab fa-safari',
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1'
      },
      {
        name: 'Chrome (Android)',
        icon: 'fab fa-android',
        ua: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
      }
    ]

    function detectUserAgent() {
      userAgent.value = navigator.userAgent
      parseUserAgent()
    }

    function loadExample() {
      userAgent.value = examples[0].ua
      parseUserAgent()
    }

    function clearInput() {
      userAgent.value = ''
      parsed.value = null
    }

    function useExample(ua) {
      userAgent.value = ua
      parseUserAgent()
    }

    function parseUserAgent() {
      if (!userAgent.value.trim()) {
        parsed.value = null
        return
      }

      // 简化的 UA 解析逻辑
      const ua = userAgent.value
      const result = {
        browser: { name: '', version: '' },
        engine: { name: '', version: '' },
        os: { name: '', version: '' },
        device: { vendor: '', model: '', type: '' },
        cpu: { architecture: '' }
      }

      // 浏览器检测
      if (ua.includes('Chrome') && !ua.includes('Chromium')) {
        result.browser.name = 'Chrome'
        const match = ua.match(/Chrome\/([0-9.]+)/)
        if (match) result.browser.version = match[1]
      } else if (ua.includes('Firefox')) {
        result.browser.name = 'Firefox'
        const match = ua.match(/Firefox\/([0-9.]+)/)
        if (match) result.browser.version = match[1]
      } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
        result.browser.name = 'Safari'
        const match = ua.match(/Version\/([0-9.]+)/)
        if (match) result.browser.version = match[1]
      } else if (ua.includes('Edge')) {
        result.browser.name = 'Edge'
        const match = ua.match(/Edge\/([0-9.]+)/)
        if (match) result.browser.version = match[1]
      }

      // 引擎检测
      if (ua.includes('WebKit')) {
        result.engine.name = 'WebKit'
      } else if (ua.includes('Gecko')) {
        result.engine.name = 'Gecko'
      } else if (ua.includes('Trident')) {
        result.engine.name = 'Trident'
      }

      // 操作系统检测
      if (ua.includes('Windows NT')) {
        result.os.name = 'Windows'
        const match = ua.match(/Windows NT ([0-9.]+)/)
        if (match) {
          const version = match[1]
          const versions = {
            '10.0': '10',
            '6.3': '8.1',
            '6.2': '8',
            '6.1': '7'
          }
          result.os.version = versions[version] || version
        }
      } else if (ua.includes('Mac OS X')) {
        result.os.name = 'macOS'
        const match = ua.match(/Mac OS X ([0-9_]+)/)
        if (match) result.os.version = match[1].replace(/_/g, '.')
      } else if (ua.includes('Linux')) {
        result.os.name = 'Linux'
      } else if (ua.includes('Android')) {
        result.os.name = 'Android'
        const match = ua.match(/Android ([0-9.]+)/)
        if (match) result.os.version = match[1]
      } else if (ua.includes('iPhone OS') || ua.includes('iOS')) {
        result.os.name = 'iOS'
        const match = ua.match(/OS ([0-9_]+)/)
        if (match) result.os.version = match[1].replace(/_/g, '.')
      }

      // 设备检测
      if (ua.includes('iPhone')) {
        result.device.type = 'mobile'
        result.device.vendor = 'Apple'
        result.device.model = 'iPhone'
      } else if (ua.includes('iPad')) {
        result.device.type = 'tablet'
        result.device.vendor = 'Apple'
        result.device.model = 'iPad'
      } else if (ua.includes('Android')) {
        result.device.type = ua.includes('Mobile') ? 'mobile' : 'tablet'
        const match = ua.match(/;\s*([^)]+)\s*\)/)
        if (match) {
          const device = match[1].trim()
          if (device.includes('SM-')) {
            result.device.vendor = 'Samsung'
            result.device.model = device
          }
        }
      }

      // 架构检测
      if (ua.includes('x64') || ua.includes('x86_64')) {
        result.cpu.architecture = 'amd64'
      } else if (ua.includes('x86')) {
        result.cpu.architecture = 'ia32'
      } else if (ua.includes('ARM')) {
        result.cpu.architecture = 'arm'
      }

      parsed.value = result
    }

    function getDeviceType() {
      if (!parsed.value) return '未知'
      if (parsed.value.device.type) return parsed.value.device.type
      
      const ua = userAgent.value.toLowerCase()
      if (ua.includes('mobile')) return 'mobile'
      if (ua.includes('tablet')) return 'tablet'
      return 'desktop'
    }

    function formatJSON(obj) {
      return JSON.stringify(obj, null, 2)
    }

    async function copyResult() {
      if (!parsed.value) return
      try {
        await navigator.clipboard.writeText(formatJSON(parsed.value))
      } catch (err) {
        console.error('复制失败:', err)
      }
    }

    return {
      userAgent,
      parsed,
      examples,
      detectUserAgent,
      loadExample,
      clearInput,
      useExample,
      parseUserAgent,
      getDeviceType,
      formatJSON,
      copyResult
    }
  }
}
</script>

<style scoped>
.user-agent-tool {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tool-header {
  text-align: center;
  margin-bottom: 30px;
}

.tool-header h3 {
  font-size: 24px;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.tool-header p {
  color: var(--text-secondary);
  font-size: 14px;
}

.tool-content {
  display: grid;
  gap: 25px;
}

.input-section {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header label {
  font-weight: 600;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.ua-input {
  width: 100%;
  height: 120px;
  padding: 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
}

.results-section {
  display: grid;
  gap: 20px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.result-card {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.result-card h4 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: var(--text-primary);
  font-size: 16px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.result-item:last-child {
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

.json-output {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.json-code {
  background: var(--bg-primary);
  padding: 15px;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: var(--text-primary);
  overflow-x: auto;
  margin: 0;
}

.examples-section {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.examples-section h4 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.example-card {
  background: var(--bg-primary);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.example-card:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
}

.example-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-weight: 600;
  color: var(--text-primary);
}

.example-ua {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  word-break: break-all;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-actions {
    flex-wrap: wrap;
  }

  .result-grid, .examples-grid {
    grid-template-columns: 1fr;
  }
}
</style> 