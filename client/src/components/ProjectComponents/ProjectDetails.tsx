import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Project, Task, User } from '../../utils/interfaces/Project';
import { getProjectById, updateProject } from '../../api/projects';
import { ProjectMembersPanel } from './ProjectMembersPanel';
import { CreateTaskDialog } from '../TaskComponents/CreateTaskDialog';
import { useAuth } from '../../config/AuthContext';
import { AddTaskResponse } from '../TaskComponents/AddTaskResponse';
import defaultUserPhoto from '../../Images/default-user-photo.svg';
import '../../styles/TextStyleFormatted.css';

export const ProjectDetails = () => {
    const params = useParams();
    const { currentUser } = useAuth();
    const [projectDetails, setProjectDetails] = useState<Project>();
    const [manager, setManager] = useState<User>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [toggleUserPannel, setToggleUserPannel] = useState<boolean>(true);
    const [toggleAddTask, setToggleAddTask] = useState<boolean>(false);
    const [toggleResponse, setToggleResponse] = useState<boolean>(false);
    const [taskResponse, setTaskResponse] = useState<string>('');
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const tasksRef = useRef<Task[]>([]);

    useEffect(() => {
        if (isLoading) {
            fetchData();
        }
        setIsLoading(false);
    }, [isLoading]);

    const fetchData = async () => {
        const response: Project = await getProjectById(params.id);
        if (!response) {
            // TODO: error handling
            return;
        }
        setProjectDetails(response);
        setManager(response.ProjectManager);
        tasksRef.current = response.TaskList;
        console.log(response);
    };

    const handleResponseUpdate = (value: string) => {
        setTaskResponse(value);
    };

    const handleSubmitResponseChange = async (task: Task, id: number) => {
        if (!projectDetails) {
            return;
        }
        task.Response = task.Response + taskResponse;
        const updatedTaskList = [...projectDetails.TaskList];
        updatedTaskList[id] = task;
        const updatedProjectDetails = { ...projectDetails, TaskList: updatedTaskList };
        setProjectDetails(updatedProjectDetails);

        const response = await updateProject(updatedProjectDetails, params.id);
        if (!response) {
            // TODO: handle error
            return;
        }
        setIsLoading(true);
        setToggleResponse(false);
        setTaskResponse('');
    };

    const handleTaskCreation = async (newTask: Task) => {
        if (!projectDetails) {
            return
        }

        const updateTaskList = [...projectDetails.TaskList, newTask];

        const updateProjectDetails = {...projectDetails, TaskList: updateTaskList}
        setProjectDetails(updateProjectDetails)
    }

    if (!projectDetails) {
        return <div>No project details yet</div>;
    }

    if (!manager) {
        return <div>Loading...</div>;
    }

    return (
        <div className='flex'>
            <div className='flex-1 mt-4'>
                <button
                    onClick={() => setToggleAddTask(true)}
                    className='bg-emerald-600 hover:bg-emerald-700 rounded-md text-white p-1'
                >
                    Add Task
                </button>
                <div className='block bg-gray-100 rounded-md shadow-lg w-5/6 p-4 my-4'>
                    <h1 className='text-lg font-semibold p-2'>{projectDetails.Title}</h1>
                    <p className='text-md p-2'>{projectDetails.Description}</p>
                </div>

                {tasksRef.current.length > 0 && tasksRef.current.map((task, id) => (
                    <div
                        key={id}
                        className='block bg-gray-100 rounded-md shadow-lg w-5/6 p-4 my-8'
                    >
                        <div className='shadow-2xl py-2'>
                            <div className='flex px-2'>
                                <img
                                    src={task.CreatorProfileURL || defaultUserPhoto}
                                    onError={(e) => e.currentTarget.src = defaultUserPhoto}
                                    alt="creator"
                                    className='rounded-full w-12 h-12'
                                />
                                <h1 className='text-lg font-semibold mx-2 py-2'>{task.Creator}</h1>
                            </div>

                            <div className='block my-2'>
                                <h6 className='text-md font-semibold mx-2'>{task.Title}</h6>
                                <div
                                    className='text-sm p-2'
                                    dangerouslySetInnerHTML={{ __html: task.Description }}
                                />
                            </div>
                        </div>

                        <div className='p-2 bg-gray-200 rounded-md mt-4'>
                            <div className='flex justify-between mt-4'>
                                <div className='flex'>
                                    <img
                                        src={task.HandlerProfileURL || defaultUserPhoto}
                                        onError={(e) => e.currentTarget.src = defaultUserPhoto}
                                        alt="handler"
                                        className='rounded-full w-12 h-12'
                                    />
                                    <h1 className='text-lg font-semibold mt-2 mx-2'>{task.Handler}</h1>
                                </div>
                            </div>
                            <div className='text-sm p-2'>
                                <div
                                    className='text-sm p-2 formatted-text'
                                    dangerouslySetInnerHTML={{ __html: task.Response }}
                                />
                                {selectedTaskId === id ? (
                                    <AddTaskResponse
                                        onClose={() => setSelectedTaskId(null)}
                                        onSubmit={() => handleSubmitResponseChange(task, id)}
                                        value={taskResponse}
                                        onChange={handleResponseUpdate}
                                        data={task}
                                    />
                                ) : (
                                    <span
                                        onClick={() => setSelectedTaskId(id)}
                                        className='text-sm hover:font-semibold cursor-pointer'
                                    >
                                        Add response...
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className='flex-shrink-0'>
                {!toggleUserPannel && (
                    <button
                        onClick={() => setToggleUserPannel(true)}
                        className='border-2 border-gray-700 rounded-md hover:bg-gray-700 hover:text-white font-semibold p-1 m-4'
                    >
                        Members
                    </button>
                )}

                <div className={`${toggleUserPannel && 'h-full bg-gray-100'}`}>
                    <ProjectMembersPanel
                        manager={manager}
                        members={projectDetails.Members}
                        panelState={toggleUserPannel}
                        onClose={() => setToggleUserPannel(false)}
                    />
                </div>
            </div>

            {toggleAddTask && (
                <CreateTaskDialog
                    onClose={() => setToggleAddTask(false)}
                    members={projectDetails.Members}
                    projectData={projectDetails}
                    onTaskCreation={handleTaskCreation}
                    id={params.id}
                />
            )}
        </div>
    );
};
