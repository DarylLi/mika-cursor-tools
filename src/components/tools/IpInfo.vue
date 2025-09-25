<template>
  <div class="ip-info-tool">
    <div class="tool-header">
      <h3><i class="fas fa-globe-americas"></i> IP 信息查询</h3>
      <p>查询 IP 地址的地理位置和网络信息</p>
    </div>

    <div class="tool-content">
      <div class="input-section">
        <div class="input-group">
          <input
            v-model="ipAddress"
            type="text"
            placeholder="输入 IP 地址 (留空查询当前 IP)"
            class="ip-input"
            @keyup.enter="queryIP"
          />
          <button @click="queryIP" class="query-btn" :disabled="loading">
            <i class="fas fa-search" v-if="!loading"></i>
            <i class="fas fa-spinner fa-spin" v-else></i>
            查询
          </button>
        </div>
        <div class="quick-actions">
          <button @click="getCurrentIP" class="action-btn">
            <i class="fas fa-map-marker-alt"></i> 查询当前 IP
          </button>
          <button @click="loadExample" class="action-btn">
            <i class="fas fa-lightbulb"></i> 示例 IP
          </button>
        </div>
      </div>

      <div v-if="ipInfo" class="results-section">
        <div class="info-cards">
          <div class="info-card">
            <h4><i class="fas fa-network-wired"></i> 网络信息</h4>
            <div class="info-item">
              <span class="label">IP 地址:</span>
              <span class="value">{{ ipInfo.ip }}</span>
            </div>
            <div class="info-item">
              <span class="label">IP 版本:</span>
              <span class="value">{{ ipInfo.version }}</span>
            </div>
            <div class="info-item">
              <span class="label">ISP:</span>
              <span class="value">{{ ipInfo.isp || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="label">组织:</span>
              <span class="value">{{ ipInfo.org || '未知' }}</span>
            </div>
          </div>

          <div class="info-card">
            <h4><i class="fas fa-map-marked-alt"></i> 地理位置</h4>
            <div class="info-item">
              <span class="label">国家:</span>
              <span class="value">{{ ipInfo.country || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="label">地区:</span>
              <span class="value">{{ ipInfo.region || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="label">城市:</span>
              <span class="value">{{ ipInfo.city || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="label">时区:</span>
              <span class="value">{{ ipInfo.timezone || '未知' }}</span>
            </div>
          </div>

          <div class="info-card">
            <h4><i class="fas fa-shield-alt"></i> 安全信息</h4>
            <div class="info-item">
              <span class="label">是否代理:</span>
              <span class="value" :class="ipInfo.proxy ? 'warning' : 'safe'">
                {{ ipInfo.proxy ? '是' : '否' }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">是否 VPN:</span>
              <span class="value" :class="ipInfo.vpn ? 'warning' : 'safe'">
                {{ ipInfo.vpn ? '是' : '否' }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">是否 Tor:</span>
              <span class="value" :class="ipInfo.tor ? 'danger' : 'safe'">
                {{ ipInfo.tor ? '是' : '否' }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">威胁等级:</span>
              <span class="value" :class="getThreatClass(ipInfo.threat)">
                {{ getThreatLevel(ipInfo.threat) }}
              </span>
            </div>
          </div>
        </div>

        <div class="json-section">
          <div class="section-header">
            <h4><i class="fas fa-code"></i> 完整信息 (JSON)</h4>
            <button @click="copyJSON" class="copy-btn">
              <i class="fas fa-copy"></i> 复制
            </button>
          </div>
          <pre class="json-output">{{ formatJSON(ipInfo) }}</pre>
        </div>
      </div>

      <div v-if="loading" class="loading-section">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>正在查询 IP 信息...</p>
        </div>
      </div>

      <div v-if="error" class="error-section">
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error }}</p>
          <button @click="clearError" class="clear-error-btn">清除错误</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'IpInfo',
  setup() {
    const ipAddress = ref('')
    const loading = ref(false)
    const ipInfo = ref(null)
    const error = ref('')

    const exampleIPs = ['8.8.8.8', '1.1.1.1', '208.67.222.222', '114.114.114.114']

    function loadExample() {
      ipAddress.value = exampleIPs[Math.floor(Math.random() * exampleIPs.length)]
    }

    function getCurrentIP() {
      ipAddress.value = ''
      queryIP()
    }

    async function queryIP() {
      if (loading.value) return

      loading.value = true
      error.value = ''
      ipInfo.value = null

      try {
        // 模拟 IP 查询 API
        const result = await simulateIPLookup(ipAddress.value.trim())
        ipInfo.value = result
      } catch (err) {
        error.value = err.message || 'IP 查询失败'
      } finally {
        loading.value = false
      }
    }

    // 模拟 IP 查询
    async function simulateIPLookup(ip) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

      // 如果没有提供 IP，模拟获取当前 IP
      if (!ip) {
        ip = '203.208.60.1' // 模拟当前 IP
      }

      // 验证 IP 格式
      if (!isValidIP(ip)) {
        throw new Error('无效的 IP 地址格式')
      }

      // 模拟返回数据
      const mockData = {
        '8.8.8.8': {
          ip: '8.8.8.8',
          version: 'IPv4',
          country: '美国',
          region: '加利福尼亚州',
          city: '山景城',
          timezone: 'America/Los_Angeles',
          isp: 'Google LLC',
          org: 'Google Public DNS',
          proxy: false,
          vpn: false,
          tor: false,
          threat: 0
        },
        '1.1.1.1': {
          ip: '1.1.1.1',
          version: 'IPv4',
          country: '美国',
          region: '加利福尼亚州',
          city: '旧金山',
          timezone: 'America/Los_Angeles',
          isp: 'Cloudflare Inc',
          org: 'Cloudflare Public DNS',
          proxy: false,
          vpn: false,
          tor: false,
          threat: 0
        },
        '114.114.114.114': {
          ip: '114.114.114.114',
          version: 'IPv4',
          country: '中国',
          region: '江苏省',
          city: '南京',
          timezone: 'Asia/Shanghai',
          isp: '南京信风网络科技有限公司',
          org: '114DNS',
          proxy: false,
          vpn: false,
          tor: false,
          threat: 0
        }
      }

      // 如果有预设数据则返回，否则生成随机数据
      if (mockData[ip]) {
        return mockData[ip]
      }

      // 生成随机模拟数据
      const countries = ['美国', '中国', '日本', '德国', '英国', '法国', '加拿大']
      const cities = ['北京', '上海', '纽约', '洛杉矶', '伦敦', '巴黎', '东京']
      const isps = ['China Telecom', 'China Unicom', 'Comcast', 'Verizon', 'AT&T']

      return {
        ip: ip,
        version: ip.includes(':') ? 'IPv6' : 'IPv4',
        country: countries[Math.floor(Math.random() * countries.length)],
        region: '未知',
        city: cities[Math.floor(Math.random() * cities.length)],
        timezone: 'UTC+8',
        isp: isps[Math.floor(Math.random() * isps.length)],
        org: '未知',
        proxy: Math.random() > 0.9,
        vpn: Math.random() > 0.8,
        tor: Math.random() > 0.95,
        threat: Math.floor(Math.random() * 5)
      }
    }

    function isValidIP(ip) {
      // IPv4 正则
      const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      // IPv6 正则（简化版）
      const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
      
      return ipv4Regex.test(ip) || ipv6Regex.test(ip)
    }

    function getThreatLevel(threat) {
      if (threat === 0) return '安全'
      if (threat <= 2) return '低风险'
      if (threat <= 3) return '中风险'
      return '高风险'
    }

    function getThreatClass(threat) {
      if (threat === 0) return 'safe'
      if (threat <= 2) return 'warning'
      return 'danger'
    }

    function formatJSON(obj) {
      return JSON.stringify(obj, null, 2)
    }

    async function copyJSON() {
      if (!ipInfo.value) return
      try {
        await navigator.clipboard.writeText(formatJSON(ipInfo.value))
      } catch (err) {
        console.error('复制失败:', err)
      }
    }

    function clearError() {
      error.value = ''
    }

    return {
      ipAddress,
      loading,
      ipInfo,
      error,
      loadExample,
      getCurrentIP,
      queryIP,
      getThreatLevel,
      getThreatClass,
      formatJSON,
      copyJSON,
      clearError
    }
  }
}
</script>

<style scoped>
.ip-info-tool {
  max-width: 1000px;
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

.tool-header p {
  color: var(--text-secondary);
  font-size: 14px;
}

.input-section {
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-bottom: 10px;
}

.input-group {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.ip-input {
  flex: 1;
  min-width: 250px;
  padding: 10px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 16px;
  transition: all 0.3s;
}

.ip-input:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(69, 183, 209, 0.1);
}

.query-btn {
  padding: 10px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.query-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-2px);
}

.query-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quick-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 10px;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.results-section {
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-bottom: 10px;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 10px;
}

.info-card {
  background: var(--bg-primary);
  padding: 10px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.info-card h4 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: var(--text-primary);
  font-size: 16px;
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

.value.safe {
  color: #00b894;
}

.value.warning {
  color: #fdcb6e;
}

.value.danger {
  color: #e17055;
}

.json-section {
  background: var(--bg-primary);
  padding: 10px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header h4 {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
  margin: 0;
}

.copy-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.copy-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.json-output {
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: var(--text-primary);
  overflow-x: auto;
  margin: 0;
}

.loading-section {
  text-align: center;
  padding: 10px;
}

.loading-spinner i {
  font-size: 32px;
  color: var(--accent-color);
  margin-bottom: 10px;
}

.loading-spinner p {
  color: var(--text-secondary);
}

.error-section {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 12px;
  padding: 10px;
  text-align: center;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.error-message i {
  font-size: 32px;
  color: #e53e3e;
}

.error-message p {
  color: #e53e3e;
  font-weight: 500;
  margin: 0;
}

.clear-error-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.clear-error-btn:hover {
  background: #c53030;
}

@media (max-width: 768px) {
  .input-group {
    flex-direction: column;
  }
  
  .ip-input {
    min-width: unset;
  }
  
  .info-cards {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style> 