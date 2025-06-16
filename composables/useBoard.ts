import { ref, computed, onMounted, watch } from 'vue'
import { useColumns } from './useColumns'
import { useTasks } from './useTasks'
import { useRoute } from 'vue-router'

export function useBoard() {
    const route = useRoute()
    const { columns: rawColumns, fetchColumns, addColumn, updateColumnPositions } = useColumns()
    const { tasks, fetchTasks, addTask, updateTask, deleteTask } = useTasks()

    const currentProjectId = ref<string | null>(null)

    const columns = computed(() => {
        return rawColumns.value.map(column => ({
            ...column,
            tasks: tasks.value.filter(task => task.columnId === column.id)
        }))
    })

    const fetchBoardData = async () => {
        if (currentProjectId.value) {
            await Promise.all([
                fetchColumns(currentProjectId.value),
                fetchTasks(currentProjectId.value)
            ])
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
        const { removed, added } = e
        if (removed && added) {
            const task = removed.element
            const newColumnId = added.list.find((t: any) => t.id === task.id).columnId
            await updateTask(task.id, { columnId: newColumnId })
        }
    }

    const addNewTask = async (columnId: number, title: string, description: string) => {
        await addTask({
            title,
            description,
            columnId,
            status: 'todo', // You might want to determine this based on the column
            position: tasks.value.filter(t => t.columnId === columnId).length
        })
    }

    const updateColumnOrder = async (newOrder: any[]) => {
        const updatedColumns = newOrder.map((col, index) => ({
            ...col,
            position: index
        }))
        await updateColumnPositions(updatedColumns)
    }


    return {
        columns,
        loading,
        onCardDrop,
        addTask: addNewTask,
        addColumn,
        updateColumnOrder,
        deleteTask,
        fetchBoardData
    }
}