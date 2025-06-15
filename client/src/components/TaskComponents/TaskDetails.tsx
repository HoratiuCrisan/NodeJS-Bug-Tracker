import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Response, TaskCard } from '../../types/Tasks';
import { User } from '../../types/User';

import { getTaskById, getResponses } from '../../api/tasks';
import { getUserById } from '../../api/users';

import { AddTaskResponse } from './AddTaskResponse';
import { UserContext } from '../../context/UserProvider';
import { ResponseDetails } from '../ResponseComponents/ResponseDetails';
import { SubtaskContainer } from '../SubtasksComponents/SubtaskContainer';

import { MdEdit } from "react-icons/md";
import { BiTrash } from 'react-icons/bi';
import { BiArrowBack } from 'react-icons/bi';

import { DeleteDialog } from '../DeleteDialog';
import { EditTaskDialog } from './EditTaskDialog';
import dayjs from 'dayjs';
import { TaskVersions } from './TaskVersions';


export const TaskDetails = () => {
    const {user} = useContext(UserContext);
    const { taskId, projectId } = useParams();
    const [taskCard, setTaskCard] = useState<TaskCard>();
    const [taskResponses, setTaskResponses] = useState<Response[]>([]);
    const [responseDialog, setResponseDialog] = useState(false);
    const [usersMap, setUsersMap] = useState<Map<string, User>>(new Map());

    const [responseDetails, setResponseDetails] = useState<boolean>(true);
    const [subtaskDetails, setSubtaskDetsils] = useState<boolean>(false);
    const [versionDetails, setVersionDetails] = useState<boolean>(false);

    const [deleteTaskDialog, setDeleteTaskDialog] = useState<boolean>(false);
    const [editTaskDialog, setEditTaskDialog] = useState<boolean>(false);


    const fetchTaskWithUsers = async (projectId: string, taskId: string) => {
        const task: TaskCard = await getTaskById(projectId, taskId);
        const userMap = new Map(task.users.map((u) => [u.id, u]));
        return { task, usersMap: userMap };
    };

    const fetchResponsesWithMissingUsers = async (
        taskId: string,
        existingUsersMap: Map<string, User>
    ) => {
        const responses: Response[] = await getResponses(taskId);
        const missingIds = responses
        .map((res) => res.authorId)
        .filter((id) => !existingUsersMap.has(id));
        const uniqueMissingIds = Array.from(new Set(missingIds));

        const fetchedUsers = await Promise.all(
        uniqueMissingIds.map((id) => getUserById(id))
        );

        const newUsersMap = new Map(existingUsersMap);
        fetchedUsers.forEach((user) => {
        if (user) newUsersMap.set(user.id, user);
        });

        return { responses, usersMap: newUsersMap };
    };

    // --- Main Load Logic ---
    useEffect(() => {
        const loadTaskData = async () => {
        if (!taskId || !projectId) return;

        try {
            const { task, usersMap: initialUsersMap } = await fetchTaskWithUsers(
            projectId,
            taskId
            );
            setTaskCard(task);

            const { responses, usersMap: updatedMap } =
            await fetchResponsesWithMissingUsers(taskId, initialUsersMap);

            setTaskResponses(responses);
            setUsersMap(updatedMap);
        } catch (err) {
            console.error('Failed to load task data:', err);
        }
        };

        loadTaskData();
    }, [taskId, projectId]);

    const handleResponseDialog = (value: boolean) => {
        setResponseDialog(value);
    };

    const handleResponseDetails = () => {
        setResponseDetails(true);
        setSubtaskDetsils(false);
        setVersionDetails(false);
    }

    const handleSubtaskDetails = () => {
        setSubtaskDetsils(true);
        setResponseDetails(false);
        setVersionDetails(false);
    }

    const handleVersionDetails = () => {
        setVersionDetails(true);
        setResponseDetails(false);
        setSubtaskDetsils(false);
    }

    const handleDeleteTaskDialog = (value: boolean) => {
        setDeleteTaskDialog(value);
    }

    const handleEditDialog = (value: boolean) => {
        setEditTaskDialog(value);
    }

    if (!taskCard || !user) return <>Loading...</>;

    return (
        <div className="block bg-slate-100 w-full h-full p-4">
            <button 
                onClick={() => window.location.href=`/projects/${projectId}`}
                className='flex gap-2 text-xl font-medium ml-6 md:ml-14 mb-4'
            >
                <BiArrowBack className='mt-1.5' size={20}/>
                <h1>Tasks</h1>
            </button>

            <div className="block w-11/12 mx-auto bg-white rounded-md">
                <div className="flex bg-white text-green-700 font-semibold border-t-2 border-b-2 border-gray-200 rounded-md gap-4 py-4 my-1">
                    <button
                        onClick={() => handleResponseDetails()} 
                        className="px-1"
                    >
                        Responses
                    </button>
                    <button
                        onClick={() => handleSubtaskDetails()}
                    >
                        Subtasks
                    </button>

                    <button
                        onClick={() => handleVersionDetails()}
                    >
                        Versions
                    </button>
                </div>

                <div className="bg-white p-4 rounded-md w-full">
                    <div className="justify-start">
                        <p dangerouslySetInnerHTML={{ __html: taskCard.task.description }} className="text-lg"></p>
                        
                        <div className='flex gap-4 my-2 font-medium'>
                            <h1 className="font-semibold">Created At:</h1>
                            <span>{dayjs(taskCard.task.createdAt).format("ddd MMM YYYY hh:mm A")}</span>                          
                        </div>

                        <div className='flex gap-4 my-2 font-medium'>
                            <h1 className="font-semibold">Deadline:</h1>
                            <span>{dayjs(taskCard.task.deadline).format("ddd MMM YYYY hh:mm A")}</span>                          
                        </div>

                        <div className='flex gap-4 my-2 font-medium'>
                            <h1 className="font-semibold">Status:</h1>
                            <span>{taskCard.task.status}</span>                          
                        </div>
                        
                        <button
                            onClick={() => handleEditDialog(!editTaskDialog)} 
                            className="text-green-600 font-semibold hover:bg-green-600 hover:rounded-md hover:text-white p-1 my-1"
                        >
                            <MdEdit size={20}/>
                        </button>
                        <button
                            onClick={() => handleDeleteTaskDialog(!deleteTaskDialog)} 
                            className="text-red-600 font-semibold hover:bg-red-600 hover:text-white hover:rounded-md p-1 my-1 mx-2"
                        >
                            <BiTrash size={20}/>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto w-11/12">
                {
                responseDetails && 
                <>
                    <div className="flex bg-white w-full  rounded-md shadow-xl hover:shadow-2xl my-4 p-4">
                        <img src={user.photoUrl} alt="profile photo" className="rounded-full w-10 h-10"/>
                        <button
                            onClick={() => handleResponseDialog(!responseDialog)} 
                            className="w-full items-start text-start text-gray-400 font-medium hover:font-semibold mx-4"
                        >
                            Add a response...
                        </button>
                    </div>

                   {taskResponses.length > 0 && 
                        <div className="bg-white rounded-md w-full p-4 shadow-lg h-full">
                            <h1 className="font-semibold text-lg px-2 bg-white">Responses:</h1>
                            {taskResponses.map((response) => {
                                const author = usersMap.get(response.authorId);

                                return (
                                    <ResponseDetails 
                                        key={response.id}
                                        author={author}
                                        response={response}
                                    />
                                );
                            })}
                        </div>
                    }
                </>
            }

            {
                subtaskDetails && 
                <SubtaskContainer
                    usersMap={usersMap} 
                    taskId={taskCard.task.id} 
                />
            }

            {
                versionDetails &&
                <TaskVersions taskId={taskCard.task.id}/>
            }

            {responseDialog && (
                <AddTaskResponse taskId={taskCard.task.id} onClose={handleResponseDialog} />
            )}

            {deleteTaskDialog && <DeleteDialog onClose={() => handleDeleteTaskDialog(false)} id={taskId} type="task" />}
            
            {editTaskDialog && <EditTaskDialog onClose={() => handleEditDialog(false)} taskCard={taskCard} />}
            </div>
        </div>
    );
};
