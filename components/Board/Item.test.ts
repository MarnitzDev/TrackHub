import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import BoardItem from './Item.vue'
import { useBoardStore } from '~/stores/boardStore'

// Mock the NuxtLink component
const mockNuxtLink = {
    name: 'NuxtLink',
    template: '<a><slot /></a>',
    props: ['to']
}

describe('BoardItem', () => {
    const mockBoard = {
        id: '1',
        title: 'Test Board',
        coverImage: 'test-image.jpg'
    }

    let wrapper: any

    beforeEach(() => {
        wrapper = mount(BoardItem, {
            props: {
                board: mockBoard
            },
            global: {
                components: {
                    NuxtLink: mockNuxtLink
                },
                plugins: [createTestingPinia({
                    createSpy: vi.fn
                })]
            }
        })
    })

    it('renders the board title', () => {
        expect(wrapper.text()).toContain('Test Board')
    })

    it('renders the cover image when provided', () => {
        const img = wrapper.find('img')
        expect(img.exists()).toBe(true)
        expect(img.attributes('src')).toBe('test-image.jpg')
        expect(img.attributes('alt')).toBe('Test Board')
    })

    it('links to the correct board page', () => {
        const link = wrapper.findComponent(mockNuxtLink)
        expect(link.props('to')).toBe('/board/1')
    })

    // TODO: Implement
    // it('opens the dropdown menu when settings button is clicked', async () => {
    // })

    // TODO: Implement
    // it('calls setEditingBoard when edit action is selected', async () => {
    // })

    // TODO: Implement
    // it('opens delete confirmation modal when delete action is selected', async () => {
    //
    // })

    // TODO: Implement
    // it('calls destroyBoard when delete is confirmed', async () => {
    // })

    // TODO: Implement
    // it('closes delete confirmation modal when cancel is clicked', async () => {
    // })
})