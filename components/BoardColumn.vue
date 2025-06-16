<script setup lang="ts">
import { ref, computed } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps<{
  column: {
    id: number | string;
    title: string;
    tasks: any[];
  }
}>()

const emit = defineEmits(['taskChange', 'addTask'])

const enabled = ref(true)
const dragging = ref(false)

const draggingInfo = computed(() => {
  return dragging.value ? "under drag" : "";
})

const checkMove = (e: any) => {
  console.log("Future index: " + e.draggedContext.futureIndex);
}

const onStart = () => {
  dragging.value = true;
}

const onEnd = (e: any) => {
  dragging.value = false;
  emit('taskChange', e);
}

const addNewTask = () => {
  emit('addTask', {
    columnId: props.column.id,
    title: `New Task ${Date.now()}`,
    description: 'Task description'
  });
}
</script>

<template>
  <div class="bg-gray-100 p-4 rounded-lg w-64">
    <h2 class="font-bold mb-2">{{ column.title }}</h2>

    <button class="btn btn-secondary mb-2" @click="addNewTask">Add Task</button>
    <draggable
        :list="column.tasks"
        :disabled="!enabled"
        class="list-group"
        ghost-class="ghost"
        :move="checkMove"
        @start="onStart"
        @end="onEnd"
        item-key="id"
        group="tasks"
    >
      <template #item="{ element }">
        <div class="list-group-item bg-white p-2 mb-2 rounded shadow">
          <h3 class="font-semibold">{{ element.title }}</h3>
          <p class="text-sm text-gray-600">{{ element.description }}</p>
        </div>
      </template>
    </draggable>
    <div class="mt-2">
      <small>{{ draggingInfo }}</small>
    </div>
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb !important;
}

.list-group-item {
  cursor: move;
}

.list-group-item:hover {
  box-shadow: 0 0 11px rgba(33,33,33,.2);
}

.list-group {
  min-height: 20px;
}
</style>