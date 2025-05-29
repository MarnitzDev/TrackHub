<script setup lang="ts">
import { ref } from 'vue'
import draggable from 'vuedraggable'

interface Task {
  id: number
  title: string
  description: string
}

interface Column {
  id: number
  title: string
  tasks: Task[]
}

const columns = ref<Column[]>([
  {
    id: 1,
    title: 'To Do',
    tasks: [
      { id: 1, title: 'Task 1', description: 'Description for Task 1' },
      { id: 2, title: 'Task 2', description: 'Description for Task 2' },
    ]
  },
  {
    id: 2,
    title: 'In Progress',
    tasks: [
      { id: 3, title: 'Task 3', description: 'Description for Task 3' },
    ]
  },
  {
    id: 3,
    title: 'Done',
    tasks: [
      { id: 4, title: 'Task 4', description: 'Description for Task 4' },
    ]
  }
])

const log = (evt: any) => {
  console.log(evt)
}
</script>

<template>
  <div class="board">
    <h1 class="text-2xl font-bold mb-4">Project Board</h1>
    <div class="flex space-x-4">
      <div v-for="column in columns" :key="column.id" class="bg-gray-100 p-4 rounded-lg w-64">
        <h2 class="font-bold mb-2">{{ column.title }}</h2>
        <draggable
            :list="column.tasks"
            group="tasks"
            @change="log"
            ghost-class="ghost"
            item-key="id"
            class="min-h-[50px]"
        >
          <template #item="{ element }">
            <div class="bg-white p-2 mb-2 rounded shadow cursor-move">
              <h3 class="font-semibold">{{ element.title }}</h3>
              <p class="text-sm text-gray-600">{{ element.description }}</p>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board {
  padding: 20px;
}
.ghost {
  opacity: 0.5;
}
</style>