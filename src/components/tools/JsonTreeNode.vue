<template>
  <div class="json-node" :style="{ marginLeft: level * 20 + 'px' }">
    <!-- 简单值 -->
    <div v-if="isSimpleValue" class="simple-value">
      <span v-if="parentKey" class="node-key">{{ parentKey }}:</span>
      <span :class="['value', getDataType(data)]">{{ getValueDisplay(data) }}</span>
    </div>
    
    <!-- 复杂对象 -->
    <div v-else>
      <div class="node-header" @click="toggle">
        <i :class="['toggle-icon', isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right']"></i>
        <span v-if="parentKey" class="node-key">{{ parentKey }}:</span>
        <span :class="['node-type', getDataType(data)]">
          {{ Array.isArray(data) ? '[' + data.length + ']' : '{' + Object.keys(data).length + '}' }}
        </span>
      </div>
      
      <div v-if="isExpanded" class="node-content">
        <template v-if="Array.isArray(data)">
          <JsonTreeNode
            v-for="(item, index) in data"
            :key="`${path}[${index}]`"
            :data="item"
            :path="`${path}[${index}]`"
            :level="level + 1"
            :expanded-nodes="expandedNodes"
            :parent-key="`[${index}]`"
            @toggle="$emit('toggle', $event)"
          />
        </template>
        <template v-else>
          <JsonTreeNode
            v-for="[key, value] in Object.entries(data)"
            :key="`${path}.${key}`"
            :data="value"
            :path="`${path}.${key}`"
            :level="level + 1"
            :expanded-nodes="expandedNodes"
            :parent-key="key"
            @toggle="$emit('toggle', $event)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'JsonTreeNode',
  props: {
    data: { required: true },
    path: { type: String, required: true },
    level: { type: Number, default: 0 },
    expandedNodes: { type: Set, required: true },
    parentKey: { type: String, default: '' }
  },
  emits: ['toggle'],
  setup(props, { emit }) {
    const isExpanded = computed(() => props.expandedNodes.has(props.path))
    
    const toggle = () => {
      emit('toggle', props.path)
    }

    const isSimpleValue = computed(() => {
      return props.data === null || typeof props.data !== 'object'
    })

    const getDataType = (value) => {
      if (value === null) return 'null'
      if (Array.isArray(value)) return 'array'
      return typeof value
    }

    const getValueDisplay = (value) => {
      if (value === null) return 'null'
      if (value === undefined) return 'undefined'
      if (typeof value === 'string') return `"${value}"`
      if (typeof value === 'boolean') return value.toString()
      if (typeof value === 'number') return value.toString()
      return String(value)
    }

    return {
      isExpanded,
      toggle,
      isSimpleValue,
      getDataType,
      getValueDisplay
    }
  }
}
</script>

<style scoped>
.json-node {
  margin: 2px 0;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.node-header:hover {
  background: var(--bg-secondary);
}

.toggle-icon {
  width: 12px;
  text-align: center;
  color: var(--text-secondary);
}

.node-key {
  color: var(--accent-color);
  font-weight: 500;
}

.node-type {
  color: var(--text-secondary);
  font-style: italic;
}

.node-type.object {
  color: #8E44AD;
}

.node-type.array {
  color: #E67E22;
}

.simple-value {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
}

.value {
  font-weight: 500;
}

.value.string {
  color: #27AE60;
}

.value.number {
  color: #3498DB;
}

.value.boolean {
  color: #E74C3C;
}

.value.null {
  color: #95A5A6;
  font-style: italic;
}

.node-content {
  border-left: 2px solid var(--border-color);
  margin-left: 10px;
  padding-left: 10px;
}
</style> 