import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { ref } from 'vue'
import BoardContainer from '~/components/Board/Container.vue'
import { useBoardStore } from '~/stores/boardStore'

// Mock components
vi.mock('~/components/Board/Item.vue', () => ({
    default: {
        name: 'BoardCard',
        props: ['board'],
        template: '<div data-testid="board-card">Board Card</div>'
    }
}))

// Mock #imports
vi.mock('#imports', () => ({
    useAuth: vi.fn().mockReturnValue({
        status: ref('authenticated'),
        data: ref({ user: { name: 'Test User' } })
    })
}))

// Test suite for the BoardContainer component
describe('BoardContainer', () => {
    let wrapper: any

    beforeEach(() => {
        wrapper = mount(BoardContainer, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        board: {
                            boards: [],
                            loading: false,
                            error: null,
                            editingBoard: null
                        }
                    }
                })]
            }
        })
    })

    // Test if the component renders the correct title
    it('renders correctly', () => {
        expect(wrapper.find('h2').text()).toBe('Your Boards')
    })

    // Test if the loading state is displayed correctly
    it('shows loading state', async () => {
        const store = useBoardStore()
        store.loading = true
        await wrapper.vm.$nextTick()
        expect(wrapper.find('p').text()).toBe('Loading...')
    })

    // Test if the error state is displayed correctly
    it('shows error state', async () => {
        const store = useBoardStore()
        store.error = 'Test error'
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.bg-red-100').text()).toContain('Test error')
    })

    // Test if the empty state is displayed when there are no boards
    it('shows empty state when no boards', async () => {
        const store = useBoardStore()
        store.boards = []
        await wrapper.vm.$nextTick()
        expect(wrapper.find('p').text()).toBe("You don't have any boards yet.")
    })

    // Test if board cards are rendered when boards exist
    it('renders board cards when boards exist', async () => {
        const store = useBoardStore()
        store.boards = [{ id: '1', title: 'Test Board' }]
        await wrapper.vm.$nextTick()
        const boardCards = wrapper.findAll('[data-testid="board-card"]')
        expect(boardCards.length).toBe(1)
    })

    // Test if the create board modal opens when the create button is clicked
    it('opens create board modal', async () => {
        const createButton = wrapper.find('[data-testid="create-board-button"]')
        expect(createButton.exists()).toBe(true)
        await createButton.trigger('click')
        expect(wrapper.vm.showCreateBoardModal).toBe(true)
    })

    // Test the creation of a new board
    it('creates a new board', async () => {
        const store = useBoardStore()
        store.createBoard = vi.fn().mockResolvedValue({})
        // Simulate opening the modal
        await wrapper.find('[data-testid="create-board-button"]').trigger('click')
        // Set the reactive values directly
        wrapper.vm.newBoardTitle = 'New Board'
        wrapper.vm.newBoardDescription = 'New Description'
        // Call handleCreateBoard
        await wrapper.vm.handleCreateBoard()
        // Wait for any asynchronous operations to complete
        await wrapper.vm.$nextTick()
        // Check if the store method was called with the correct arguments
        expect(store.createBoard).toHaveBeenCalledWith({
            title: 'New Board',
            description: 'New Description'
        })
        // Check if the modal is closed after creation
        expect(wrapper.vm.showCreateBoardModal).toBe(false)
    })

    // TODO: Implement test for opening edit board modal
    // it('opens edit board modal', async () => {
    //
    // })

    // TODO: Implement test for updating a board
    // it('updates a board', async () => {
    //
    // })
})