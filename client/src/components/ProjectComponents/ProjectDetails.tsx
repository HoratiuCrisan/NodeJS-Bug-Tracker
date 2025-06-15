import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createInvitationLink, getProjectById } from '../../api/projects';
import { Project, ProjectCardType } from '../../types/Project';
import { User } from '../../types/User';
import { TasksContainer } from '../TaskComponents/TasksContainer';
import { ProjectMembersContainer } from './ProjectMembersContainer';
import { IoShareSocialOutline } from "react-icons/io5";
import { CreateTaskDialog } from '../TaskComponents/CreateTaskDialog';
import { InviteUsersDialog } from './InviteUsersDialog';
import { BiArrowBack } from 'react-icons/bi';

import { MdEdit } from "react-icons/md";
import { BiTrash } from 'react-icons/bi';

import { DeleteDialog } from '../DeleteDialog';
import { EditProjectDialog } from './EditProjectDialog';


export const ProjectDetails = () => {
    const {projectId} = useParams<{projectId: string | undefined}>();
    const [project, setProject] = useState<Project | undefined>(undefined);
    const [manager, setManager] = useState<User | undefined>(undefined);
    const [members, setMembers] = useState<User[]>([]);
    const [membersDialog, setMembersDialog] = useState<boolean>(false);
    const [projectDetailsDialog, setProjectDetailsDialog] = useState<boolean>(true);
    const [taskDialog, setTaskDialog] = useState<boolean>(false);
    const [inviteDialog, setInviteDialog] = useState<boolean>(false);
    const [inviteLink, setInviteLink] = useState<string>("");
    const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
    const [editDialog, setEditDialog] = useState<boolean>(false);

    useEffect(() => {
        if (projectId) {
            fetchProjectData(projectId);
        }
    }, [projectId]);

    const fetchProjectData = async (id: string) => {
        try {
            const response: ProjectCardType = await getProjectById(id);

            setProject(response.data);
            setManager(response.projectManager);
            setMembers(response.members);
        } catch (error) {
            console.error(error);
            return;
        }
    }

    const handleMembersDialog = (value: boolean) => {
        setMembersDialog(value);
        setProjectDetailsDialog(!value);
    }

    const handleProjectSettingsDialog = (value: boolean) => {
        setProjectDetailsDialog(value);
        setMembersDialog(!value);
    }

    const handleTaskDialog = (value: boolean) => {
        setTaskDialog(value);
    }

    const handleInviteDialog = (value: boolean) => {
        setInviteDialog(value);
    }

    const handleEditDialog = (value: boolean) => {
        setEditDialog(value);
    }

    const handleDeleteDialog = (value: boolean) => {
        setDeleteDialog(value);
    }

    const handleInvitationLink = async () => {
        if (!project) return;

        try {
            const response = await createInvitationLink(project.id);

            setInviteLink(response);

            handleInviteDialog(true);
        } catch (error) {
            console.error(error);
            return;
        }
    }

    if (!project || !manager ) {
        return <>Loading....</>
    }

    return (
        <div className='md:ml-3 xl:ml-5 bg-gray-100 '>
             <button 
                onClick={() => window.location.href=`/projects`}
                className='flex gap-2 text-xl font-medium p-4'
            >
                <BiArrowBack className='mt-1.5' size={20}/>
                <h1>Projects</h1>
            </button>

            <div className="block bg-white">
                <div className='flex justify-start w-full border-t border-b border-gray-300 font-medium text-emerald-800 rounded-md px-1 py-4 gap-4'>
                    <button
                        onClick={() => handleProjectSettingsDialog(!projectDetailsDialog)}
                    >
                        Details
                    </button>
                    
                    <button
                        onClick={() => handleMembersDialog(!membersDialog)}
                    >
                        Members
                    </button>
                </div>
            
                {!membersDialog && 
                    <div className="flex flex-col p-4 mr-4">
                        <h1 className="font-semibold text-lg">{project.title}</h1>
                        <p 
                            dangerouslySetInnerHTML={{ __html: project.description}}
                            className="font-mono px-2"
                        ></p>

                        <span className="flex flex-grow"></span>

                        <div className="flex">
                            <button
                                onClick={() => handleEditDialog(!editDialog)} 
                                className="text-green-600 font-semibold hover:bg-green-600 hover:rounded-md hover:text-white p-1 my-1"
                            >
                                <MdEdit size={20}/>
                            </button>
                            <button
                                onClick={() => handleDeleteDialog(!deleteDialog)} 
                                className="text-red-600 font-semibold hover:bg-red-600 hover:text-white hover:rounded-md p-1 my-1 mx-2"
                            >
                                <BiTrash size={20}/>
                            </button>
                        </div>
                    </div>
                }
            </div>

            <div className="flex justify-end items-end text-end w-full gap-2 px-4 mb-2 mt-4">
                <button
                    onClick={handleInvitationLink} 
                    className="flex bg-green-600 text-gray-50 hover:bg-green-700 hover:text-gray-200 rounded-md gap-2 p-2"
                >
                    <IoShareSocialOutline size={20} className='mt-0.5'/> <span>Invite</span>
                </button>
                <button
                    onClick={() => handleTaskDialog(!taskDialog)} 
                    className="bg-green-600 text-gray-50 hover:bg-green-700 hover:text-gray-200 rounded-md p-2"
                >
                    Add task
                </button>
            </div>

            {projectDetailsDialog && <TasksContainer 
                project={project!}
                limit={10}
                orderBy="createdAt"
                orderDirection="asc"
            /> }

            {membersDialog && <ProjectMembersContainer 
                members={members}
                manager={manager}
            />}

            {taskDialog && 
                <CreateTaskDialog 
                    projectId={project.id}
                    onClose={handleTaskDialog}
                    members={members}
                />
            }

            {inviteDialog && 
                <InviteUsersDialog 
                    projectId={project.id} 
                    projectTitle={project.title}
                    onClose={handleInviteDialog} 
                    existingUsers={[project.projectManagerId, ...project.memberIds]}
                    invitationLink={inviteLink}
                />
            }

            {editDialog &&
                <EditProjectDialog 
                    onClose={handleEditDialog} 
                    project={project}
                    manager={manager}
                    members={members}
                />
            }

            {deleteDialog &&
                <DeleteDialog 
                    onClose={handleDeleteDialog}
                    id={project.id}
                    type="project"
                />
            }
        </div>
    )
}
