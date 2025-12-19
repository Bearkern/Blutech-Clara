<template>
  <div class="app-container">
    <header class="header">
      <h2>階層設定</h2>
      <div class="actions">
        <span>已選取 {{ selectedIds.size }} 個電表</span>
        <v-btn prepend-icon="mdi-arrow-right-box" text="移動階層" :disabled="selectedIds.size === 0" @click="openMoveModal"></v-btn>
      </div>
    </header>

    <div class="tree-container">
      <TreeItem v-for="rootNode in treeData" :key="rootNode.id" :node="rootNode" :level="1" :selected-ids="selectedIds" @select="handleNodeSelect" />
    </div>

    <v-dialog v-model="moveDialog" max-width="600">
      <v-card prepend-icon="mdi-arrow-right-box" title="移動階層">
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <label>選取父電表（移動至此父電表）</label>
              <v-autocomplete v-model="targetParentId" :items="parentOptions" item-title="name" item-value="id" label="" auto-select-first clearable></v-autocomplete>
            </v-col>
            <v-col cols="12">
              <label>此次移動之設備</label>
              <div class="tags-input">
                <v-chip v-for="node in selectedNodes" :key="node.id" class="ma-1" color="primary" variant="outlined" closable @click:close="deselect(node.id)">
                  {{ node.name }}
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text="Close" variant="plain" @click="closeModal"></v-btn>
          <v-btn color="primary" text="Save" variant="tonal" @click="confirmMove"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="messageDialog" width="auto">
      <v-card min-width="400">
        <v-card-title class="align-center">
          <v-icon :color="message.status === 'success' ? 'success' : 'warning'" class="me-2">
            {{ message.status === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
          </v-icon>
          <span>{{ message.status === 'success' ? 'Success' : 'Warning' }}</span>
        </v-card-title>

        <v-card-text>{{ message.text }}</v-card-text>

        <template v-slot:actions>
          <v-btn class="ms-auto" text="OK" @click="closeMessageModal"></v-btn>
        </template>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, reactive } from 'vue';
import request from '@/api/request';
import TreeItem from '@/components/TreeItem.vue';
import type { MeterNode, FlatMeterNode, FlatOption, ApiError } from '@/types';

const treeData = ref<MeterNode[]>([]);

const flatToTree = (flatNodes: FlatMeterNode[]): MeterNode[] => {
  const idMap = new Map<number, MeterNode>();

  for (const node of flatNodes) {
    idMap.set(node.id, {
      id: node.id,
      name: node.name,
      parent_id: node.parent_id,
      children: [],
      isExpanded: true,
    });
  }

  const roots: MeterNode[] = [];

  for (const node of flatNodes) {
    const meterNode = idMap.get(node.id)!;

    if (node.parent_id === null) {
      roots.push(meterNode);
    } else {
      const parent = idMap.get(node.parent_id);
      parent?.children.push(meterNode);
    }
  }

  return roots;
};

const messageDialog = ref<boolean>(false);
const message = reactive({
  text: '',
  status: '',
});

const openMessageModal = () => {
  messageDialog.value = true;
};

const closeMessageModal = () => {
  messageDialog.value = false;
};

const loadTreeData = async () => {
  try {
    const res = await request.get('/nodes');
    const flatNodes = res.data;

    treeData.value = flatToTree(flatNodes);
  } catch (err) {
    const e = err as ApiError;
    message.text = e.message || 'Failed to load tree data';
    message.status = 'warning';
    openMessageModal();
  }
};

onMounted(() => {
  loadTreeData();
});

const selectedIds = ref<Set<number>>(new Set());

const selectedNodes = computed(() => {
  const nodes: MeterNode[] = [];

  const find = (list: MeterNode[]) => {
    for (const node of list) {
      if (selectedIds.value.has(node.id)) nodes.push(node);
      if (node.children.length > 0) find(node.children);
    }
  };

  find(treeData.value);
  return nodes;
});

const currentSelectionParentId = ref<number | null | undefined>(undefined);

const handleNodeSelect = ({ node, event }: { node: MeterNode; event: MouseEvent }) => {
  const isMultiSelect = event.ctrlKey || event.metaKey || event.altKey;

  if (isMultiSelect) {
    if (selectedIds.value.has(node.id)) {
      selectedIds.value.delete(node.id);
      if (selectedIds.value.size === 0) currentSelectionParentId.value = undefined;
    } else {
      if (currentSelectionParentId.value !== undefined && node.parent_id !== currentSelectionParentId.value) {
        message.text = '不可跨階層選取！';
        message.status = 'warning';
        openMessageModal();
        return;
      }
      selectedIds.value.add(node.id);
      currentSelectionParentId.value = node.parent_id;
    }
  } else {
    selectedIds.value.clear();
    selectedIds.value.add(node.id);
    currentSelectionParentId.value = node.parent_id;
  }
};

const deselect = (id: number) => {
  selectedIds.value.delete(id);

  if (selectedIds.value.size === 0) {
    currentSelectionParentId.value = undefined;
    closeModal();
  }
};

const targetParentId = ref<number | null>(null);

const parentOptions = computed(() => {
  const options: FlatOption[] = [];

  const traverse = (nodes: MeterNode[], level: number) => {
    for (const node of nodes) {
      options.push({
        id: node.id,
        name: node.name,
        level,
      });

      if (node.children) traverse(node.children, level + 1);
    }
  };

  traverse(treeData.value, 0);
  return [{ id: null, name: '第 0 層 (Root)', level: 0 }, ...options];
});

const moveDialog = ref<boolean>(false);

const openMoveModal = () => {
  moveDialog.value = true;
  targetParentId.value = null;
};

const closeModal = () => {
  moveDialog.value = false;
};

const confirmMove = async () => {
  if (targetParentId.value === currentSelectionParentId.value) {
    message.text = '不可移動到與原本相同的父層';
    message.status = 'warning';
    openMessageModal();
    return;
  }

  try {
    const nodeIds = Array.from(selectedIds.value);

    const res = await request.patch('/nodes/move', {
      target_parent_id: targetParentId.value,
      node_ids: nodeIds,
    });

    const result = res.data;

    if (result.success) {
      message.text = '移動成功';
      message.status = 'success';
      openMessageModal();

      await loadTreeData();
      selectedIds.value.clear();
      currentSelectionParentId.value = undefined;
      closeModal();
    }
  } catch (err) {
    const e = err as ApiError;
    message.text = `移動失敗：${e.error}`;
    message.status = 'warning';
    openMessageModal();
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #ddd;
  padding-bottom: 8px;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tree-container {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
  min-height: 300px;
}

label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
  font-size: 0.9em;
  color: #333;
}

.tags-input {
  border: 1px solid #ccc;
  padding: 5px;
  border-radius: 4px;
  min-height: 38px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
</style>
