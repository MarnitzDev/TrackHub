import { ref } from 'vue'

export const useColumns = () => {
    const columns = ref([])

    const fetchColumns = async (projectId) => {
        try {
            const response = await fetch(`/api/columns?projectId=${projectId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch columns')
            }
            columns.value = await response.json()
        } catch (error) {
            console.error('Error fetching columns:', error)
            throw error
        }
    }

    const addColumn = async (columnData) => {
        try {
            const response = await fetch('/api/columns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(columnData),
            })
            if (!response.ok) {
                throw new Error('Failed to add column')
            }
            const newColumn = await response.json()
            columns.value.push(newColumn)
            return newColumn
        } catch (error) {
            console.error('Error adding column:', error)
            throw error
        }
    }

    const updateColumnPositions = async (updatedColumns) => {
        try {
            const response = await fetch('/api/columns', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ columns: updatedColumns }),
            })
            if (!response.ok) {
                throw new Error('Failed to update column positions')
            }
            columns.value = await response.json()
        } catch (error) {
            console.error('Error updating column positions:', error)
            throw error
        }
    }

    return {
        columns,
        fetchColumns,
        addColumn,
        updateColumnPositions
    }
}