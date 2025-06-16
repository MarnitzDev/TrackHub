import { ref } from 'vue'

export const useProjects = () => {
    const projects = ref([])
    const currentProject = ref(null)

    const fetchProjects = async () => {
        // Implement API call to fetch projects
        // For now, we'll use dummy data
        projects.value = [
            { id: '1', title: 'Project 1' },
            { id: '2', title: 'Project 2' },
        ]
    }

    const setCurrentProject = (project) => {
        currentProject.value = project
    }

    return {
        projects,
        currentProject,
        fetchProjects,
        setCurrentProject
    }
}