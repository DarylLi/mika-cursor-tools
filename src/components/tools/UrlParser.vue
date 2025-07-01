<template>
  <div class="tool-container">
    <div class="tool-header">
      <div class="header-icon">🔗</div>
      <h2>URL 解析工具</h2>
      <p>解析URL的各个组成部分，包括协议、域名、路径、参数等</p>
      
      <div class="example-section">
        <span class="example-label">快速开始：</span>
        <button @click="loadExample('basic')" class="example-btn">
          <i class="fas fa-link"></i> 基础URL
        </button>
        <button @click="loadExample('complex')" class="example-btn">
          <i class="fas fa-cogs"></i> 复杂URL
        </button>
        <button @click="loadExample('api')" class="example-btn">
          <i class="fas fa-cloud"></i> API地址
        </button>
      </div>
    </div>

    <div class="input-card">
      <div class="card-header">
        <h3><i class="fas fa-edit"></i> URL 输入</h3>
        <div class="input-actions">
          <button @click="pasteFromClipboard" class="action-btn">
            <i class="fas fa-paste"></i> 从剪贴板粘贴
          </button>
          <button @click="clearInput" class="action-btn">
            <i class="fas fa-trash"></i> 清空
          </button>
        </div>
      </div>
      
      <div class="input-section">
        <input
          v-model="urlInput"
          type="text"
          placeholder="请输入要解析的URL地址..."
          class="url-input"
          @input="parseUrl"
          @paste="handlePaste"
        />
        
        <div class="url-status">
          <div class="status-indicator" :class="{ valid: isValidUrl, invalid: !isValidUrl && urlInput.trim() }">
            <i :class="isValidUrl ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
            {{ urlStatus }}
          </div>
          <div v-if="urlInput.length > 0" class="url-length">
            长度: {{ urlInput.length }} 字符
          </div>
        </div>
      </div>
    </div>

    <div v-if="parsedUrl" class="analysis-card">
      <div class="card-header">
        <h3><i class="fas fa-search"></i> URL 解析结果</h3>
        <div class="analysis-actions">
          <button @click="copyAnalysis" class="action-btn">
            <i class="fas fa-copy"></i> 复制结果
          </button>
          <button @click="exportJson" class="action-btn">
            <i class="fas fa-download"></i> 导出JSON
          </button>
        </div>
      </div>
      
      <div class="analysis-sections">
        <!-- 基本信息 -->
        <div class="analysis-section">
          <h4><i class="fas fa-info-circle"></i> 基本信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>完整URL:</label>
              <span class="value selectable">{{ parsedUrl.href }}</span>
            </div>
            <div class="info-item">
              <label>协议:</label>
              <span class="value protocol">{{ parsedUrl.protocol }}</span>
            </div>
            <div class="info-item">
              <label>主机:</label>
              <span class="value host">{{ parsedUrl.host }}</span>
            </div>
            <div class="info-item">
              <label>域名:</label>
              <span class="value hostname">{{ parsedUrl.hostname }}</span>
            </div>
            <div class="info-item" v-if="parsedUrl.port">
              <label>端口:</label>
              <span class="value port">{{ parsedUrl.port }}</span>
            </div>
            <div class="info-item">
              <label>路径:</label>
              <span class="value path">{{ parsedUrl.pathname }}</span>
            </div>
          </div>
        </div>

        <!-- 查询参数 -->
        <div class="analysis-section" v-if="queryParams.length > 0">
          <h4><i class="fas fa-list"></i> 查询参数</h4>
          <div class="params-table">
            <div class="table-header">
              <span>参数名</span>
              <span>参数值</span>
              <span>操作</span>
            </div>
            <div v-for="param in queryParams" :key="param.key" class="param-row">
              <span class="param-key">{{ param.key }}</span>
              <span class="param-value">{{ param.value }}</span>
              <div class="param-actions">
                <button @click="copyParam(param)" class="mini-btn" title="复制">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 路径分析 -->
        <div class="analysis-section" v-if="pathSegments.length > 0">
          <h4><i class="fas fa-folder-tree"></i> 路径分析</h4>
          <div class="path-breadcrumb">
            <span v-for="(segment, index) in pathSegments" :key="index" class="breadcrumb-item">
              <span class="segment">{{ segment }}</span>
              <i v-if="index < pathSegments.length - 1" class="fas fa-chevron-right separator"></i>
            </span>
          </div>
        </div>

        <!-- 锚点和哈希 -->
        <div class="analysis-section" v-if="parsedUrl.hash">
          <h4><i class="fas fa-hashtag"></i> 锚点/哈希</h4>
          <div class="hash-info">
            <span class="hash-value">{{ parsedUrl.hash }}</span>
            <button @click="copyHash" class="mini-btn" title="复制锚点">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>

        <!-- 域名信息 -->
        <div class="analysis-section" v-if="domainInfo">
          <h4><i class="fas fa-globe"></i> 域名信息</h4>
          <div class="domain-grid">
            <div class="domain-item">
              <label>顶级域名:</label>
              <span class="value">{{ domainInfo.tld }}</span>
            </div>
            <div class="domain-item">
              <label>二级域名:</label>
              <span class="value">{{ domainInfo.domain }}</span>
            </div>
            <div class="domain-item" v-if="domainInfo.subdomain">
              <label>子域名:</label>
              <span class="value">{{ domainInfo.subdomain }}</span>
            </div>
            <div class="domain-item">
              <label>域名类型:</label>
              <span class="value">{{ domainInfo.type }}</span>
            </div>
          </div>
        </div>

        <!-- 安全性分析 -->
        <div class="analysis-section">
          <h4><i class="fas fa-shield-alt"></i> 安全性分析</h4>
          <div class="security-checks">
            <div class="security-item" :class="{ safe: parsedUrl.protocol === 'https:', unsafe: parsedUrl.protocol === 'http:' }">
              <i :class="parsedUrl.protocol === 'https:' ? 'fas fa-lock' : 'fas fa-unlock'"></i>
              <span>{{ parsedUrl.protocol === 'https:' ? 'HTTPS 安全连接' : 'HTTP 非安全连接' }}</span>
            </div>
            <div class="security-item" :class="{ safe: !hasSuspiciousChars, unsafe: hasSuspiciousChars }">
              <i :class="hasSuspiciousChars ? 'fas fa-exclamation-triangle' : 'fas fa-check'"></i>
              <span>{{ hasSuspiciousChars ? '包含可疑字符' : '字符安全' }}</span>
            </div>
            <div class="security-item" :class="{ safe: !isIpAddress, unsafe: isIpAddress }">
              <i :class="isIpAddress ? 'fas fa-exclamation-triangle' : 'fas fa-check'"></i>
              <span>{{ isIpAddress ? '使用IP地址' : '使用域名' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="tools-card">
      <div class="card-header">
        <h3><i class="fas fa-tools"></i> URL 工具</h3>
      </div>
      
      <div class="tools-grid">
        <div class="tool-item">
          <h5>URL编码/解码</h5>
          <div class="encode-section">
            <input v-model="encodeInput" type="text" placeholder="输入要编码的文本" class="tool-input" />
            <div class="tool-buttons">
              <button @click="encodeUrl" class="tool-btn">编码</button>
              <button @click="decodeUrl" class="tool-btn">解码</button>
            </div>
            <div v-if="encodeResult" class="tool-result">
              <span>{{ encodeResult }}</span>
              <button @click="copyResult" class="mini-btn">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="tool-item">
          <h5>URL构建器</h5>
          <div class="builder-section">
            <input v-model="baseUrl" type="text" placeholder="基础URL" class="tool-input" />
            <input v-model="newParams" type="text" placeholder="参数 (key=value&key2=value2)" class="tool-input" />
            <button @click="buildUrl" class="tool-btn">构建URL</button>
            <div v-if="builtUrl" class="tool-result">
              <span>{{ builtUrl }}</span>
              <button @click="copyBuiltUrl" class="mini-btn">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="success" class="success-card">
      <i class="fas fa-check-circle"></i> {{ success }}
    </div>

    <div v-if="error" class="error-card">
      <i class="fas fa-exclamation-triangle"></i> {{ error }}
    </div>

    <div class="help-card">
      <h4><i class="fas fa-info-circle"></i> 使用说明</h4>
      <div class="help-content">
        <div class="help-section">
          <h5>功能特点：</h5>
          <ul>
            <li>完整URL结构解析</li>
            <li>查询参数提取和分析</li>
            <li>路径分段和层次显示</li>
            <li>域名结构分析</li>
            <li>安全性检查</li>
            <li>URL编码/解码工具</li>
            <li>URL构建器</li>
          </ul>
        </div>
        
        <div class="help-section">
          <h5>URL结构示例：</h5>
          <pre><code>https://www.example.com:8080/path/to/page?param1=value1&param2=value2#section

协议: https:
主机: www.example.com:8080
路径: /path/to/page
参数: ‘param1=value1’&‘param2=value2’
锚点: #section</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'UrlParser',
  setup() {
    const urlInput = ref('')
    const parsedUrl = ref(null)
    const encodeInput = ref('')
    const encodeResult = ref('')
    const baseUrl = ref('')
    const newParams = ref('')
    const builtUrl = ref('')
    const success = ref('')
    const error = ref('')

    const isValidUrl = computed(() => {
      if (!urlInput.value.trim()) return false
      try {
        new URL(urlInput.value)
        return true
      } catch {
        return false
      }
    })

    const urlStatus = computed(() => {
      if (!urlInput.value.trim()) return '等待输入URL'
      return isValidUrl.value ? 'URL格式正确' : 'URL格式错误'
    })

    const queryParams = computed(() => {
      if (!parsedUrl.value || !parsedUrl.value.search) return []
      
      const params = []
      const searchParams = new URLSearchParams(parsedUrl.value.search)
      
      for (const [key, value] of searchParams) {
        params.push({ key, value })
      }
      
      return params
    })

    const pathSegments = computed(() => {
      if (!parsedUrl.value || !parsedUrl.value.pathname) return []
      
      return parsedUrl.value.pathname
        .split('/')
        .filter(segment => segment.length > 0)
    })

    const domainInfo = computed(() => {
      if (!parsedUrl.value) return null
      
      const hostname = parsedUrl.value.hostname
      const parts = hostname.split('.')
      
      if (parts.length < 2) return null
      
      const tld = parts[parts.length - 1]
      const domain = parts[parts.length - 2]
      const subdomain = parts.length > 2 ? parts.slice(0, -2).join('.') : null
      
      const type = getHostnameType(hostname)
      
      return { tld, domain, subdomain, type }
    })

    const hasSuspiciousChars = computed(() => {
      if (!urlInput.value) return false
      
      const suspiciousPatterns = [
        /[<>]/,  // HTML tags
        /javascript:/i,  // JavaScript protocol
        /data:/i,  // Data protocol
        /\.\./,  // Directory traversal
        /%[0-9a-f]{2}/i  // Encoded characters (might be suspicious)
      ]
      
      return suspiciousPatterns.some(pattern => pattern.test(urlInput.value))
    })

    const isIpAddress = computed(() => {
      if (!parsedUrl.value) return false
      
      const hostname = parsedUrl.value.hostname
      const ipv4Pattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/
      const ipv6Pattern = /^[0-9a-f:]+$/i
      
      return ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname)
    })

    const examples = {
      basic: 'https://www.example.com/page?name=value#section',
      complex: 'https://api.example.com:8080/v1/users/123?include=posts,comments&sort=date&limit=10#profile',
      api: 'https://jsonplaceholder.typicode.com/posts?userId=1&_limit=5'
    }

    const loadExample = (type) => {
      urlInput.value = examples[type]
      parseUrl()
    }

    const parseUrl = () => {
      try {
        error.value = ''
        
        if (!urlInput.value.trim()) {
          parsedUrl.value = null
          return
        }
        
        // Add protocol if missing
        let url = urlInput.value.trim()
        if (!url.includes('://')) {
          url = 'https://' + url
        }
        
        const parsed = new URL(url)
        parsedUrl.value = parsed
        
      } catch (err) {
        parsedUrl.value = null
        error.value = ''  // Don't show error for invalid URLs during typing
      }
    }

    const getHostnameType = (hostname) => {
      if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return 'IPv4地址'
      if (/^[0-9a-f:]+$/i.test(hostname)) return 'IPv6地址'
      if (hostname === 'localhost') return '本地主机'
      if (hostname.endsWith('.local')) return '本地域名'
      if (hostname.includes('www.')) return '万维网域名'
      return '普通域名'
    }

    const pasteFromClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText()
        urlInput.value = text
        parseUrl()
        success.value = '已从剪贴板粘贴URL'
        setTimeout(() => success.value = '', 3000)
      } catch (err) {
        error.value = '无法访问剪贴板'
        setTimeout(() => error.value = '', 3000)
      }
    }

    const clearInput = () => {
      urlInput.value = ''
      parsedUrl.value = null
    }

    const handlePaste = () => {
      setTimeout(parseUrl, 10)
    }

    const copyAnalysis = () => {
      if (!parsedUrl.value) return
      
      const analysis = {
        url: parsedUrl.value.href,
        protocol: parsedUrl.value.protocol,
        host: parsedUrl.value.host,
        hostname: parsedUrl.value.hostname,
        port: parsedUrl.value.port,
        pathname: parsedUrl.value.pathname,
        search: parsedUrl.value.search,
        hash: parsedUrl.value.hash,
        params: queryParams.value,
        pathSegments: pathSegments.value,
        domainInfo: domainInfo.value
      }
      
      navigator.clipboard.writeText(JSON.stringify(analysis, null, 2))
      success.value = '解析结果已复制到剪贴板'
      setTimeout(() => success.value = '', 3000)
    }

    const exportJson = () => {
      if (!parsedUrl.value) return
      
      const analysis = {
        url: parsedUrl.value.href,
        protocol: parsedUrl.value.protocol,
        host: parsedUrl.value.host,
        hostname: parsedUrl.value.hostname,
        port: parsedUrl.value.port,
        pathname: parsedUrl.value.pathname,
        search: parsedUrl.value.search,
        hash: parsedUrl.value.hash,
        params: queryParams.value,
        pathSegments: pathSegments.value,
        domainInfo: domainInfo.value
      }
      
      const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'url-analysis.json'
      a.click()
      URL.revokeObjectURL(url)
      
      success.value = 'JSON文件已下载'
      setTimeout(() => success.value = '', 3000)
    }

    const copyParam = (param) => {
      navigator.clipboard.writeText(`${param.key}=${param.value}`)
      success.value = `参数 ${param.key} 已复制`
      setTimeout(() => success.value = '', 3000)
    }

    const copyHash = () => {
      navigator.clipboard.writeText(parsedUrl.value.hash)
      success.value = '锚点已复制'
      setTimeout(() => success.value = '', 3000)
    }

    const encodeUrl = () => {
      encodeResult.value = encodeURIComponent(encodeInput.value)
    }

    const decodeUrl = () => {
      try {
        encodeResult.value = decodeURIComponent(encodeInput.value)
      } catch (err) {
        error.value = '解码失败，请检查输入格式'
        setTimeout(() => error.value = '', 3000)
      }
    }

    const copyResult = () => {
      navigator.clipboard.writeText(encodeResult.value)
      success.value = '结果已复制'
      setTimeout(() => success.value = '', 3000)
    }

    const buildUrl = () => {
      try {
        const url = new URL(baseUrl.value)
        
        if (newParams.value) {
          const params = new URLSearchParams(newParams.value)
          for (const [key, value] of params) {
            url.searchParams.set(key, value)
          }
        }
        
        builtUrl.value = url.toString()
      } catch (err) {
        error.value = 'URL构建失败，请检查输入格式'
        setTimeout(() => error.value = '', 3000)
      }
    }

    const copyBuiltUrl = () => {
      navigator.clipboard.writeText(builtUrl.value)
      success.value = '构建的URL已复制'
      setTimeout(() => success.value = '', 3000)
    }

    return {
      urlInput,
      parsedUrl,
      encodeInput,
      encodeResult,
      baseUrl,
      newParams,
      builtUrl,
      success,
      error,
      isValidUrl,
      urlStatus,
      queryParams,
      pathSegments,
      domainInfo,
      hasSuspiciousChars,
      isIpAddress,
      loadExample,
      parseUrl,
      pasteFromClipboard,
      clearInput,
      handlePaste,
      copyAnalysis,
      exportJson,
      copyParam,
      copyHash,
      encodeUrl,
      decodeUrl,
      copyResult,
      buildUrl,
      copyBuiltUrl
    }
  }
}
</script>

<style scoped>
.tool-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.tool-header {
  text-align: center;
  margin-bottom: 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  padding: 40px 32px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
}

.header-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.9;
}

.tool-header h2 {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
}

.tool-header p {
  margin: 0 0 24px 0;
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.5;
}

.example-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.example-label {
  font-size: 14px;
  opacity: 0.8;
}

.example-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.example-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.input-card, .analysis-card, .tools-card, .help-card, .success-card, .error-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f8fafc;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-actions, .analysis-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.url-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.url-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.url-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 14px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.status-indicator.valid {
  color: #059669;
}

.status-indicator.invalid {
  color: #dc2626;
}

.url-length {
  color: #6b7280;
}

.analysis-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.analysis-section {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.analysis-section h4 {
  margin: 0 0 16px 0;
  color: #2d3748;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-grid, .domain-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.info-item, .domain-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-item label, .domain-item label {
  font-weight: 500;
  color: #4a5568;
  min-width: 80px;
}

.value {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 14px;
  color: #1f2937;
  word-break: break-all;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.value.selectable {
  cursor: text;
  user-select: all;
}

.value.protocol { color: #7c3aed; }
.value.host { color: #059669; }
.value.hostname { color: #dc2626; }
.value.port { color: #ea580c; }
.value.path { color: #0891b2; }

.params-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 16px;
  padding: 8px 12px;
  background: #e2e8f0;
  border-radius: 6px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.param-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 16px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  align-items: center;
}

.param-key {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-weight: 600;
  color: #7c3aed;
}

.param-value {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  color: #1f2937;
  word-break: break-all;
}

.param-actions {
  display: flex;
  gap: 4px;
}

.mini-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #6b7280;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.mini-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.path-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.segment {
  background: white;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  color: #1f2937;
}

.separator {
  color: #6b7280;
  font-size: 12px;
}

.hash-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hash-value {
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  color: #1f2937;
  flex: 1;
}

.security-checks {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  font-weight: 500;
}

.security-item.safe {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.security-item.unsafe {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.tool-item {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.tool-item h5 {
  margin: 0 0 16px 0;
  color: #2d3748;
  font-size: 16px;
  font-weight: 600;
}

.encode-section, .builder-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.tool-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.tool-buttons {
  display: flex;
  gap: 8px;
}

.tool-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  flex: 1;
}

.tool-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.tool-result {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.tool-result span {
  flex: 1;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 14px;
  color: #1f2937;
  word-break: break-all;
}

.success-card {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.error-card {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.help-card h4 {
  margin: 0 0 20px 0;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.help-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.help-section h5 {
  margin: 0 0 12px 0;
  color: #4a5568;
  font-size: 16px;
  font-weight: 600;
}

.help-section ul {
  margin: 0;
  padding-left: 20px;
}

.help-section li {
  margin-bottom: 6px;
  color: #4a5568;
  line-height: 1.4;
}

.help-section pre {
  margin: 0;
  background: #1f2937;
  color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
  overflow-x: auto;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .tool-container {
    padding: 16px;
  }
  
  .help-content, .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .example-section {
    flex-direction: column;
    gap: 8px;
  }
  
  .input-actions, .analysis-actions {
    flex-direction: column;
  }
  
  .info-grid, .domain-grid {
    grid-template-columns: 1fr;
  }
  
  .param-row, .table-header {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .tool-buttons {
    flex-direction: column;
  }
}
</style> 