<template>
  <div class="dns-lookup-tool">
    <div class="tool-header">
      <h3><i class="fas fa-server"></i> DNS 查询工具</h3>
      <p>查询域名的 DNS 记录信息</p>
    </div>

    <div class="tool-content">
      <div class="input-section">
        <div class="input-group">
          <input
            v-model="domain"
            type="text"
            placeholder="输入域名 (如: example.com)"
            class="domain-input"
            @keyup.enter="lookupDNS"
          />
          <select v-model="recordType" class="record-select">
            <option value="A">A 记录</option>
            <option value="AAAA">AAAA 记录</option>
            <option value="CNAME">CNAME 记录</option>
            <option value="MX">MX 记录</option>
            <option value="TXT">TXT 记录</option>
            <option value="NS">NS 记录</option>
            <option value="SOA">SOA 记录</option>
          </select>
          <button @click="lookupDNS" class="lookup-btn" :disabled="loading || !domain.trim()">
            <i class="fas fa-search" v-if="!loading"></i>
            <i class="fas fa-spinner fa-spin" v-else></i>
            查询
          </button>
        </div>
        <div class="quick-actions">
          <button @click="loadExample" class="action-btn">
            <i class="fas fa-lightbulb"></i> 示例域名
          </button>
          <button @click="lookupAll" class="action-btn" :disabled="loading || !domain.trim()">
            <i class="fas fa-list"></i> 查询所有记录
          </button>
        </div>
      </div>

      <div v-if="results.length > 0" class="results-section">
        <div class="results-header">
          <h4><i class="fas fa-list-ul"></i> DNS 查询结果</h4>
          <div class="result-actions">
            <button @click="exportResults" class="export-btn">
              <i class="fas fa-download"></i> 导出
            </button>
            <button @click="clearResults" class="clear-btn">
              <i class="fas fa-trash"></i> 清空
            </button>
          </div>
        </div>

        <div class="dns-records">
          <div
            v-for="(result, index) in results"
            :key="index"
            class="record-card"
            :class="`record-${result.type.toLowerCase()}`"
          >
            <div class="record-header">
              <span class="record-type">{{ result.type }}</span>
              <span class="record-domain">{{ result.domain }}</span>
              <button @click="copyRecord(result)" class="copy-btn" title="复制记录">
                <i class="fas fa-copy"></i>
              </button>
            </div>
            <div class="record-content">
              <div v-if="result.records && result.records.length > 0">
                <div
                  v-for="(record, i) in result.records"
                  :key="i"
                  class="record-item"
                >
                  <div class="record-value">{{ record.value }}</div>
                  <div v-if="record.ttl" class="record-ttl">TTL: {{ record.ttl }}</div>
                  <div v-if="record.priority" class="record-priority">优先级: {{ record.priority }}</div>
                </div>
              </div>
              <div v-else-if="result.error" class="record-error">
                <i class="fas fa-exclamation-triangle"></i>
                {{ result.error }}
              </div>
              <div v-else class="record-empty">
                没有找到 {{ result.type }} 记录
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-section">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>正在查询 DNS 记录...</p>
        </div>
      </div>

      <div class="info-section">
        <h4><i class="fas fa-info-circle"></i> DNS 记录类型说明</h4>
        <div class="info-grid">
          <div class="info-card">
            <div class="info-header">A 记录</div>
            <p>将域名指向 IPv4 地址</p>
          </div>
          <div class="info-card">
            <div class="info-header">AAAA 记录</div>
            <p>将域名指向 IPv6 地址</p>
          </div>
          <div class="info-card">
            <div class="info-header">CNAME 记录</div>
            <p>将域名指向另一个域名</p>
          </div>
          <div class="info-card">
            <div class="info-header">MX 记录</div>
            <p>指定邮件服务器地址</p>
          </div>
          <div class="info-card">
            <div class="info-header">TXT 记录</div>
            <p>存储文本信息，常用于验证</p>
          </div>
          <div class="info-card">
            <div class="info-header">NS 记录</div>
            <p>指定域名服务器</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'DnsLookup',
  setup() {
    const domain = ref('')
    const recordType = ref('A')
    const loading = ref(false)
    const results = ref([])

    const exampleDomains = ['google.com', 'github.com', 'cloudflare.com', 'baidu.com']

    function loadExample() {
      domain.value = exampleDomains[Math.floor(Math.random() * exampleDomains.length)]
    }

    async function lookupDNS() {
      if (!domain.value.trim() || loading.value) return

      loading.value = true
      try {
        // 模拟 DNS 查询 - 在实际应用中需要使用真实的 DNS API
        const result = await simulateDNSLookup(domain.value.trim(), recordType.value)
        
        // 检查是否已存在相同类型的记录
        const existingIndex = results.value.findIndex(
          r => r.domain === result.domain && r.type === result.type
        )
        
        if (existingIndex >= 0) {
          results.value[existingIndex] = result
        } else {
          results.value.unshift(result)
        }
      } catch (error) {
        console.error('DNS 查询失败:', error)
        results.value.unshift({
          domain: domain.value.trim(),
          type: recordType.value,
          error: 'DNS 查询失败: ' + error.message,
          timestamp: new Date()
        })
      } finally {
        loading.value = false
      }
    }

    async function lookupAll() {
      if (!domain.value.trim() || loading.value) return

      const types = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS']
      loading.value = true

      try {
        for (const type of types) {
          const result = await simulateDNSLookup(domain.value.trim(), type)
          
          const existingIndex = results.value.findIndex(
            r => r.domain === result.domain && r.type === result.type
          )
          
          if (existingIndex >= 0) {
            results.value[existingIndex] = result
          } else {
            results.value.unshift(result)
          }
        }
      } catch (error) {
        console.error('DNS 批量查询失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 模拟 DNS 查询函数
    async function simulateDNSLookup(domainName, type) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

      // 模拟不同类型的 DNS 记录
      const mockData = {
        A: [
          { value: '93.184.216.34', ttl: 300 },
          { value: '93.184.216.35', ttl: 300 }
        ],
        AAAA: [
          { value: '2606:2800:220:1:248:1893:25c8:1946', ttl: 300 }
        ],
        CNAME: [
          { value: 'example.com.cdn.cloudflare.net', ttl: 300 }
        ],
        MX: [
          { value: 'mail.example.com', ttl: 300, priority: 10 },
          { value: 'backup.example.com', ttl: 300, priority: 20 }
        ],
        TXT: [
          { value: 'v=spf1 include:_spf.google.com ~all', ttl: 300 },
          { value: 'google-site-verification=abcd1234', ttl: 300 }
        ],
        NS: [
          { value: 'ns1.example.com', ttl: 86400 },
          { value: 'ns2.example.com', ttl: 86400 }
        ]
      }

      // 随机决定是否返回记录
      const hasRecords = Math.random() > 0.2 // 80% 概率有记录

      return {
        domain: domainName,
        type: type,
        records: hasRecords ? mockData[type] || [] : [],
        timestamp: new Date()
      }
    }

    async function copyRecord(record) {
      const text = formatRecordForCopy(record)
      try {
        await navigator.clipboard.writeText(text)
      } catch (err) {
        console.error('复制失败:', err)
      }
    }

    function formatRecordForCopy(record) {
      let text = `${record.domain} ${record.type} 记录:\n`
      
      if (record.records && record.records.length > 0) {
        record.records.forEach(r => {
          text += `  ${r.value}`
          if (r.ttl) text += ` (TTL: ${r.ttl})`
          if (r.priority) text += ` (优先级: ${r.priority})`
          text += '\n'
        })
      } else {
        text += '  无记录\n'
      }
      
      return text
    }

    function exportResults() {
      if (results.value.length === 0) return

      const data = results.value.map(result => {
        const records = result.records || []
        return records.map(record => ({
          domain: result.domain,
          type: result.type,
          value: record.value,
          ttl: record.ttl || '',
          priority: record.priority || '',
          timestamp: result.timestamp.toISOString()
        }))
      }).flat()

      const csv = [
        ['Domain', 'Type', 'Value', 'TTL', 'Priority', 'Timestamp'],
        ...data.map(row => [
          row.domain,
          row.type,
          row.value,
          row.ttl,
          row.priority,
          row.timestamp
        ])
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dns-records-${domain.value}-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }

    function clearResults() {
      results.value = []
    }

    return {
      domain,
      recordType,
      loading,
      results,
      loadExample,
      lookupDNS,
      lookupAll,
      copyRecord,
      exportResults,
      clearResults
    }
  }
}
</script>

<style scoped>
.dns-lookup-tool {
  max-width: 1000px;
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

.input-section {
  background: var(--bg-secondary);
  padding: 25px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-bottom: 25px;
}

.input-group {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.domain-input {
  flex: 1;
  min-width: 250px;
  padding: 12px 15px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 16px;
  transition: all 0.3s;
}

.domain-input:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(69, 183, 209, 0.1);
}

.record-select {
  padding: 12px 15px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 16px;
  min-width: 120px;
}

.lookup-btn {
  padding: 12px 24px;
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

.lookup-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-2px);
}

.lookup-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quick-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 15px;
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

.action-btn:hover:not(:disabled) {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.results-section {
  background: var(--bg-secondary);
  padding: 25px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-bottom: 25px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.results-header h4 {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
  margin: 0;
}

.result-actions {
  display: flex;
  gap: 10px;
}

.export-btn, .clear-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.export-btn {
  background: var(--accent-color);
  color: white;
}

.clear-btn {
  background: #ff6b6b;
  color: white;
}

.export-btn:hover, .clear-btn:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

.dns-records {
  display: grid;
  gap: 15px;
}

.record-card {
  background: var(--bg-primary);
  border-radius: 10px;
  border-left: 4px solid var(--border-color);
  overflow: hidden;
  transition: all 0.3s;
}

.record-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.record-card.record-a { border-left-color: #74b9ff; }
.record-card.record-aaaa { border-left-color: #00b894; }
.record-card.record-cname { border-left-color: #fdcb6e; }
.record-card.record-mx { border-left-color: #e17055; }
.record-card.record-txt { border-left-color: #a29bfe; }
.record-card.record-ns { border-left-color: #fd79a8; }

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.record-type {
  background: var(--accent-color);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
}

.record-domain {
  font-family: 'Consolas', 'Monaco', monospace;
  color: var(--text-primary);
  font-weight: 500;
}

.copy-btn {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.record-content {
  padding: 20px;
}

.record-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
}

.record-item:last-child {
  border-bottom: none;
}

.record-value {
  font-family: 'Consolas', 'Monaco', monospace;
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 5px;
}

.record-ttl, .record-priority {
  font-size: 12px;
  color: var(--text-secondary);
}

.record-error, .record-empty {
  color: var(--text-secondary);
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-error {
  color: #ff6b6b;
}

.loading-section {
  text-align: center;
  padding: 40px;
}

.loading-spinner i {
  font-size: 32px;
  color: var(--accent-color);
  margin-bottom: 15px;
}

.loading-spinner p {
  color: var(--text-secondary);
}

.info-section {
  background: var(--bg-secondary);
  padding: 25px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.info-section h4 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-card {
  background: var(--bg-primary);
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid var(--accent-color);
}

.info-header {
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.info-card p {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .input-group {
    flex-direction: column;
  }
  
  .domain-input {
    min-width: unset;
  }
  
  .results-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .record-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style> 