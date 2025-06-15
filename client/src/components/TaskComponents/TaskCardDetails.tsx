import React, {useEffect, useState} from 'react'
import { TaskCard } from '../../types/Tasks'
import { IoAddOutline } from "react-icons/io5";
import { BiMessageAltDetail } from "react-icons/bi";
import { BsListTask } from "react-icons/bs";
import { CreateSubtaskDialog } from '../SubtasksComponents/CreateSubtaskDialog';
import { useNavigate } from 'react-router-dom';
import { useCan } from '../../hooks/useCan';
import { BiTrash } from 'react-icons/bi';
import { DeleteDialog } from '../DeleteDialog';
import defaultPhoto from "../../Images/default-user-photo.svg";
import { stripHtml } from '../../utils/htmlStrip';
import dayjs from 'dayjs';

type TaskCardType = {
    projectManager: string;
    taskCard: TaskCard;
}

export const TaskCardDetails: React.FC<TaskCardType> = ({taskCard, projectManager}) => {
    const navigate = useNavigate();
    const canAddSubtask = useCan("createSubtask", projectManager);
    const [subtaskDialog, setSubtaskDialog] = useState<boolean>(false);
    const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
    const [description, setDescription] = useState<string>("");

    useEffect(() => {
        const truncedDescription = stripHtml(taskCard.task.description, 100);

        setDescription(truncedDescription);
    }, [taskCard])

    const handleSubtaskDialog = (value: boolean) => {
        setSubtaskDialog(value);
    }

    const handleDeleteDialog = (value: boolean) => {
        setDeleteDialog(value);
    }

    return (
        <div className="flex flex-col w-full bg-white rounded-lg shadow-md hover:shadow-2xl cursor-pointer p-4 h-full">
            <div 
                onClick={() => navigate(`/projects/${taskCard.task.projectId}/tasks/${taskCard.task.id}`)}
                className="flex flex-col flex-grow cursor-pointer"
            >
                <p dangerouslySetInnerHTML={{ __html: description }}></p>

                <div className="flex-grow" />
                    <div>
                        <hr className="text-gray-400 w-full mt-2 mb-2" />

                        <span className="flex justify-between">
                            <div className="flex gap-2">
                                <BiMessageAltDetail className="mt-1" size={20} />
                                <span>{taskCard.task.responseCount}</span>
                            </div>

                            <div className="flex gap-2">
                                <BsListTask className="mt-1" size={20} />
                                <span>{taskCard.task.completedSubtaskCount}/{taskCard.task.subtaskCount}</span>
                            </div>

                            <div className='flex gap-1'>
                                {taskCard.users.map((user) => (
                                    <img
                                        key={user.id}
                                        src={user.photoUrl}
                                        onError={(e) => e.currentTarget.src = defaultPhoto}
                                        alt="profile photo"
                                        className='rounded-full w-6 lg:w-8'
                                    />
                                ))}
                            </div>
                        </span>

                        <hr className="text-gray-400 w-full mt-2 mb-1" />
                    </div>

                    <div className="flex-grow" />
                        <div className="flex justify-between my-2">
                            <span className='text-emerald-500 font-semibold'>{taskCard.task.status}</span>
                            <h6 className="font-medium">{dayjs(taskCard.task.deadline).format("dddd MMMM YYYY")}</h6>
                        </div>
                    </div>

            

                {
                    canAddSubtask && 
                    <div className="flex justify-between mt-4 bottom-0">
                        <button onClick={() => handleSubtaskDialog(!subtaskDialog)}>
                            <span className="flex justify-between hover:bg-gray-200 text-gray-500 hover:text-gray-700 hover:rounded-md gap-4 py-1 px-4">
                                <IoAddOutline className="mt-1" size={18}/>
                                <h1 className='font-medium'>ADD SUBTASK</h1>
                            </span>
                        </button>
                        
                        <button onClick={() => handleDeleteDialog(!deleteDialog)}>
                            <span className="flex justify-between hover:bg-red-200 text-gray-500 hover:text-gray-700 hover:rounded-md gap-4 py-1 px-4">
                                <BiTrash className='mt-1' size={18} />
                                <h1 className="font-medium">DELTE TASK</h1>
                            </span>
                        </button>
                    </div>
                }

                {   
                    canAddSubtask && subtaskDialog && 
                    <CreateSubtaskDialog 
                        taskId={taskCard.task.id}
                        members={taskCard.users.filter((user) => user.id !== taskCard.task.authorId)}
                        onClose={handleSubtaskDialog}
                    />
                }

                {
                    deleteDialog && 
                    <DeleteDialog 
                        id={taskCard.task.id}
                        onClose={() => handleDeleteDialog(!deleteDialog)}
                        type="task"
                    />
                }
        </div>
    )
}
