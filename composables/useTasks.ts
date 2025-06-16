import { ref } from 'vue'

export const useTasks = () => {
    const tasks = ref([])

    const fetchTasks = async (projectId) => {
        try {
            const response = await fetch(`/api/tasks?projectId=${projectId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch tasks')
            }
            tasks.value = await response.json()
        } catch (error) {
            console.error('Error fetching tasks:', error)
            throw error
        }
    }

    const addTask = async (taskData) => {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            })
            if (!response.ok) {
                throw new Error('Failed to add task')
            }
            const newTask = await response.json()
            tasks.value.push(newTask)
            return newTask
        } catch (error) {
            console.error('Error adding task:', error)
            throw error
        }
    }

    const updateTask = async (taskId, updates) => {
        try {
            const response = await fetch(`/api/tasks`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: taskId, ...updates }),
            })
            if (!response.ok) {
                throw new Error('Failed to update task')
            }
            const updatedTask = await response.json()
            const index = tasks.value.findIndex(t => t.id === taskId)
            if (index !== -1) {
                tasks.value[index] = updatedTask
            }
            return updatedTask
        } catch (error) {
            console.error('Error updating task:', error)
            throw error
        }
    }

    const deleteTask = async (taskId) => {
        try {
            const response = await fetch(`/api/tasks?id=${taskId}`, {
                method: 'DELETE',
            })
            if (!response.ok) {
                throw new Error('Failed to delete task')
            }
            tasks.value = tasks.value.filter(t => t.id !== taskId)
            return true
        } catch (error) {
            console.error('Error deleting task:', error)
            throw error
        }
    }

    const reorderTasks = async (columnId, newOrder) => {
        try {
            const response = await fetch('/api/tasks', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ columnId, taskOrder: newOrder }),
            })
            if (!response.ok) {
                throw new Error('Failed to reorder tasks')
            }
            // Update local state
            tasks.value = tasks.value.map(task => {
                if (task.columnId === columnId) {
                    const updatedTask = newOrder.find(t => t.id === task.id)
                    return updatedTask ? { ...task, ...updatedTask } : task
                }
                return task
            })
        } catch (error) {
            console.error('Error reordering tasks:', error)
            throw error
        }
    }

    return {
        tasks,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
        reorderTasks
    }
}