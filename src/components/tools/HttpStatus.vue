<template>
  <div class="http-status-tool">
    <div class="tool-header">
      <h3><i class="fas fa-globe"></i> HTTP 状态码查询</h3>
      <p>查找 HTTP 状态码的含义和使用场景</p>
    </div>

    <div class="tool-content">
      <div class="search-section">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="输入状态码或关键词搜索 (如: 404, Not Found)"
            class="search-input"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="status-categories">
        <button
          v-for="category in categories"
          :key="category.range"
          @click="filterByCategory(category.range)"
          class="category-btn"
          :class="{ active: activeCategory === category.range }"
        >
          <span class="category-code">{{ category.range }}</span>
          <span class="category-name">{{ category.name }}</span>
          <span class="category-count">({{ category.count }})</span>
        </button>
      </div>

      <div class="status-list">
        <div
          v-for="status in filteredStatuses"
          :key="status.code"
          class="status-card"
          :class="`category-${Math.floor(status.code / 100)}`"
        >
          <div class="status-header">
            <div class="status-code">{{ status.code }}</div>
            <div class="status-name">{{ status.name }}</div>
          </div>
          <div class="status-description">{{ status.description }}</div>
          <div class="status-details">
            <div class="status-category">
              <i class="fas fa-tag"></i>
              {{ getCategoryName(status.code) }}
            </div>
            <div class="status-rfc" v-if="status.rfc">
              <i class="fas fa-book"></i>
              RFC {{ status.rfc }}
            </div>
          </div>
          <div v-if="status.examples" class="status-examples">
            <h5><i class="fas fa-lightbulb"></i> 使用场景:</h5>
            <ul>
              <li v-for="example in status.examples" :key="example">{{ example }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div v-if="filteredStatuses.length === 0" class="no-results">
        <i class="fas fa-search"></i>
        <p>没有找到匹配的状态码</p>
        <button @click="clearSearch" class="clear-btn">清除搜索</button>
      </div>

      <div class="reference-section">
        <h4><i class="fas fa-info-circle"></i> HTTP 状态码分类</h4>
        <div class="reference-grid">
          <div class="ref-card">
            <div class="ref-header">1xx 信息性响应</div>
            <p>表示请求已被接受，需要继续处理</p>
          </div>
          <div class="ref-card">
            <div class="ref-header">2xx 成功</div>
            <p>表示请求已成功被服务器接收、理解并处理</p>
          </div>
          <div class="ref-card">
            <div class="ref-header">3xx 重定向</div>
            <p>表示需要客户端采取进一步的操作才能完成请求</p>
          </div>
          <div class="ref-card">
            <div class="ref-header">4xx 客户端错误</div>
            <p>表示客户端看起来可能发生了错误</p>
          </div>
          <div class="ref-card">
            <div class="ref-header">5xx 服务器错误</div>
            <p>表示服务器在处理请求的过程中发生了错误</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'HttpStatus',
  setup() {
    const searchQuery = ref('')
    const activeCategory = ref('all')

    const httpStatuses = ref([
      // 1xx 信息性响应
      { code: 100, name: 'Continue', description: '服务器已接收到请求头，客户端应继续发送请求体', rfc: '7231', examples: ['大文件上传', '表单数据提交'] },
      { code: 101, name: 'Switching Protocols', description: '服务器正在切换协议', rfc: '7231', examples: ['WebSocket升级', 'HTTP/2升级'] },
      { code: 102, name: 'Processing', description: '服务器正在处理请求，但尚无可用响应', rfc: '2518', examples: ['长时间处理的请求'] },

      // 2xx 成功
      { code: 200, name: 'OK', description: '请求成功，服务器成功处理了请求', rfc: '7231', examples: ['GET请求成功', 'POST请求成功'] },
      { code: 201, name: 'Created', description: '请求成功并创建了新的资源', rfc: '7231', examples: ['创建用户', '上传文件'] },
      { code: 202, name: 'Accepted', description: '请求已被接受，但尚未处理完成', rfc: '7231', examples: ['异步任务', '批量处理'] },
      { code: 204, name: 'No Content', description: '请求成功，但没有返回内容', rfc: '7231', examples: ['DELETE请求', 'PUT请求'] },

      // 3xx 重定向
      { code: 301, name: 'Moved Permanently', description: '资源已永久移动到新位置', rfc: '7231', examples: ['网站域名变更', 'URL结构调整'] },
      { code: 302, name: 'Found', description: '资源临时移动到新位置', rfc: '7231', examples: ['临时维护页面', '负载均衡'] },
      { code: 304, name: 'Not Modified', description: '资源未修改，可以使用缓存版本', rfc: '7232', examples: ['浏览器缓存', 'CDN缓存'] },

      // 4xx 客户端错误
      { code: 400, name: 'Bad Request', description: '请求语法错误或参数无效', rfc: '7231', examples: ['JSON格式错误', '必需参数缺失'] },
      { code: 401, name: 'Unauthorized', description: '需要身份验证才能访问资源', rfc: '7235', examples: ['未登录访问', 'Token过期'] },
      { code: 403, name: 'Forbidden', description: '服务器理解请求但拒绝执行', rfc: '7231', examples: ['权限不足', 'IP被封禁'] },
      { code: 404, name: 'Not Found', description: '请求的资源不存在', rfc: '7231', examples: ['页面不存在', 'API端点错误'] },
      { code: 405, name: 'Method Not Allowed', description: '请求方法不被允许', rfc: '7231', examples: ['GET方法访问POST端点'] },
      { code: 409, name: 'Conflict', description: '请求与服务器当前状态冲突', rfc: '7231', examples: ['重复创建资源', '版本冲突'] },
      { code: 422, name: 'Unprocessable Entity', description: '请求格式正确但语义错误', rfc: '4918', examples: ['表单验证失败', '业务规则冲突'] },
      { code: 429, name: 'Too Many Requests', description: '请求过于频繁，触发限流', rfc: '6585', examples: ['API调用超限', 'DDoS保护'] },

      // 5xx 服务器错误
      { code: 500, name: 'Internal Server Error', description: '服务器内部错误', rfc: '7231', examples: ['代码异常', '数据库连接失败'] },
      { code: 501, name: 'Not Implemented', description: '服务器不支持请求的功能', rfc: '7231', examples: ['不支持的HTTP方法'] },
      { code: 502, name: 'Bad Gateway', description: '网关从上游服务器收到无效响应', rfc: '7231', examples: ['代理服务器错误', '负载均衡器问题'] },
      { code: 503, name: 'Service Unavailable', description: '服务器暂时不可用', rfc: '7231', examples: ['服务器维护', '过载保护'] },
      { code: 504, name: 'Gateway Timeout', description: '网关超时', rfc: '7231', examples: ['上游服务器响应超时'] },
    ])

    const categories = computed(() => [
      { range: 'all', name: '全部', count: httpStatuses.value.length },
      { range: '1xx', name: '信息性响应', count: httpStatuses.value.filter(s => Math.floor(s.code / 100) === 1).length },
      { range: '2xx', name: '成功', count: httpStatuses.value.filter(s => Math.floor(s.code / 100) === 2).length },
      { range: '3xx', name: '重定向', count: httpStatuses.value.filter(s => Math.floor(s.code / 100) === 3).length },
      { range: '4xx', name: '客户端错误', count: httpStatuses.value.filter(s => Math.floor(s.code / 100) === 4).length },
      { range: '5xx', name: '服务器错误', count: httpStatuses.value.filter(s => Math.floor(s.code / 100) === 5).length },
    ])

    const filteredStatuses = computed(() => {
      let filtered = httpStatuses.value

      // 分类过滤
      if (activeCategory.value !== 'all') {
        const categoryNum = parseInt(activeCategory.value[0])
        filtered = filtered.filter(status => Math.floor(status.code / 100) === categoryNum)
      }

      // 搜索过滤
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(status =>
          status.code.toString().includes(query) ||
          status.name.toLowerCase().includes(query) ||
          status.description.toLowerCase().includes(query)
        )
      }

      return filtered.sort((a, b) => a.code - b.code)
    })

    function getCategoryName(code) {
      const category = Math.floor(code / 100)
      const names = {
        1: '信息性响应',
        2: '成功',
        3: '重定向',
        4: '客户端错误',
        5: '服务器错误'
      }
      return names[category] || '未知'
    }

    function filterByCategory(category) {
      activeCategory.value = category
    }

    function clearSearch() {
      searchQuery.value = ''
      activeCategory.value = 'all'
    }

    return {
      searchQuery,
      activeCategory,
      httpStatuses,
      categories,
      filteredStatuses,
      getCategoryName,
      filterByCategory,
      clearSearch
    }
  }
}
</script>

<style scoped>
.http-status-tool {
  max-width: 1200px;
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

.search-section {
  margin-bottom: 10px;
}

.search-box {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.search-input {
  width: 100%;
  padding: 15px 50px 15px 45px;
  border: 2px solid var(--border-color);
  border-radius: 25px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 16px;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(69, 183, 209, 0.1);
}

.clear-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 16px;
}

.status-categories {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 120px;
}

.category-btn:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
}

.category-btn.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.category-code {
  font-weight: bold;
  font-size: 18px;
}

.category-name {
  font-size: 12px;
  margin-top: 2px;
}

.category-count {
  font-size: 11px;
  opacity: 0.7;
}

.status-list {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
}

.status-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 10px;
  border-left: 4px solid var(--border-color);
  transition: all 0.3s;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.status-card.category-1 { border-left-color: #74b9ff; }
.status-card.category-2 { border-left-color: #00b894; }
.status-card.category-3 { border-left-color: #fdcb6e; }
.status-card.category-4 { border-left-color: #e17055; }
.status-card.category-5 { border-left-color: #d63031; }

.status-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.status-code {
  background: var(--accent-color);
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 18px;
}

.status-name {
  font-weight: bold;
  font-size: 18px;
  color: var(--text-primary);
}

.status-description {
  color: var(--text-secondary);
  margin-bottom: 10px;
  line-height: 1.5;
}

.status-details {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.status-category, .status-rfc {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-primary);
  padding: 10px;
  border-radius: 4px;
}

.status-examples {
  border-top: 1px solid var(--border-color);
  padding-top: 15px;
}

.status-examples h5 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: var(--text-primary);
  font-size: 14px;
}

.status-examples ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.status-examples li {
  padding: 4px 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.status-examples li:before {
  content: "→";
  color: var(--accent-color);
  margin-right: 8px;
}

.no-results {
  text-align: center;
  padding: 10px;
  color: var(--text-secondary);
}

.no-results i {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.reference-section {
  margin-top: 40px;
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: 12px;
}

.reference-section h4 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: var(--text-primary);
}

.reference-grid {
  display: grid;
  gap: 15px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.ref-card {
  background: var(--bg-primary);
  padding: 10px;
  border-radius: 8px;
  border-left: 4px solid var(--accent-color);
}

.ref-header {
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.ref-card p {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .status-categories {
    gap: 8px;
  }
  
  .category-btn {
    min-width: 100px;
    padding: 10px;
  }
  
  .status-list {
    grid-template-columns: 1fr;
  }
  
  .status-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style> 