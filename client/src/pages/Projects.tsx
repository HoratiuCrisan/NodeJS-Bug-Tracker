import React, { useState, useEffect, useRef, useContext } from 'react'
import { IoExtensionPuzzleOutline } from "react-icons/io5"
import { useNavigate } from 'react-router-dom'
import { getUserProjects } from '../api/projects'
import { Project } from '../types/Project'
import { ProjectCard } from '../components/ProjectComponents/ProjectCard'
import { UserContext } from '../context/UserProvider'
import { User } from '../types/User'
import { getUsersData } from '../api/users'

export const Projects = () => {
	const { loading, user } = useContext(UserContext)
	const navigate = useNavigate()
	const isDataFetched = useRef<boolean>(false)
	const [projects, setProjects] = useState<Project[]>([])
	const [managers, setManagers] = useState<User[]>([])
	const [membersMap, setMembersMap] = useState<Map<string, User>>(new Map())

	useEffect(() => {
		if (user && !isDataFetched.current) {
			isDataFetched.current = true
			fetchProjects(user.id)
		}
	}, [user])

	const fetchProjects = async (userId: string) => {
		try {
			const response: Project[] = await getUserProjects(userId)
			setProjects(response)

			// Gather unique manager and member IDs
			const managerIds = new Set(response.map(p => p.projectManagerId))
			const memberIds = new Set<string>()
			response.forEach(project => {
				project.memberIds?.forEach(id => memberIds.add(id))
			})

			await Promise.all([
				fetchManagersData(Array.from(managerIds)),
				fetchMembersData(Array.from(memberIds))
			])
		} catch (error) {
			console.error(error)
		}
	}

	const fetchManagersData = async (managerIds: string[]) => {
		try {
			const response: User[] = await getUsersData(managerIds)
			setManagers(response)
		} catch (error) {
			console.error(error)
		}
	}

	const fetchMembersData = async (memberIds: string[]) => {
		try {
			const response: User[] = await getUsersData(memberIds)
			const map = new Map<string, User>()
			response.forEach(member => map.set(member.id, member))
			setMembersMap(map)
		} catch (error) {
			console.error(error)
		}
	}

	if (!user || loading) return <>Loading...</>
	if (!projects.length) return <div>No projects...</div>

	return (
		<div className="px-4">
			<div className='flex justify-between mt-4 lg:pl-10'>
				<h1 className='flex text-xl text-gray-800 font-semibold'>
					<IoExtensionPuzzleOutline className='mr-4 mt-1' />
					Projects
				</h1>

				<button
					onClick={() => navigate('/create-project')}
					className='bg-green-600 rounded-md text-lg text-white hover:bg-green-700 mx-4 py-1 px-2'
				>
					Add Project
				</button>
			</div>

			<div className='grid grid-cols-2 md:grid-cols-3 gap-4 p-4'>
				{projects.map(project => (
					<div
						key={project.id}
						className='w-full'
						onClick={() => navigate(`/projects/${project.id}`)}
					>
						<ProjectCard
							data={project}
							manager={managers.find(m => m.id === project.projectManagerId)}
							members={project.memberIds?.map(id => membersMap.get(id)).filter(Boolean) || []}
						/>
					</div>
				))}
			</div>
		</div>
	)
}
