<template>
  <div class="regex-cheatsheet-tool">
    <div class="tool-header">
      <h3><i class="fas fa-search"></i> 正则表达式速查表</h3>
      <p>常用正则表达式模式和语法参考</p>
    </div>

    <div class="tool-content">
      <div class="search-section">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索正则表达式..."
            class="search-input"
          />
        </div>
      </div>

      <div class="categories">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="activeCategory = category.id"
          class="category-btn"
          :class="{ active: activeCategory === category.id }"
        >
          <i :class="category.icon"></i>
          {{ category.name }}
        </button>
      </div>

      <div class="regex-list">
        <div
          v-for="regex in filteredRegexes"
          :key="regex.id"
          class="regex-card"
        >
          <div class="regex-header">
            <h4>{{ regex.name }}</h4>
            <button @click="copyRegex(regex.pattern)" class="copy-btn" title="复制正则表达式">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <div class="regex-pattern">
            <code>{{ regex.pattern }}</code>
          </div>
          <div class="regex-description">{{ regex.description }}</div>
          <div v-if="regex.examples" class="regex-examples">
            <h5>示例:</h5>
            <div class="examples-list">
              <span
                v-for="example in regex.examples"
                :key="example"
                class="example-tag"
              >
                {{ example }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'RegexCheatsheet',
  setup() {
    const searchQuery = ref('')
    const activeCategory = ref('all')

    const categories = [
      { id: 'all', name: '全部', icon: 'fas fa-list' },
      { id: 'basic', name: '基础语法', icon: 'fas fa-code' },
      { id: 'validation', name: '验证', icon: 'fas fa-check-circle' },
      { id: 'extraction', name: '提取', icon: 'fas fa-extract' },
      { id: 'replacement', name: '替换', icon: 'fas fa-edit' }
    ]

    const regexes = ref([
      // 基础语法
      { id: 1, category: 'basic', name: '任意字符', pattern: '.', description: '匹配除换行符外的任意字符', examples: ['a', '1', '@'] },
      { id: 2, category: 'basic', name: '数字', pattern: '\\d', description: '匹配任意数字字符 [0-9]', examples: ['0', '5', '9'] },
      { id: 3, category: 'basic', name: '非数字', pattern: '\\D', description: '匹配任意非数字字符', examples: ['a', '@', ' '] },
      { id: 4, category: 'basic', name: '字母数字', pattern: '\\w', description: '匹配字母、数字、下划线 [a-zA-Z0-9_]', examples: ['a', '1', '_'] },
      { id: 5, category: 'basic', name: '非字母数字', pattern: '\\W', description: '匹配非字母数字字符', examples: ['@', '#', ' '] },
      { id: 6, category: 'basic', name: '空白字符', pattern: '\\s', description: '匹配任意空白字符', examples: [' ', '\\t', '\\n'] },
      { id: 7, category: 'basic', name: '非空白字符', pattern: '\\S', description: '匹配任意非空白字符', examples: ['a', '1', '@'] },
      { id: 8, category: 'basic', name: '行首', pattern: '^', description: '匹配行的开始', examples: ['^hello'] },
      { id: 9, category: 'basic', name: '行尾', pattern: '$', description: '匹配行的结束', examples: ['world$'] },
      
      // 验证
      { id: 10, category: 'validation', name: '邮箱地址', pattern: '^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$', description: '验证邮箱地址格式', examples: ['user@example.com', 'test.email@domain.org'] },
      { id: 11, category: 'validation', name: '手机号码', pattern: '^1[3-9]\\d{9}$', description: '验证中国大陆手机号', examples: ['13812345678', '18888888888'] },
      { id: 12, category: 'validation', name: 'URL地址', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$', description: '验证URL地址', examples: ['http://example.com', 'https://www.google.com'] },
      { id: 13, category: 'validation', name: 'IP地址', pattern: '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$', description: '验证IPv4地址', examples: ['192.168.1.1', '8.8.8.8'] },
      { id: 14, category: 'validation', name: '密码强度', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', description: '至少8位，包含大小写字母、数字和特殊字符', examples: ['MyPass123!', 'SecuRe#456'] },
      { id: 15, category: 'validation', name: '身份证号', pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$', description: '验证18位身份证号码', examples: ['110101199003074567'] },
      
      // 提取
      { id: 16, category: 'extraction', name: '提取域名', pattern: 'https?:\\/\\/(www\\.)?([^\\s\\/]+)', description: '从URL中提取域名', examples: ['example.com', 'google.com'] },
      { id: 17, category: 'extraction', name: '提取文件扩展名', pattern: '\\.([a-zA-Z0-9]+)$', description: '提取文件扩展名', examples: ['.jpg', '.pdf', '.txt'] },
      { id: 18, category: 'extraction', name: '提取HTML标签', pattern: '<([a-z]+)[^>]*>', description: '提取HTML标签名', examples: ['<div>', '<span class="test">'] },
      { id: 19, category: 'extraction', name: '提取引号内容', pattern: '"([^"]*)"', description: '提取双引号内的内容', examples: ['"Hello World"', '"test"'] },
      
      // 替换
      { id: 20, category: 'replacement', name: '去除多余空格', pattern: '\\s+', description: '匹配连续空格用于替换', examples: ['   ', '\\t\\t'] },
      { id: 21, category: 'replacement', name: '去除首尾空格', pattern: '^\\s+|\\s+$', description: '匹配行首行尾空格', examples: ['  text  '] },
      { id: 22, category: 'replacement', name: '转换驼峰命名', pattern: '[-_]([a-z])', description: '匹配连字符或下划线后的字母', examples: ['hello-world', 'test_case'] }
    ])

    const filteredRegexes = computed(() => {
      let filtered = regexes.value

      // 分类过滤
      if (activeCategory.value !== 'all') {
        filtered = filtered.filter(regex => regex.category === activeCategory.value)
      }

      // 搜索过滤
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(regex =>
          regex.name.toLowerCase().includes(query) ||
          regex.description.toLowerCase().includes(query) ||
          regex.pattern.toLowerCase().includes(query)
        )
      }

      return filtered
    })

    async function copyRegex(pattern) {
      try {
        await navigator.clipboard.writeText(pattern)
      } catch (err) {
        console.error('复制失败:', err)
      }
    }

    return {
      searchQuery,
      activeCategory,
      categories,
      filteredRegexes,
      copyRegex
    }
  }
}
</script>

<style scoped>
.regex-cheatsheet-tool {
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
  padding: 15px 45px 15px 45px;
  border: 2px solid var(--border-color);
  border-radius: 25px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 16px;
}

.categories {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.category-btn:hover {
  border-color: var(--accent-color);
}

.category-btn.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.regex-list {
  display: grid;
  gap: 20px;
}

.regex-card {
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.3s;
}

.regex-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.regex-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.regex-header h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
}

.copy-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.regex-pattern {
  background: var(--bg-primary);
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  border-left: 4px solid var(--accent-color);
}

.regex-pattern code {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 16px;
  color: var(--accent-color);
  font-weight: bold;
  word-break: break-all;
}

.regex-description {
  color: var(--text-secondary);
  margin-bottom: 10px;
  line-height: 1.5;
}

.regex-examples h5 {
  color: var(--text-primary);
  margin-bottom: 10px;
  font-size: 14px;
}

.examples-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.example-tag {
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 10px;
  border-radius: 15px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  border: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .categories {
    gap: 8px;
  }
  
  .category-btn {
    padding: 10px;
    font-size: 13px;
  }
  
  .regex-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style> 