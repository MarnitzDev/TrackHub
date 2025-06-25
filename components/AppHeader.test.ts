import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, defineComponent, h } from 'vue'
import { createTestingPinia } from '@pinia/testing'
import _sut from '~/components/AppHeader.vue'

// Mock components
const mockNuxtLink = defineComponent({
    name: 'NuxtLink',
    props: ['to'],
    render() {
        return h('a', { href: this.to }, this.$slots.default?.())
    }
})

const mockUIcon = defineComponent({
    name: 'UIcon',
    props: ['name'],
    render() {
        return h('i', { class: this.name })
    }
})

// Mock #imports
vi.mock('#imports', () => ({
    useAuth: () => ({
        status: ref('unauthenticated'),
        data: ref(null),
        signIn: vi.fn(),
        signOut: vi.fn()
    })
}))

describe('AppHeader', () => {
    const mountComponent = (options = {}) => {
        return mount(_sut, {
            global: {
                components: {
                    NuxtLink: mockNuxtLink,
                    UIcon: mockUIcon
                },
                plugins: [
                    createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            user: {
                                isGuest: true,
                                user: null,
                                userMetadata: null
                            },
                            board: {}
                        },
                        ...options
                    })
                ]
            }
        })
    }

    it('renders the logo', () => {
        const wrapper = mountComponent()
        expect(wrapper.find('.font-bold.text-xl').text()).toBe('TrackHub')
    })

    it('renders navigation items', () => {
        const wrapper = mountComponent()
        const navItems = wrapper.findAll('nav a')
        expect(navItems.length).toBeGreaterThan(0)
    })

    it('renders correct navigation items', () => {
        const wrapper = mountComponent()
        const navItems = wrapper.findAll('nav a')
        const expectedItems = [
            { label: 'Dashboard', to: '/' },
            { label: 'Board', to: '/board' },
            { label: 'Projects', to: '/projects' },
            { label: 'Tasks', to: '/tasks' },
            { label: 'Team', to: '/team' },
        ]
        expect(navItems).toHaveLength(expectedItems.length)
        navItems.forEach((item, index) => {
            expect(item.text()).toContain(expectedItems[index].label)
            expect(item.attributes('href')).toBe(expectedItems[index].to)
        })
    })

    // it('displays user name when authenticated', async () => {
    //     const wrapper = mountComponent({
    //         initialState: {
    //             user: {
    //                 isGuest: false,
    //                 user: { name: 'John Doe' },
    //                 userMetadata: null
    //             }
    //         }
    //     })
    //     await wrapper.vm.$nextTick()
    //     expect(wrapper.find('.hidden.md\\:inline').text()).toBe('John Doe')
    // })

    // it('displays "Guest User" for guest users', async () => {
    //     const wrapper = mountComponent()
    //     await wrapper.vm.$nextTick()
    //     expect(wrapper.find('[data-testid="user-menu-button"]').text()).toContain('Guest User')
    // })

    it('toggles user menu on button click', async () => {
        const wrapper = mountComponent()
        const button = wrapper.find('[data-testid="user-menu-button"]')
        expect(wrapper.find('[data-testid="user-menu-dropdown"]').exists()).toBe(false)
        await button.trigger('click')
        expect(wrapper.find('[data-testid="user-menu-dropdown"]').exists()).toBe(true)
    })

    // it('calls signOut when sign out button is clicked', async () => {
    //     const mockSignOut = vi.fn()
    //     vi.mocked(useAuth).mockReturnValue({
    //         status: ref('authenticated'),
    //         data: ref({ user: { name: 'John Doe' } }),
    //         signOut: mockSignOut,
    //         signIn: vi.fn()
    //     })
    //
    //     const wrapper = mountComponent()
    //     await wrapper.find('[data-testid="user-menu-button"]').trigger('click') // Open user menu
    //     await wrapper.find('[data-testid="sign-out-button"]').trigger('click') // Click sign out button
    //     expect(mockSignOut).toHaveBeenCalled()
    // })
})