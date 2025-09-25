<template>
  <div class="fake-user-tool">
    <div class="tool-header">
      <h3><i class="fas fa-user-friends"></i> 虚拟人员资料生成器</h3>
      <p>生成完整的虚拟人员资料，适用于开发测试、设计原型等场景</p>
    </div>

    <div class="tool-content">
      <div class="generation-options">
        <div class="option-group">
          <label for="locale">国家/地区</label>
          <select id="locale" v-model="locale">
            <option value="zh">中国</option>
            <option value="us">美国</option>
            <option value="uk">英国</option>
            <option value="jp">日本</option>
            <option value="kr">韩国</option>
          </select>
        </div>
        
        <div class="option-group">
          <label for="gender">性别</label>
          <select id="gender" v-model="gender">
            <option value="random">随机</option>
            <option value="male">男性</option>
            <option value="female">女性</option>
          </select>
        </div>
        
        <div class="option-group">
          <label for="count">生成数量</label>
          <input type="number" id="count" v-model.number="count" min="1" max="50" />
        </div>
        
        <div class="option-group">
          <label for="fields">包含字段</label>
          <div class="checkbox-group">
            <label><input type="checkbox" v-model="includeFields.basic" /> 基本信息</label>
            <label><input type="checkbox" v-model="includeFields.contact" /> 联系方式</label>
            <label><input type="checkbox" v-model="includeFields.work" /> 工作信息</label>
            <label><input type="checkbox" v-model="includeFields.finance" /> 财务信息</label>
            <label><input type="checkbox" v-model="includeFields.social" /> 社交媒体</label>
          </div>
        </div>
      </div>

      <div class="actions">
        <button @click="generateUsers" class="btn-primary">
          <i class="fas fa-user-plus"></i> 生成用户
        </button>
        <button @click="exportJSON" class="btn-secondary" :disabled="!users.length">
          <i class="fas fa-file-download"></i> 导出JSON
        </button>
        <button @click="exportCSV" class="btn-secondary" :disabled="!users.length">
          <i class="fas fa-file-csv"></i> 导出CSV
        </button>
        <button @click="copyAllUsers" class="btn-secondary" :disabled="!users.length">
          <i class="fas fa-copy"></i> 复制全部
        </button>
      </div>

      <div class="users-list" v-if="users.length">
        <h4>生成的用户 ({{ users.length }})</h4>
        <div class="user-cards">
          <div v-for="(user, index) in users" :key="index" class="user-card">
            <div class="user-header">
              <div class="user-avatar">
                <img :src="user.avatar" :alt="user.name" />
              </div>
              <div class="user-basic">
                <h5>{{ user.name }}</h5>
                <p>{{ user.age }}岁 {{ user.gender === 'male' ? '男' : '女' }}</p>
              </div>
              <button @click="copyUser(user)" class="copy-btn" title="复制此用户">
                <i class="fas fa-copy"></i>
              </button>
            </div>
            
            <div class="user-details">
              <div v-if="includeFields.basic" class="detail-section">
                <h6>基本信息</h6>
                <p><strong>姓名:</strong> {{ user.name }}</p>
                <p><strong>年龄:</strong> {{ user.age }}岁</p>
                <p><strong>性别:</strong> {{ user.gender === 'male' ? '男' : '女' }}</p>
                <p><strong>生日:</strong> {{ user.birthday }}</p>
                <p><strong>身份证:</strong> {{ user.idCard }}</p>
              </div>
              
              <div v-if="includeFields.contact" class="detail-section">
                <h6>联系方式</h6>
                <p><strong>手机:</strong> {{ user.phone }}</p>
                <p><strong>邮箱:</strong> {{ user.email }}</p>
                <p><strong>地址:</strong> {{ user.address }}</p>
              </div>
              
              <div v-if="includeFields.work" class="detail-section">
                <h6>工作信息</h6>
                <p><strong>公司:</strong> {{ user.company }}</p>
                <p><strong>职位:</strong> {{ user.job }}</p>
                <p><strong>部门:</strong> {{ user.department }}</p>
                <p><strong>薪资:</strong> {{ user.salary }}</p>
              </div>
              
              <div v-if="includeFields.finance" class="detail-section">
                <h6>财务信息</h6>
                <p><strong>银行卡:</strong> {{ user.bankCard }}</p>
                <p><strong>支付宝:</strong> {{ user.alipay }}</p>
                <p><strong>信用额度:</strong> {{ user.creditLimit }}</p>
              </div>
              
              <div v-if="includeFields.social" class="detail-section">
                <h6>社交媒体</h6>
                <p><strong>微信:</strong> {{ user.wechat }}</p>
                <p><strong>QQ:</strong> {{ user.qq }}</p>
                <p><strong>微博:</strong> {{ user.weibo }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, getCurrentInstance } from 'vue'

export default {
  name: 'FakeUser',
  setup() {
    const instance = getCurrentInstance()
    const locale = ref('zh')
    const gender = ref('random')
    const count = ref(5)
    const users = ref([])
    
    const includeFields = ref({
      basic: true,
      contact: true,
      work: true,
      finance: false,
      social: false
    })

    // 虚拟数据库
    const data = {
      zh: {
        firstNames: {
          male: ['伟', '强', '磊', '军', '勇', '涛', '明', '超', '刚', '平', '辉', '杰', '华', '峰', '鹏', '飞', '宇', '斌', '博', '海'],
          female: ['芳', '娜', '敏', '静', '丽', '红', '艳', '莉', '玲', '燕', '婷', '雪', '月', '晶', '欣', '蕾', '琳', '洁', '萍', '慧']
        },
        lastNames: ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'],
        companies: ['阿里巴巴', '腾讯科技', '百度', '字节跳动', '美团', '滴滴', '小米科技', '华为技术', '京东', '网易', '新浪', '搜狐', '360公司', '拼多多', '快手'],
        jobs: ['软件工程师', '产品经理', 'UI设计师', '数据分析师', '运营专员', '市场经理', '销售代表', '人事专员', '财务经理', '客服专员'],
        departments: ['技术部', '产品部', '设计部', '运营部', '市场部', '销售部', '人事部', '财务部', '客服部', '行政部'],
        cities: ['北京', '上海', '广州', '深圳', '杭州', '南京', '武汉', '成都', '西安', '重庆', '天津', '苏州', '长沙', '郑州', '青岛']
      },
      us: {
        firstNames: {
          male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher'],
          female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen']
        },
        lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'],
        companies: ['Apple', 'Google', 'Microsoft', 'Amazon', 'Facebook', 'Tesla', 'Netflix', 'Adobe', 'Salesforce', 'Oracle'],
        jobs: ['Software Engineer', 'Product Manager', 'Designer', 'Data Scientist', 'Marketing Manager', 'Sales Rep', 'HR Specialist'],
        departments: ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'],
        cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose']
      }
    }

    const generateRandomUser = () => {
      const userGender = gender.value === 'random' ? (Math.random() > 0.5 ? 'male' : 'female') : gender.value
      const localeData = data[locale.value] || data.zh
      
      const firstName = getRandomItem(localeData.firstNames[userGender])
      const lastName = getRandomItem(localeData.lastNames)
      const name = locale.value === 'zh' ? lastName + firstName : `${firstName} ${lastName}`
      
      const age = Math.floor(Math.random() * 50) + 18
      const year = new Date().getFullYear() - age
      const month = Math.floor(Math.random() * 12) + 1
      const day = Math.floor(Math.random() * 28) + 1
      const birthday = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      
      return {
        name,
        age,
        gender: userGender,
        birthday,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&gender=${userGender}`,
        idCard: generateIdCard(),
        phone: generatePhone(),
        email: generateEmail(name),
        address: generateAddress(),
        company: getRandomItem(localeData.companies),
        job: getRandomItem(localeData.jobs),
        department: getRandomItem(localeData.departments),
        salary: `${(Math.floor(Math.random() * 30) + 8) * 1000}元/月`,
        bankCard: generateBankCard(),
        alipay: generatePhone(),
        creditLimit: `${Math.floor(Math.random() * 50) + 10}万元`,
        wechat: `wx_${name.toLowerCase().replace(/\s+/g, '_')}`,
        qq: Math.floor(Math.random() * 900000000) + 100000000,
        weibo: `@${name.replace(/\s+/g, '')}`
      }
    }

    const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

    const generateIdCard = () => {
      const prefix = locale.value === 'zh' ? '110101' : '123456789'
      const year = (new Date().getFullYear() - Math.floor(Math.random() * 50) - 18).toString()
      const month = (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')
      const day = (Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')
      const suffix = Math.floor(Math.random() * 900) + 100
      return `${prefix}${year}${month}${day}${suffix}`
    }

    const generatePhone = () => {
      if (locale.value === 'zh') {
        const prefixes = ['138', '139', '150', '151', '152', '158', '159', '187', '188']
        const prefix = getRandomItem(prefixes)
        const suffix = Math.floor(Math.random() * 90000000) + 10000000
        return `${prefix}${suffix}`
      } else {
        return `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
      }
    }

    const generateEmail = (name) => {
      const domains = locale.value === 'zh' ? ['qq.com', '163.com', '126.com', 'gmail.com'] : ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
      const cleanName = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
      const domain = getRandomItem(domains)
      return `${cleanName}${Math.floor(Math.random() * 999)}@${domain}`
    }

    const generateAddress = () => {
      if (locale.value === 'zh') {
        const cities = data.zh.cities
        const city = getRandomItem(cities)
        const district = ['朝阳区', '海淀区', '西城区', '东城区', '丰台区'][Math.floor(Math.random() * 5)]
        const street = `${Math.floor(Math.random() * 999) + 1}号`
        return `${city}市${district}某某街道${street}`
      } else {
        const cities = data.us.cities
        const city = getRandomItem(cities)
        const street = `${Math.floor(Math.random() * 9999) + 1} Main St`
        return `${street}, ${city}, State 12345`
      }
    }

    const generateBankCard = () => {
      const prefix = locale.value === 'zh' ? '6225' : '4532'
      const middle = Math.floor(Math.random() * 900000000000) + 100000000000
      return `${prefix}${middle}`
    }

    const generateUsers = () => {
      users.value = []
      for (let i = 0; i < count.value; i++) {
        users.value.push(generateRandomUser())
      }
    }

    const copyUser = async (user) => {
      try {
        await navigator.clipboard.writeText(JSON.stringify(user, null, 2))
        instance.proxy.$message.success('用户信息已复制到剪贴板！')
      } catch (error) {
        console.error('复制失败:', error)
      }
    }

    const copyAllUsers = async () => {
      try {
        await navigator.clipboard.writeText(JSON.stringify(users.value, null, 2))
        instance.proxy.$message.success('所有用户信息已复制到剪贴板！')
      } catch (error) {
        console.error('复制失败:', error)
      }
    }

    const exportJSON = () => {
      const blob = new Blob([JSON.stringify(users.value, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fake_users_${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    }

    const exportCSV = () => {
      if (!users.value.length) return
      
      const headers = Object.keys(users.value[0]).join(',')
      const rows = users.value.map(user => 
        Object.values(user).map(value => `"${value}"`).join(',')
      )
      const csv = [headers, ...rows].join('\n')
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fake_users_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }

    return {
      locale,
      gender,
      count,
      users,
      includeFields,
      generateUsers,
      copyUser,
      copyAllUsers,
      exportJSON,
      exportCSV
    }
  }
}
</script>

<style scoped>
.fake-user-tool {
  max-width: 1000px;
  margin: 0 auto;
}

.tool-header {
  text-align: center;
  margin-bottom: 10px;
  padding: 10px;
}

.tool-header h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.tool-header p {
  color: var(--text-secondary);
}

.generation-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 10px;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.option-group {
  display: flex;
  flex-direction: column;
}

.option-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.option-group select,
.option-group input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0;
  font-weight: normal;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--accent-color);
  color: white;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.users-list h4 {
  color: var(--text-primary);
  margin-bottom: 10px;
}

.user-cards {
  display: grid;
  gap: 1rem;
}

.user-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 10px;
}

.user-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--bg-primary);
}

.user-basic h5 {
  color: var(--text-primary);
  margin: 0;
}

.user-basic p {
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
}

.copy-btn {
  margin-left: auto;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
}

.copy-btn:hover {
  color: var(--accent-color);
}

.user-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-section {
  padding: 10px;
  background: var(--bg-primary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.detail-section h6 {
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.detail-section p {
  margin: 0.25rem 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.detail-section strong {
  color: var(--text-primary);
}
</style> 