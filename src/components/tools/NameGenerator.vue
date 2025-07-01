<template>
  <div class="name-generator-tool">
    <div class="tool-header">
      <h3><i class="fas fa-user-tag"></i> 名字生成器</h3>
      <p>生成各种类型的姓名，支持多种文化和风格</p>
    </div>

    <div class="tool-content">
      <div class="generation-controls">
        <div class="control-group">
          <label for="culture">文化背景</label>
          <select id="culture" v-model="culture">
            <option value="chinese">中文姓名</option>
            <option value="english">英文姓名</option>
            <option value="japanese">日文姓名</option>
            <option value="korean">韩文姓名</option>
            <option value="russian">俄文姓名</option>
            <option value="arabic">阿拉伯姓名</option>
            <option value="fantasy">奇幻姓名</option>
          </select>
        </div>
        
        <div class="control-group">
          <label for="gender">性别</label>
          <select id="gender" v-model="gender">
            <option value="random">随机</option>
            <option value="male">男性</option>
            <option value="female">女性</option>
            <option value="unisex">中性</option>
          </select>
        </div>
        
        <div class="control-group">
          <label for="style">风格</label>
          <select id="style" v-model="style">
            <option value="common">常见</option>
            <option value="unique">独特</option>
            <option value="traditional">传统</option>
            <option value="modern">现代</option>
            <option value="royal">高贵</option>
            <option value="creative">创意</option>
          </select>
        </div>
        
        <div class="control-group">
          <label for="count">生成数量</label>
          <input type="number" id="count" v-model.number="count" min="1" max="50" />
        </div>
        
        <div class="control-group">
          <label for="includeMeaning">包含含义</label>
          <input type="checkbox" id="includeMeaning" v-model="includeMeaning" />
        </div>
      </div>

      <div class="actions">
        <button @click="generateNames" class="btn-primary">
          <i class="fas fa-user-plus"></i> 生成姓名
        </button>
        <button @click="exportNames" class="btn-secondary" :disabled="!names.length">
          <i class="fas fa-download"></i> 导出列表
        </button>
        <button @click="copyAllNames" class="btn-secondary" :disabled="!names.length">
          <i class="fas fa-copy"></i> 复制全部
        </button>
        <button @click="clearHistory" class="btn-secondary" :disabled="!favoriteNames.length">
          <i class="fas fa-trash"></i> 清空收藏
        </button>
      </div>

      <div class="names-display" v-if="names.length">
        <h4>生成的姓名 ({{ names.length }})</h4>
        <div class="names-grid">
          <div v-for="(name, index) in names" :key="index" class="name-card">
            <div class="name-header">
              <h5>{{ name.fullName }}</h5>
              <div class="name-actions">
                <button @click="addToFavorites(name)" class="favorite-btn" 
                        :class="{ active: isFavorite(name) }"
                        :title="isFavorite(name) ? '取消收藏' : '添加收藏'">
                  <i class="fas fa-heart"></i>
                </button>
                <button @click="copyName(name.fullName)" class="copy-btn" title="复制姓名">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
            
            <div class="name-details">
              <div class="name-parts">
                <span class="name-part">
                  <strong>{{ culture === 'chinese' ? '姓:' : 'First:' }}</strong> 
                  {{ name.firstName }}
                </span>
                <span class="name-part">
                  <strong>{{ culture === 'chinese' ? '名:' : 'Last:' }}</strong> 
                  {{ name.lastName }}
                </span>
              </div>
              
              <div class="name-info">
                <span class="gender-tag" :class="name.gender">
                  {{ getGenderText(name.gender) }}
                </span>
                <span class="culture-tag">{{ getCultureText(culture) }}</span>
              </div>
              
              <div v-if="includeMeaning && name.meaning" class="name-meaning">
                <strong>含义:</strong> {{ name.meaning }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="favorites-section" v-if="favoriteNames.length">
        <h4>收藏的姓名 ({{ favoriteNames.length }})</h4>
        <div class="favorites-list">
          <div v-for="(name, index) in favoriteNames" :key="index" class="favorite-item">
            <span class="favorite-name">{{ name.fullName }}</span>
            <span class="favorite-culture">{{ getCultureText(name.culture) }}</span>
            <button @click="removeFromFavorites(index)" class="remove-btn" title="移除">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'NameGenerator',
  setup() {
    const culture = ref('chinese')
    const gender = ref('random')
    const style = ref('common')
    const count = ref(10)
    const includeMeaning = ref(true)
    const names = ref([])
    const favoriteNames = ref([])

    // 姓名数据库
    const nameData = {
      chinese: {
        surnames: ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗', '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧', '程', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕'],
        givenNames: {
          male: {
            common: ['伟', '强', '磊', '军', '勇', '涛', '明', '超', '刚', '平', '辉', '杰', '华', '峰', '鹏', '飞', '宇', '斌', '博', '海'],
            unique: ['逸尘', '天翊', '墨轩', '修远', '星河', '云深', '风华', '玉树', '清源', '锦程'],
            traditional: ['文昌', '志强', '建国', '国华', '建华', '志明', '学军', '国强', '建军', '学文'],
            modern: ['梓轩', '浩然', '子轩', '皓轩', '俊熙', '梓豪', '梓涵', '雨泽', '浩宇', '子涵'],
            royal: ['天佑', '龙飞', '凤鸣', '君临', '帝王', '皇者', '圣贤', '贵族', '王者', '霸天']
          },
          female: {
            common: ['芳', '娜', '敏', '静', '丽', '红', '艳', '莉', '玲', '燕', '婷', '雪', '月', '晶', '欣', '蕾', '琳', '洁', '萍', '慧'],
            unique: ['若汐', '诗涵', '雨桐', '梦瑶', '紫萱', '语嫣', '清雅', '婉约', '如意', '含烟'],
            traditional: ['秀英', '桂英', '美英', '丽华', '桂花', '秀兰', '桂兰', '春花', '秀珍', '玉兰'],
            modern: ['梓涵', '诗涵', '欣怡', '可馨', '雨桐', '梦琪', '语嫣', '若汐', '艺涵', '苑博'],
            royal: ['凤仪', '紫薇', '雅韵', '华贵', '珠玉', '金枝', '银叶', '玉颜', '芳华', '绝色']
          }
        },
        meanings: {
          '伟': '伟大、宏伟',
          '强': '强壮、坚强',
          '华': '光华、繁荣',
          '芳': '香气、美好',
          '静': '安静、文静',
          '丽': '美丽、秀丽'
        }
      },
      english: {
        surnames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'],
        givenNames: {
          male: {
            common: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher'],
            unique: ['Aspen', 'Atlas', 'Sage', 'Phoenix', 'River', 'Storm', 'Ocean', 'Sky', 'Forest', 'Stone'],
            traditional: ['Edward', 'George', 'Henry', 'Charles', 'Frederick', 'Albert', 'Arthur', 'Ernest', 'Walter', 'Harold'],
            modern: ['Aiden', 'Jackson', 'Ethan', 'Liam', 'Mason', 'Noah', 'Lucas', 'Jacob', 'Alexander', 'Logan']
          },
          female: {
            common: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'],
            unique: ['Luna', 'Aurora', 'Nova', 'Sage', 'Phoenix', 'River', 'Willow', 'Rain', 'Sky', 'Star'],
            traditional: ['Margaret', 'Dorothy', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle'],
            modern: ['Emma', 'Olivia', 'Sophia', 'Isabella', 'Ava', 'Mia', 'Abigail', 'Emily', 'Charlotte', 'Harper']
          }
        }
      },
      fantasy: {
        surnames: ['Dragonborn', 'Stormwind', 'Nightfall', 'Moonwhisper', 'Starweaver', 'Shadowbane', 'Lightbringer', 'Ironforge', 'Goldleaf', 'Silvermoon'],
        givenNames: {
          male: {
            common: ['Aragorn', 'Thorin', 'Gandalf', 'Legolas', 'Gimli', 'Boromir', 'Faramir', 'Elrond', 'Galadriel', 'Sauron'],
            unique: ['Aelar', 'Beiro', 'Carric', 'Drannor', 'Enna', 'Galinndan', 'Hadarai', 'Immeral', 'Ivellios', 'Laucian']
          },
          female: {
            common: ['Arwen', 'Galadriel', 'Eowyn', 'Tauriel', 'Elaria', 'Selenra', 'Aerdrie', 'Ahvna', 'Aramil', 'Aranea'],
            unique: ['Bethrynna', 'Caelynn', 'Dara', 'Enna', 'Galinndan', 'Hadarai', 'Halimath', 'Heian', 'Himo', 'Immeral']
          }
        }
      }
    }

    const generateRandomName = () => {
      const data = nameData[culture.value] || nameData.chinese
      const selectedGender = gender.value === 'random' ? (Math.random() > 0.5 ? 'male' : 'female') : gender.value
      
      const surname = getRandomItem(data.surnames)
      const givenNameCategory = data.givenNames[selectedGender] || data.givenNames.male
      const givenNames = givenNameCategory[style.value] || givenNameCategory.common
      const givenName = getRandomItem(givenNames)
      
      let fullName
      if (culture.value === 'chinese') {
        fullName = surname + givenName
      } else {
        fullName = `${givenName} ${surname}`
      }
      
      let meaning = ''
      if (includeMeaning.value && culture.value === 'chinese' && nameData.chinese.meanings[givenName]) {
        meaning = nameData.chinese.meanings[givenName]
      }
      
      return {
        firstName: culture.value === 'chinese' ? surname : givenName,
        lastName: culture.value === 'chinese' ? givenName : surname,
        fullName,
        gender: selectedGender,
        culture: culture.value,
        style: style.value,
        meaning
      }
    }

    const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

    const generateNames = () => {
      names.value = []
      for (let i = 0; i < count.value; i++) {
        names.value.push(generateRandomName())
      }
    }

    const copyName = async (name) => {
      try {
        await navigator.clipboard.writeText(name)
        // 简单的成功提示
        const button = event.target.closest('button')
        if (button) {
          button.style.transform = 'scale(0.95)'
          setTimeout(() => {
            button.style.transform = 'scale(1)'
          }, 150)
        }
      } catch (error) {
        console.error('复制失败:', error)
      }
    }

    const copyAllNames = async () => {
      const nameList = names.value.map(name => name.fullName).join('\n')
      try {
        await navigator.clipboard.writeText(nameList)
        alert('所有姓名已复制到剪贴板！')
      } catch (error) {
        console.error('复制失败:', error)
      }
    }

    const exportNames = () => {
      const exportData = {
        names: names.value,
        settings: {
          culture: culture.value,
          gender: gender.value,
          style: style.value,
          includeMeaning: includeMeaning.value
        },
        generatedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `names_${culture.value}_${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    }

    const addToFavorites = (name) => {
      const exists = favoriteNames.value.some(fav => fav.fullName === name.fullName)
      if (exists) {
        favoriteNames.value = favoriteNames.value.filter(fav => fav.fullName !== name.fullName)
      } else {
        favoriteNames.value.push({ ...name })
      }
    }

    const isFavorite = (name) => {
      return favoriteNames.value.some(fav => fav.fullName === name.fullName)
    }

    const removeFromFavorites = (index) => {
      favoriteNames.value.splice(index, 1)
    }

    const clearHistory = () => {
      if (confirm('确定要清空所有收藏的姓名吗？')) {
        favoriteNames.value = []
      }
    }

    const getGenderText = (genderValue) => {
      const genderMap = {
        male: '男性',
        female: '女性',
        unisex: '中性'
      }
      return genderMap[genderValue] || '未知'
    }

    const getCultureText = (cultureValue) => {
      const cultureMap = {
        chinese: '中文',
        english: '英文', 
        japanese: '日文',
        korean: '韩文',
        russian: '俄文',
        arabic: '阿拉伯',
        fantasy: '奇幻'
      }
      return cultureMap[cultureValue] || cultureValue
    }

    return {
      culture,
      gender,
      style,
      count,
      includeMeaning,
      names,
      favoriteNames,
      generateNames,
      copyName,
      copyAllNames,
      exportNames,
      addToFavorites,
      isFavorite,
      removeFromFavorites,
      clearHistory,
      getGenderText,
      getCultureText
    }
  }
}
</script>

<style scoped>
.name-generator-tool {
  max-width: 1000px;
  margin: 0 auto;
}

.tool-header {
  text-align: center;
  margin-bottom: 2rem;
}

.tool-header h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.tool-header p {
  color: var(--text-secondary);
}

.generation-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.control-group {
  display: flex;
  flex-direction: column;
}

.control-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.control-group select,
.control-group input[type="number"] {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.control-group input[type="checkbox"] {
  width: 20px;
  height: 20px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
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

.names-display h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.names-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.name-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
}

.name-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.name-header h5 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1.1rem;
}

.name-actions {
  display: flex;
  gap: 0.5rem;
}

.favorite-btn,
.copy-btn {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.favorite-btn.active {
  color: #e74c3c;
  border-color: #e74c3c;
}

.favorite-btn:hover,
.copy-btn:hover {
  color: var(--accent-color);
  border-color: var(--accent-color);
}

.name-parts {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.name-part {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.name-info {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.gender-tag,
.culture-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
}

.gender-tag.male {
  color: #3498db;
  border-color: #3498db;
}

.gender-tag.female {
  color: #e74c3c;
  border-color: #e74c3c;
}

.name-meaning {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-style: italic;
}

.favorites-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.favorites-section h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.favorite-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background: var(--bg-primary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.favorite-name {
  font-weight: 500;
  color: var(--text-primary);
}

.favorite-culture {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.remove-btn {
  margin-left: auto;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  color: #e74c3c;
  border-color: #e74c3c;
}
</style> 