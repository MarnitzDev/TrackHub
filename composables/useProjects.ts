
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'

export const useProjects = () => {
    const { user } = useAuth()
    const projects = ref([])
    const currentProject = ref(null)
    const loading = ref(false)
    const error = ref(null)

    const fetchProjects = async () => {
        if (!user.value) return
        loading.value = true
        error.value = null
        try {
            const response = await fetch(`/api/projects?userId=${user.value.id}`)
            if (!response.ok) throw new Error('Failed to fetch projects')
            projects.value = await response.json()
        } catch (e) {
            console.error('Error fetching projects:', e)
            error.value = 'Failed to load projects'
        } finally {
            loading.value = false
        }
    }

    const createProject = async (title: string) => {
        if (!user.value) return null
        loading.value = true
        error.value = null
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.value.id, title })
            })
            if (!response.ok) throw new Error('Failed to create project')
            const newProject = await response.json()
            projects.value.push(newProject)
            return newProject
        } catch (e) {
            console.error('Error creating project:', e)
            error.value = 'Failed to create project'
            return null
        } finally {
            loading.value = false
        }
    }

    const setCurrentProject = (projectId: string) => {
        currentProject.value = projects.value.find(p => p.id === projectId) || null
    }

    return {
        projects,
        currentProject,
        loading,
        error,
        fetchProjects,
        createProject,
        setCurrentProject
    }
}