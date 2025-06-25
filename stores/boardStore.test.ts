import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBoardStore } from './boardStore'

// Create a mock $fetch function
const mockFetch = vi.fn()

// Add $fetch to the global scope
vi.stubGlobal('$fetch', mockFetch)

describe('Board Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    it('fetches boards', async () => {
        const store = useBoardStore()
        const mockBoards = [{ id: '1', title: 'Test Board' }]
        mockFetch.mockResolvedValueOnce(mockBoards)

        await store.fetchBoards()

        expect(store.boards).toEqual(mockBoards)
        expect(store.loading).toBe(false)
        expect(store.error).toBeNull()
    })

    it('creates a board', async () => {
        const store = useBoardStore()
        const newBoard = { title: 'New Board', description: 'Test Description' }
        mockFetch.mockResolvedValueOnce(newBoard)

        await store.createBoard(newBoard)

        expect(mockFetch).toHaveBeenCalledWith('/api/boards', {
            method: 'POST',
            body: newBoard
        })
    })

    it('updates a board', async () => {
        const store = useBoardStore()
        const updatedBoard = { id: '1', title: 'Updated Board', description: 'Updated Description' }

        await store.updateBoard(updatedBoard)

        expect(mockFetch).toHaveBeenCalledWith('/api/boards/1', {
            method: 'PUT',
            body: updatedBoard
        })
    })

    it('deletes a board', async () => {
        const store = useBoardStore()
        const boardId = '1'

        await store.destroyBoard(boardId)

        expect(mockFetch).toHaveBeenCalledWith('/api/boards/1', {
            method: 'DELETE'
        })
    })

    it('sets editing board', () => {
        const store = useBoardStore()
        const board = { id: '1', title: 'Test Board' }

        store.setEditingBoard(board)

        expect(store.editingBoard).toEqual(board)
    })

    it('adds list to current board', () => {
        const store = useBoardStore()
        const board = { id: '1', title: 'Test Board', lists: [] }
        store.boards = [board]
        const newList = { id: '1', title: 'New List', boardId: '1' }

        store.addListToCurrentBoard(newList)

        expect(store.boards[0].lists).toContainEqual(newList)
        expect(store.boards[0].lists.length).toBe(1)
    })

    it('handles errors when fetching boards', async () => {
        const store = useBoardStore()
        const error = new Error('Fetch error')
        mockFetch.mockRejectedValueOnce(error)

        await store.fetchBoards()

        expect(store.error).toBe('Fetch error')
        expect(store.loading).toBe(false)
    })
})