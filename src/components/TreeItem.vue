<template>
  <div class="tree-item">
    <div class="node-content" :class="{ 'is-selected': isSelected }" :style="{ paddingLeft: `${level * 20}px` }" @click="handleClick">
      <span v-if="node.children.length > 0" class="toggle-icon" @click.stop="toggleExpand">
        {{ node.isExpanded ? '▼' : '▶' }}
      </span>
      <span v-else class="spacer"></span>

      <span class="node-name">{{ node.name }}</span>
    </div>

    <div v-if="node.isExpanded" class="children-container">
      <TreeItem v-for="child in node.children" :key="child.id" :node="child" :level="level + 1" :selected-ids="selectedIds" @select="onSelect" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MeterNode } from '../types';
import { computed } from 'vue';

const props = defineProps<{
  node: MeterNode;
  level: number;
  selectedIds: Set<number>;
}>();

const emit = defineEmits<{
  (e: 'select', payload: { node: MeterNode; event: MouseEvent }): void;
}>();

const isSelected = computed(() => props.selectedIds.has(props.node.id));

const toggleExpand = () => {
  props.node.isExpanded = !props.node.isExpanded;
};

const handleClick = (event: MouseEvent) => {
  emit('select', { node: props.node, event });
};

const onSelect = (payload: { node: MeterNode; event: MouseEvent }) => {
  emit('select', payload);
};
</script>

<style scoped>
.node-content {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.node-content:hover {
  background-color: #f5f7fa;
}

.node-content.is-selected {
  background-color: #e6f7ff;
  border-left: 4px solid #1890ff;
}

.toggle-icon,
.spacer {
  width: 20px;
  text-align: center;
  margin-right: 5px;
  cursor: pointer;
}
</style>
