import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, defineComponent, h } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import AppHeader from '../components/AppHeader.vue'

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

// Mock the store modules
vi.mock('~/stores/userStore', () => ({
    useUserStore: () => ({
        isGuest: ref(true),
        user: ref(null),
        userMetadata: ref(null),
        $reset: vi.fn()
    })
}))

vi.mock('~/stores/boardStore', () => ({
    useBoardStore: () => ({
        $reset: vi.fn()
    })
}))

describe('AppHeader', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('renders the logo', () => {
        const wrapper = mount(AppHeader, {
            global: {
                components: {
                    NuxtLink: mockNuxtLink,
                    UIcon: mockUIcon
                }
            }
        })
        expect(wrapper.find('.font-bold.text-xl').text()).toBe('TrackHub')
    })

    it('renders navigation items', () => {
        const wrapper = mount(AppHeader, {
            global: {
                components: {
                    NuxtLink: mockNuxtLink,
                    UIcon: mockUIcon
                }
            }
        })
        const navItems = wrapper.findAll('nav a')
        expect(navItems.length).toBeGreaterThan(0)
    })

    it('renders correct navigation items', () => {
        const wrapper = mount(AppHeader, {
            global: {
                components: { NuxtLink: mockNuxtLink, UIcon: mockUIcon },
            },
        })
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
    //     const wrapper = mount(AppHeader, {
    //         global: {
    //             components: { NuxtLink: mockNuxtLink, UIcon: mockUIcon },
    //             mocks: {
    //                 useAuth: () => ({
    //                     status: ref('authenticated'),
    //                     data: ref({ user: { name: 'John Doe' } }),
    //                 }),
    //             },
    //         },
    //     })
    //     await wrapper.vm.$nextTick()
    //     expect(wrapper.find('.hidden.md\\:inline').text()).toBe('John Doe')
    // })
    //
    // it('displays "Guest User" for guest users', async () => {
    //     const wrapper = mount(AppHeader, {
    //         global: {
    //             components: { NuxtLink: mockNuxtLink, UIcon: mockUIcon },
    //             mocks: {
    //                 useAuth: () => ({
    //                     status: ref('unauthenticated'),
    //                     data: ref(null),
    //                 }),
    //                 useUserStore: () => ({
    //                     isGuest: ref(true),
    //                 }),
    //             },
    //         },
    //     })
    //     await wrapper.vm.$nextTick()
    //     expect(wrapper.find('.hidden.md\\:inline').text()).toBe('Guest User')
    // })

    it('toggles user menu on button click', async () => {
        const wrapper = mount(AppHeader, {
            global: {
                components: { NuxtLink: mockNuxtLink, UIcon: mockUIcon },
            },
        })
        const button = wrapper.find('[data-testid="user-menu-button"]')
        expect(wrapper.find('[data-testid="user-menu-dropdown"]').exists()).toBe(false)
        await button.trigger('click')
        expect(wrapper.find('[data-testid="user-menu-dropdown"]').exists()).toBe(true)
    })

    // it('calls signOut when sign out button is clicked', async () => {
    //     const mockSignOut = vi.fn()
    //     const wrapper = mount(AppHeader, {
    //         global: {
    //             components: { NuxtLink: mockNuxtLink, UIcon: mockUIcon },
    //             mocks: {
    //                 useAuth: () => ({
    //                     status: ref('authenticated'),
    //                     data: ref({ user: { name: 'John Doe' } }),
    //                     signOut: mockSignOut,
    //                 }),
    //             },
    //         },
    //     })
    //     await wrapper.find('button').trigger('click') // Open user menu
    //     await wrapper.find('button.block.w-full').trigger('click') // Click sign out button
    //     expect(mockSignOut).toHaveBeenCalled()
    // })



})