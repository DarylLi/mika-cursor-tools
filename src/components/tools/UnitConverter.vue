<template>
  <div class="unit-converter">
    <div class="converter-container">
      <!-- 单位类别选择 -->
      <div class="category-selector">
        <h3><i class="fas fa-exchange-alt"></i> 单位换算器</h3>
        <div class="category-tabs">
          <button 
            v-for="category in categories" 
            :key="category.id"
            @click="selectedCategory = category.id"
            :class="{ active: selectedCategory === category.id }"
            class="category-tab">
            <i :class="category.icon"></i>
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- 转换界面 -->
      <div class="conversion-panel">
        <div class="converter-row">
          <!-- 输入侧 -->
          <div class="converter-side">
            <div class="unit-selector">
              <label>从</label>
              <select v-model="fromUnit" @change="convert">
                <option v-for="unit in currentUnits" :key="unit.id" :value="unit.id">
                  {{ unit.name }} ({{ unit.symbol }})
                </option>
              </select>
            </div>
            <div class="value-input">
              <input 
                v-model="inputValue" 
                type="number" 
                step="any"
                placeholder="输入数值"
                @input="convert"
                class="input-field">
            </div>
          </div>

          <!-- 转换箭头 -->
          <div class="converter-arrow">
            <button @click="swapUnits" class="swap-btn" title="交换单位">
              <i class="fas fa-exchange-alt"></i>
            </button>
          </div>

          <!-- 输出侧 -->
          <div class="converter-side">
            <div class="unit-selector">
              <label>到</label>
              <select v-model="toUnit" @change="convert">
                <option v-for="unit in currentUnits" :key="unit.id" :value="unit.id">
                  {{ unit.name }} ({{ unit.symbol }})
                </option>
              </select>
            </div>
            <div class="value-output">
              <input 
                :value="outputValue" 
                readonly 
                class="output-field"
                @click="copyResult">
              <button @click="copyResult" class="copy-btn" title="复制结果">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 转换公式显示 -->
        <div v-if="conversionFormula" class="formula-display">
          <div class="formula-label">转换公式：</div>
          <div class="formula-text">{{ conversionFormula }}</div>
        </div>

        <!-- 快速转换表 -->
        <div v-if="quickConversions.length > 0" class="quick-conversions">
          <h4><i class="fas fa-table"></i> 快速对照表</h4>
          <div class="conversions-table">
            <div class="table-header">
              <span>{{ getUnitInfo(fromUnit)?.name }}</span>
              <span>{{ getUnitInfo(toUnit)?.name }}</span>
            </div>
            <div v-for="conversion in quickConversions" :key="conversion.from" class="table-row">
              <span>{{ conversion.from }} {{ getUnitInfo(fromUnit)?.symbol }}</span>
              <span>{{ conversion.to }} {{ getUnitInfo(toUnit)?.symbol }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 常用转换快捷按钮 -->
      <div class="quick-actions">
        <h4><i class="fas fa-bolt"></i> 常用转换</h4>
        <div class="quick-buttons">
          <button 
            v-for="quick in currentQuickActions" 
            :key="quick.name"
            @click="setQuickConversion(quick)"
            class="quick-btn">
            {{ quick.name }}
            <span class="quick-desc">{{ quick.from }} → {{ quick.to }}</span>
          </button>
        </div>
      </div>

      <!-- 单位信息 -->
      <div class="unit-info-section">
        <h4><i class="fas fa-info-circle"></i> 单位信息</h4>
        <div class="info-cards">
          <div v-if="getUnitInfo(fromUnit)" class="info-card">
            <div class="unit-symbol">{{ getUnitInfo(fromUnit).symbol }}</div>
            <div class="unit-details">
              <div class="unit-name">{{ getUnitInfo(fromUnit).name }}</div>
              <div class="unit-description">{{ getUnitInfo(fromUnit).description }}</div>
              <div v-if="getUnitInfo(fromUnit).system" class="unit-system">
                系统：{{ getUnitInfo(fromUnit).system }}
              </div>
            </div>
          </div>
          <div v-if="getUnitInfo(toUnit)" class="info-card">
            <div class="unit-symbol">{{ getUnitInfo(toUnit).symbol }}</div>
            <div class="unit-details">
              <div class="unit-name">{{ getUnitInfo(toUnit).name }}</div>
              <div class="unit-description">{{ getUnitInfo(toUnit).description }}</div>
              <div v-if="getUnitInfo(toUnit).system" class="unit-system">
                系统：{{ getUnitInfo(toUnit).system }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 历史记录 -->
      <div v-if="history.length > 0" class="history-section">
        <h4><i class="fas fa-history"></i> 转换历史</h4>
        <div class="history-list">
          <div v-for="(item, index) in history" :key="index" class="history-item" @click="loadHistory(item)">
            <div class="history-conversion">
              {{ item.input }} {{ item.fromSymbol }} = {{ item.output }} {{ item.toSymbol }}
            </div>
            <div class="history-time">{{ item.time }}</div>
            <button @click.stop="removeHistory(index)" class="remove-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <button @click="clearHistory" class="clear-history-btn">
          <i class="fas fa-trash"></i> 清空历史
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'UnitConverter',
  setup() {
    const selectedCategory = ref('length')
    const fromUnit = ref('meter')
    const toUnit = ref('kilometer')
    const inputValue = ref('1')
    const outputValue = ref('')
    const history = ref([])
    
    const categories = [
      { id: 'length', name: '长度', icon: 'fas fa-ruler' },
      { id: 'weight', name: '重量', icon: 'fas fa-weight' },
      { id: 'area', name: '面积', icon: 'fas fa-square' },
      { id: 'volume', name: '体积', icon: 'fas fa-cube' },
      { id: 'temperature', name: '温度', icon: 'fas fa-thermometer' },
      { id: 'time', name: '时间', icon: 'fas fa-clock' },
      { id: 'speed', name: '速度', icon: 'fas fa-tachometer-alt' },
      { id: 'pressure', name: '压力', icon: 'fas fa-compress' },
      { id: 'energy', name: '能量', icon: 'fas fa-battery-full' },
      { id: 'power', name: '功率', icon: 'fas fa-bolt' }
    ]
    
    const units = {
      length: [
        { id: 'millimeter', name: '毫米', symbol: 'mm', factor: 0.001, description: '长度的基本单位', system: '公制' },
        { id: 'centimeter', name: '厘米', symbol: 'cm', factor: 0.01, description: '常用长度单位', system: '公制' },
        { id: 'meter', name: '米', symbol: 'm', factor: 1, description: '国际标准长度单位', system: '公制' },
        { id: 'kilometer', name: '千米', symbol: 'km', factor: 1000, description: '常用于测量长距离', system: '公制' },
        { id: 'inch', name: '英寸', symbol: 'in', factor: 0.0254, description: '英制长度单位', system: '英制' },
        { id: 'foot', name: '英尺', symbol: 'ft', factor: 0.3048, description: '12英寸等于1英尺', system: '英制' },
        { id: 'yard', name: '码', symbol: 'yd', factor: 0.9144, description: '3英尺等于1码', system: '英制' },
        { id: 'mile', name: '英里', symbol: 'mi', factor: 1609.344, description: '1760码等于1英里', system: '英制' }
      ],
      weight: [
        { id: 'milligram', name: '毫克', symbol: 'mg', factor: 0.000001, description: '极小的重量单位', system: '公制' },
        { id: 'gram', name: '克', symbol: 'g', factor: 0.001, description: '轻量物品常用单位', system: '公制' },
        { id: 'kilogram', name: '千克', symbol: 'kg', factor: 1, description: '国际标准质量单位', system: '公制' },
        { id: 'ton', name: '吨', symbol: 't', factor: 1000, description: '重型物品常用单位', system: '公制' },
        { id: 'ounce', name: '盎司', symbol: 'oz', factor: 0.0283495, description: '英制重量单位', system: '英制' },
        { id: 'pound', name: '磅', symbol: 'lb', factor: 0.453592, description: '16盎司等于1磅', system: '英制' }
      ],
      area: [
        { id: 'square_millimeter', name: '平方毫米', symbol: 'mm²', factor: 0.000001, description: '微小面积单位', system: '公制' },
        { id: 'square_centimeter', name: '平方厘米', symbol: 'cm²', factor: 0.0001, description: '小面积测量', system: '公制' },
        { id: 'square_meter', name: '平方米', symbol: 'm²', factor: 1, description: '标准面积单位', system: '公制' },
        { id: 'hectare', name: '公顷', symbol: 'ha', factor: 10000, description: '土地面积常用单位', system: '公制' },
        { id: 'square_kilometer', name: '平方千米', symbol: 'km²', factor: 1000000, description: '大面积测量', system: '公制' },
        { id: 'square_inch', name: '平方英寸', symbol: 'in²', factor: 0.00064516, description: '英制面积单位', system: '英制' },
        { id: 'square_foot', name: '平方英尺', symbol: 'ft²', factor: 0.092903, description: '房屋面积常用', system: '英制' },
        { id: 'acre', name: '英亩', symbol: 'ac', factor: 4046.86, description: '农田面积单位', system: '英制' }
      ],
      volume: [
        { id: 'milliliter', name: '毫升', symbol: 'ml', factor: 0.000001, description: '液体体积小单位', system: '公制' },
        { id: 'liter', name: '升', symbol: 'L', factor: 0.001, description: '常用液体体积单位', system: '公制' },
        { id: 'cubic_meter', name: '立方米', symbol: 'm³', factor: 1, description: '标准体积单位', system: '公制' },
        { id: 'fluid_ounce', name: '液体盎司', symbol: 'fl oz', factor: 0.0000295735, description: '英制液体单位', system: '英制' },
        { id: 'cup', name: '杯', symbol: 'cup', factor: 0.000236588, description: '烹饪常用单位', system: '英制' },
        { id: 'pint', name: '品脱', symbol: 'pt', factor: 0.000473176, description: '2杯等于1品脱', system: '英制' },
        { id: 'gallon', name: '加仑', symbol: 'gal', factor: 0.00378541, description: '大容量液体单位', system: '英制' }
      ],
      temperature: [
        { id: 'celsius', name: '摄氏度', symbol: '°C', offset: 0, multiplier: 1, description: '水的冰点0°C，沸点100°C', system: '公制' },
        { id: 'fahrenheit', name: '华氏度', symbol: '°F', offset: 32, multiplier: 9/5, description: '美国常用温度单位', system: '英制' },
        { id: 'kelvin', name: '开尔文', symbol: 'K', offset: 273.15, multiplier: 1, description: '绝对温度单位', system: '科学' }
      ],
      time: [
        { id: 'millisecond', name: '毫秒', symbol: 'ms', factor: 0.001, description: '时间的精确单位', system: '通用' },
        { id: 'second', name: '秒', symbol: 's', factor: 1, description: '时间基本单位', system: '通用' },
        { id: 'minute', name: '分钟', symbol: 'min', factor: 60, description: '60秒等于1分钟', system: '通用' },
        { id: 'hour', name: '小时', symbol: 'h', factor: 3600, description: '60分钟等于1小时', system: '通用' },
        { id: 'day', name: '天', symbol: 'd', factor: 86400, description: '24小时等于1天', system: '通用' },
        { id: 'week', name: '周', symbol: 'w', factor: 604800, description: '7天等于1周', system: '通用' },
        { id: 'month', name: '月', symbol: 'mo', factor: 2629746, description: '平均30.44天', system: '通用' },
        { id: 'year', name: '年', symbol: 'y', factor: 31556952, description: '365.25天', system: '通用' }
      ],
      speed: [
        { id: 'meter_per_second', name: '米每秒', symbol: 'm/s', factor: 1, description: '标准速度单位', system: '公制' },
        { id: 'kilometer_per_hour', name: '千米每小时', symbol: 'km/h', factor: 0.277778, description: '汽车速度常用单位', system: '公制' },
        { id: 'mile_per_hour', name: '英里每小时', symbol: 'mph', factor: 0.44704, description: '英制速度单位', system: '英制' },
        { id: 'foot_per_second', name: '英尺每秒', symbol: 'ft/s', factor: 0.3048, description: '英制速度单位', system: '英制' },
        { id: 'knot', name: '节', symbol: 'kn', factor: 0.514444, description: '海上速度单位', system: '海事' }
      ],
      pressure: [
        { id: 'pascal', name: '帕斯卡', symbol: 'Pa', factor: 1, description: '压力的基本单位', system: '公制' },
        { id: 'kilopascal', name: '千帕', symbol: 'kPa', factor: 1000, description: '常用压力单位', system: '公制' },
        { id: 'bar', name: '巴', symbol: 'bar', factor: 100000, description: '气象和工程常用', system: '公制' },
        { id: 'atmosphere', name: '标准大气压', symbol: 'atm', factor: 101325, description: '海平面大气压力', system: '标准' },
        { id: 'psi', name: '磅每平方英寸', symbol: 'psi', factor: 6894.76, description: '英制压力单位', system: '英制' },
        { id: 'mmhg', name: '毫米汞柱', symbol: 'mmHg', factor: 133.322, description: '医学血压单位', system: '医学' }
      ],
      energy: [
        { id: 'joule', name: '焦耳', symbol: 'J', factor: 1, description: '能量的基本单位', system: '公制' },
        { id: 'kilojoule', name: '千焦', symbol: 'kJ', factor: 1000, description: '食物能量常用', system: '公制' },
        { id: 'calorie', name: '卡路里', symbol: 'cal', factor: 4.184, description: '传统热量单位', system: '传统' },
        { id: 'kilocalorie', name: '千卡', symbol: 'kcal', factor: 4184, description: '食物热量单位', system: '传统' },
        { id: 'watt_hour', name: '瓦时', symbol: 'Wh', factor: 3600, description: '电力能量单位', system: '电力' },
        { id: 'kilowatt_hour', name: '千瓦时', symbol: 'kWh', factor: 3600000, description: '电费计量单位', system: '电力' }
      ],
      power: [
        { id: 'watt', name: '瓦特', symbol: 'W', factor: 1, description: '功率的基本单位', system: '公制' },
        { id: 'kilowatt', name: '千瓦', symbol: 'kW', factor: 1000, description: '电器功率常用', system: '公制' },
        { id: 'horsepower', name: '马力', symbol: 'hp', factor: 745.7, description: '机械功率单位', system: '英制' },
        { id: 'btu_per_hour', name: 'BTU每小时', symbol: 'BTU/h', factor: 0.293071, description: '制冷功率单位', system: '英制' }
      ]
    }
    
    const quickActions = {
      length: [
        { name: '米转千米', from: 'meter', to: 'kilometer' },
        { name: '厘米转英寸', from: 'centimeter', to: 'inch' },
        { name: '英尺转米', from: 'foot', to: 'meter' },
        { name: '英里转千米', from: 'mile', to: 'kilometer' }
      ],
      weight: [
        { name: '克转磅', from: 'gram', to: 'pound' },
        { name: '千克转磅', from: 'kilogram', to: 'pound' },
        { name: '磅转千克', from: 'pound', to: 'kilogram' },
        { name: '吨转磅', from: 'ton', to: 'pound' }
      ],
      temperature: [
        { name: '摄氏转华氏', from: 'celsius', to: 'fahrenheit' },
        { name: '华氏转摄氏', from: 'fahrenheit', to: 'celsius' },
        { name: '摄氏转开尔文', from: 'celsius', to: 'kelvin' },
        { name: '开尔文转摄氏', from: 'kelvin', to: 'celsius' }
      ],
      time: [
        { name: '小时转分钟', from: 'hour', to: 'minute' },
        { name: '天转小时', from: 'day', to: 'hour' },
        { name: '周转天', from: 'week', to: 'day' },
        { name: '年转天', from: 'year', to: 'day' }
      ]
    }
    
    const currentUnits = computed(() => units[selectedCategory.value] || [])
    const currentQuickActions = computed(() => quickActions[selectedCategory.value] || [])
    
    const conversionFormula = computed(() => {
      if (!inputValue.value || !fromUnit.value || !toUnit.value) return ''
      
      const fromUnitInfo = getUnitInfo(fromUnit.value)
      const toUnitInfo = getUnitInfo(toUnit.value)
      
      if (selectedCategory.value === 'temperature') {
        return getTemperatureFormula(fromUnitInfo, toUnitInfo)
      } else {
        const factor = fromUnitInfo.factor / toUnitInfo.factor
        return `1 ${fromUnitInfo.symbol} = ${factor} ${toUnitInfo.symbol}`
      }
    })
    
    const quickConversions = computed(() => {
      if (!fromUnit.value || !toUnit.value || fromUnit.value === toUnit.value) return []
      
      const baseValues = [1, 5, 10, 25, 50, 100]
      return baseValues.map(value => ({
        from: value,
        to: convertValue(value, fromUnit.value, toUnit.value)
      }))
    })
    
    const getUnitInfo = (unitId) => {
      return currentUnits.value.find(unit => unit.id === unitId)
    }
    
    const getTemperatureFormula = (fromUnit, toUnit) => {
      if (!fromUnit || !toUnit) return ''
      
      const formulas = {
        'celsius-fahrenheit': '°F = °C × 9/5 + 32',
        'fahrenheit-celsius': '°C = (°F - 32) × 5/9',
        'celsius-kelvin': 'K = °C + 273.15',
        'kelvin-celsius': '°C = K - 273.15',
        'fahrenheit-kelvin': 'K = (°F - 32) × 5/9 + 273.15',
        'kelvin-fahrenheit': '°F = (K - 273.15) × 9/5 + 32'
      }
      
      return formulas[`${fromUnit.id}-${toUnit.id}`] || ''
    }
    
    const convertValue = (value, from, to) => {
      if (!value || !from || !to || from === to) return value
      
      const fromUnitInfo = getUnitInfo(from)
      const toUnitInfo = getUnitInfo(to)
      
      if (!fromUnitInfo || !toUnitInfo) return value
      
      if (selectedCategory.value === 'temperature') {
        return convertTemperature(parseFloat(value), fromUnitInfo, toUnitInfo)
      } else {
        const baseValue = parseFloat(value) * fromUnitInfo.factor
        return (baseValue / toUnitInfo.factor).toFixed(8).replace(/\.?0+$/, '')
      }
    }
    
    const convertTemperature = (value, fromUnit, toUnit) => {
      let celsius = value
      
      // 先转换为摄氏度
      if (fromUnit.id === 'fahrenheit') {
        celsius = (value - 32) * 5/9
      } else if (fromUnit.id === 'kelvin') {
        celsius = value - 273.15
      }
      
      // 再从摄氏度转换为目标单位
      if (toUnit.id === 'celsius') {
        return celsius.toFixed(4).replace(/\.?0+$/, '')
      } else if (toUnit.id === 'fahrenheit') {
        return (celsius * 9/5 + 32).toFixed(4).replace(/\.?0+$/, '')
      } else if (toUnit.id === 'kelvin') {
        return (celsius + 273.15).toFixed(4).replace(/\.?0+$/, '')
      }
      
      return celsius.toFixed(4).replace(/\.?0+$/, '')
    }
    
    const convert = () => {
      const result = convertValue(inputValue.value, fromUnit.value, toUnit.value)
      outputValue.value = result
      
      // 添加到历史记录
      if (inputValue.value && result && fromUnit.value !== toUnit.value) {
        addToHistory({
          input: inputValue.value,
          output: result,
          fromUnit: fromUnit.value,
          toUnit: toUnit.value,
          fromSymbol: getUnitInfo(fromUnit.value)?.symbol,
          toSymbol: getUnitInfo(toUnit.value)?.symbol,
          time: new Date().toLocaleTimeString()
        })
      }
    }
    
    const addToHistory = (item) => {
      history.value.unshift(item)
      if (history.value.length > 10) {
        history.value.pop()
      }
    }
    
    const swapUnits = () => {
      [fromUnit.value, toUnit.value] = [toUnit.value, fromUnit.value]
      inputValue.value = outputValue.value || inputValue.value
      convert()
    }
    
    const copyResult = () => {
      if (outputValue.value) {
        navigator.clipboard.writeText(outputValue.value).then(() => {
          // 可以添加提示
        })
      }
    }
    
    const setQuickConversion = (quick) => {
      fromUnit.value = quick.from
      toUnit.value = quick.to
      convert()
    }
    
    const loadHistory = (item) => {
      fromUnit.value = item.fromUnit
      toUnit.value = item.toUnit
      inputValue.value = item.input
      convert()
    }
    
    const removeHistory = (index) => {
      history.value.splice(index, 1)
    }
    
    const clearHistory = () => {
      history.value = []
    }
    
    // 监听类别变化，重置单位选择
    watch(selectedCategory, (newCategory) => {
      const units = currentUnits.value
      if (units.length > 0) {
        fromUnit.value = units[0].id
        toUnit.value = units.length > 1 ? units[1].id : units[0].id
        convert()
      }
    })
    
    // 初始转换
    convert()
    
    return {
      selectedCategory,
      fromUnit,
      toUnit,
      inputValue,
      outputValue,
      history,
      categories,
      currentUnits,
      currentQuickActions,
      conversionFormula,
      quickConversions,
      getUnitInfo,
      convert,
      swapUnits,
      copyResult,
      setQuickConversion,
      loadHistory,
      removeHistory,
      clearHistory
    }
  }
}
</script>

<style scoped>
.unit-converter {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.converter-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.category-selector {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.category-selector h3 {
  margin: 0 0 1.5rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-tab {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.category-tab:hover {
  background: rgba(255, 255, 255, 0.2);
}

.category-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.conversion-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.converter-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
}

.converter-side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.unit-selector label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
}

.unit-selector select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  font-size: 1rem;
}

.input-field, .output-field {
  width: 100%;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  font-size: 1.2rem;
  text-align: center;
}

.output-field {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
  cursor: pointer;
}

.value-output {
  position: relative;
}

.copy-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.5rem;
  border: none;
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-btn:hover {
  background: rgba(102, 126, 234, 0.3);
}

.converter-arrow {
  display: flex;
  justify-content: center;
}

.swap-btn {
  padding: 1rem;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.swap-btn:hover {
  transform: rotate(180deg) scale(1.1);
}

.formula-display {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.formula-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.formula-text {
  color: #667eea;
  font-family: monospace;
  font-size: 1.1rem;
}

.quick-conversions h4 {
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.conversions-table {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  font-weight: 500;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.table-row:last-child {
  border-bottom: none;
}

.quick-actions {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.quick-actions h4 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.quick-btn {
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.quick-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.quick-desc {
  display: block;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.25rem;
}

.unit-info-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.unit-info-section h4 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-card {
  display: flex;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
}

.unit-symbol {
  min-width: 60px;
  height: 60px;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-weight: bold;
  font-size: 1.1rem;
}

.unit-details {
  flex: 1;
}

.unit-name {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.unit-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.unit-system {
  color: #667eea;
  font-size: 0.8rem;
}

.history-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.history-section h4 {
  margin: 0 0 1rem 0;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.history-conversion {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
  font-family: monospace;
}

.history-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.remove-btn {
  padding: 0.25rem;
  border: none;
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: rgba(244, 67, 54, 0.3);
}

.clear-history-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.clear-history-btn:hover {
  background: rgba(244, 67, 54, 0.3);
}

@media (max-width: 768px) {
  .category-tabs {
    justify-content: center;
  }
  
  .converter-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .converter-arrow {
    order: -1;
  }
  
  .swap-btn {
    transform: rotate(90deg);
  }
  
  .swap-btn:hover {
    transform: rotate(270deg) scale(1.1);
  }
  
  .quick-buttons {
    grid-template-columns: 1fr;
  }
  
  .info-cards {
    grid-template-columns: 1fr;
  }
}
</style> 