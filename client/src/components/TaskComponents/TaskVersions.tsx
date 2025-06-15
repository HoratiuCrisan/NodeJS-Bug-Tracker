import React, { useEffect, useState } from 'react';
import { TaskVersion } from '../../types/Versions';
import { User } from '../../types/User';
import { getItemVersions } from '../../api/versions';
import { getUsersData } from '../../api/users';
import dayjs from 'dayjs';
import { TextEditor } from '../TextEditor';
import { Task } from '../../types/Tasks';
import { taskVerionRollback } from '../../api/tasks';

type TaskVersionsType = {
    taskId: string;
}

export const TaskVersions: React.FC<TaskVersionsType> = ({taskId}) => {
    const [taskVersions, setTaskVersions] = useState<TaskVersion[]>([]);
    const [startAfter, setStartAfter] = useState<string | undefined>(undefined);
    const [users, setUsers] = useState<User[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setTaskVersions([]);
        setStartAfter(undefined);
        setHasMore(true);
        fetchTaskVersions(true);
    }, [taskId]);

    const fetchUsersData = async (userIds: string[]) => {
        if (userIds.length <= 0) return;

        try {
            const newIds = userIds.filter(id => !users.some(user => user.id === id));
            if (newIds.length === 0) return;

            const response: User[] = await getUsersData(newIds);

            setUsers(prev => [...prev, ...response]);
        } catch (error) {
            console.error(error);
        }
    }

    const fetchTaskVersions = async (initial = false) => {
        try {
            setLoading(true);
            const response = await getItemVersions(taskId, "task", 10, initial ? undefined : startAfter) as TaskVersion[];
            if (response.length < 10) setHasMore(false);

            setTaskVersions(prev => [...prev, ...response]);
            
            if (response.length > 0) {
                const authorIds = response.map(resp => resp.data.authorId);
                const handlerIds = response.map(resp => resp.data.handlerIds).flat();

                const uniqueUsers = Array.from(new Set([...authorIds, ...handlerIds]));

                await fetchUsersData(uniqueUsers);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleRollback = async (task: Task) => {
        try {
            await taskVerionRollback(task.id, task);

            window.location.reload();
        } catch (error) {
            console.error(error);
            return;
        }
    }

    return (
        <div className="block w-full pl-4 pb-10">
            {taskVersions.map((taskVersion) => (
                <div
                    className="mt-6"
                    key={taskVersion.id}
                >
                    <span className="flex gap-2 font-semibold">
                        Version: 
                        <h1 className="font-normal">
                            {taskVersion.version}
                        </h1>
                    </span>

                    <span className="flex gap-2 font-semibold">
                        Updated at
                        <h1 className="font-normal">
                            {dayjs(taskVersion.timestamp).format("DD MMM YYYY hh:mm A")}
                        </h1>
                    </span>

                    <button
                        onClick={() => handleRollback(taskVersion.data)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-md py-2 px-3 mt-2"
                    >
                        Rollback
                    </button>

                    <div className="bg-gray-200 rounded-md mt-4 p-4">
                        <label htmlFor="description" className="font-semibold">
                            Description:
                            <TextEditor 
                                value={taskVersion.data.description}
                                onChange={() => {}}
                                readonly
                                classname="block w-full bg-white text-gray-500 rounded-lg p-2 mt-2 mb-4 mn-4 h-40 max-h-64 overflow-y-auto"
                            />
                        </label>

                        <div className="flex gap-6 w-full">
                            <label 
                                htmlFor="createdAt" 
                                className="font-semibold w-1/3 "
                            >
                                Created at
                                <input 
                                    type="text" 
                                    name="createdAt" 
                                    id="createdAt"
                                    value={dayjs(taskVersion.data.createdAt).format("DD MMM YYYY hh:mm A")}
                                    readOnly
                                    className="w-full block rounded-lg p-2 text-gray-500 bg-white mt-2 mb-4" 
                                />
                            </label>

                            <label 
                                htmlFor="deadline"
                                className="font-semibold w-1/3 "
                            >
                                Deadline
                                <input 
                                    type="text" 
                                    name="deadline" 
                                    id="deadline"
                                    value={dayjs(taskVersion.data.deadline).format("DD MMM YYYY hh:mm A")}
                                    readOnly
                                    className="w-full block rounded-lg p-2 text-gray-500 bg-white mt-2 mb-4" 
                                />
                            </label>

                             <label 
                                htmlFor="completedAt"
                                className="font-semibold w-1/3"
                            >
                                Completed at:
                                <input 
                                    type="text" 
                                    name="completedAt" 
                                    id="completedAt"
                                    value={dayjs(taskVersion.data.completedAt).format("DD MMM YYYY hh:mm A")}
                                    readOnly
                                    className="w-full block rounded-lg p-2 text-gray-500 bg-white mt-2 mb-4" 
                                />
                            </label>
                        </div>

                        <div className="flex gap-4 my-4">
                            <label 
                                htmlFor="responseCount"
                                className="font-semibold w-1/3"
                            >
                                Responses
                                <input 
                                    type="text" 
                                    name="responseCount" 
                                    id="responseCount"
                                    value={taskVersion.data.responseCount}
                                    readOnly
                                    className="w-full block rounded-lg p-2 text-gray-500 bg-white mt-2 mb-4" 
                                />
                            </label>

                            <label 
                                htmlFor="subtaskCount"
                                className="font-semibold w-1/3"
                            >
                                Subtasks
                                <input 
                                    type="text" 
                                    name="subtaskCount" 
                                    id="subtaskCount"
                                    value={taskVersion.data.subtaskCount}
                                    readOnly
                                    className="w-full block rounded-lg p-2 text-gray-500 bg-white mt-2 mb-4" 
                                />
                            </label>
                        
                            <label 
                                htmlFor="completedSubtaskCount"
                                className="font-semibold w-1/3"
                            >
                                Completed subtasks
                                <input 
                                    type="text" 
                                    name="completedSubtaskCount" 
                                    id="completedSubtaskCount"
                                    value={taskVersion.data.completedSubtaskCount}
                                    readOnly
                                    className="w-full block rounded-lg p-2 text-gray-500 bg-white mt-2 mb-4" 
                                />
                            </label>
                        </div>

                        <div className="flex gap-6 my-4">
                            <label 
                                htmlFor="authorId"
                                className="font-semibold w-1/3"
                            >
                                Author
                                <input 
                                    type="text" 
                                    name="authorId" 
                                    id="authorId"
                                    value={users.find(u => u.id === taskVersion.data.authorId)?.email ?? "No author"}
                                    readOnly
                                    className="w-full block rounded-lg p-2 text-gray-500 bg-white mt-2 mb-4" 
                                />
                            </label>

                            <label 
                                htmlFor="status"
                                className="font-semibold w-1/3"
                            >
                                Status
                                <input 
                                    type="text" 
                                    name="status" 
                                    id="status"
                                    value={taskVersion.data.status}
                                    readOnly
                                    className="w-full block rounded-lg p-2 text-gray-500 bg-white mt-2 mb-4" 
                                />
                            </label>

                             <label 
                                htmlFor="handlers"
                                className="font-semibold w-1/3"
                            >
                                Handlers
                                {taskVersion.data.handlerIds.map((handlerId) => (
                                    <input
                                        key={handlerId} 
                                        type="text" 
                                        name={handlerId} 
                                        id={handlerId}
                                        readOnly
                                        value={users.find((user => user.id === handlerId))?.email ?? "Unknown"}
                                        className="w-full block rounded-lg p-2 text-gray-500 bg-white mt-2 mb-4" 
                                    />
                                ))}
                            </label>
                        </div>
                    </div>
                </div>
            ))}

            {hasMore && (
                <div className="w-full text-center mt-4 mb-10">
                    <button 
                        disabled={loading}
                        onClick={() => fetchTaskVersions()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50 px-4 py-2"
                    >
                        {loading ? "Loading..." : "Load More"}
                    </button>
                </div>
            )}
        </div>
    )
}
