import { ref, computed, onMounted, watch } from 'vue'
import { useColumns } from './useColumns'
import { useTasks } from './useTasks'
import { useRoute } from 'vue-router'

export function useBoard() {
    const route = useRoute()
    const { columns: rawColumns, fetchColumns, addColumn, updateColumnPositions } = useColumns()
    const { tasks, fetchTasks, addTask, updateTask, deleteTask } = useTasks()

    const currentProjectId = ref<string | null>(null)
    const loading = ref(false)
    const boards = ref([])

    const columns = computed(() => {
        return rawColumns.value.map(column => ({
            ...column,
            tasks: tasks.value.filter(task => task.columnId === column.id)
        }))
    })

    const fetchBoards = async () => {
        loading.value = true
        try {
            const response = await fetch('/api/boards')
            if (!response.ok) {
                throw new Error('Failed to fetch boards')
            }
            const data = await response.json()
            console.log("Fetched boards:", data)
            boards.value = data
        } catch (error) {
            console.error('Error fetching boards:', error)
        } finally {
            loading.value = false
        }
    }

    const fetchBoardData = async () => {
        if (currentProjectId.value) {
            loading.value = true
            try {
                await Promise.all([
                    fetchColumns(currentProjectId.value),
                    fetchTasks(currentProjectId.value)
                ])
            } finally {
                loading.value = false
            }
        }
    }

    onMounted(() => {
        if (route.params.projectId) {
            currentProjectId.value = route.params.projectId as string
            fetchBoardData()
        }
    })

    watch(() => route.params.projectId, (newProjectId) => {
        if (newProjectId) {
            currentProjectId.value = newProjectId as string
            fetchBoardData()
        }
    })

    const onCardDrop = async (e: any) => {
        loading.value = true
        try {
            const { removed, added } = e
            if (removed && added) {
                const task = removed.element
                const newColumnId = added.list.find((t: any) => t.id === task.id).columnId
                await updateTask(task.id, { columnId: newColumnId })
            }
        } finally {
            loading.value = false
        }
    }

    const addNewTask = async (columnId: number, title: string, description: string) => {
        loading.value = true
        try {
            await addTask({
                title,
                description,
                columnId,
                status: 'todo', // You might want to determine this based on the column
                position: tasks.value.filter(t => t.columnId === columnId).length
            })
        } finally {
            loading.value = false
        }
    }

    const updateColumnOrder = async (newOrder: any[]) => {
        loading.value = true
        try {
            const updatedColumns = newOrder.map((col, index) => ({
                ...col,
                position: index
            }))
            await updateColumnPositions(updatedColumns)
        } finally {
            loading.value = false
        }
    }

    return {
        columns,
        boards,
        loading,
        fetchBoards,
        onCardDrop,
        addTask: addNewTask,
        addColumn,
        updateColumnOrder,
        deleteTask,
        fetchBoardData
    }
}