import React, {useState, useEffect} from 'react';
import { getSubtasks } from '../../api/tasks';
import { Subtask } from '../../types/Tasks';
import { SubtaskCard } from './SubtaskCard';
import { User } from '../../types/User';

import { IoAdd } from "react-icons/io5";
import { CreateSubtaskDialog } from './CreateSubtaskDialog';

type SubtaskContainerType = {
    usersMap: Map<string, User>;
    taskId: string;
}

export const SubtaskContainer: React.FC<SubtaskContainerType> = ({taskId, usersMap}) => {
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [subtaskDialog, setSubtaskDialog] = useState<boolean>(false);

    useEffect(() => {
        const fetchSubtasks = async () => {
            try {
                const response: Subtask[] = await getSubtasks(taskId);

                setSubtasks(response);
            } catch (error) {
                console.error(error);
                return;
            }
        }

        if (taskId) {
            fetchSubtasks();
        }
    }, [taskId]);

    const handleSubtaskDialog = (value: boolean) => {
        setSubtaskDialog(value);
    }

    return (
        <div className='h-dvh'>
            <div className="flex justify-end items-end text-end">
                <button
                    onClick={() => handleSubtaskDialog(!subtaskDialog)} 
                    className="bg-green-600 hover:bg-green-800 text-white hover:text-gray-200 rounded-md p-2 mt-4"
                >
                    <span className='flex gap-2'>
                        <IoAdd className="mt-0.5" size={20}/> 
                        <h1>Add subtask</h1>
                    </span>
                </button>
            </div>
            {!subtasks && <h1>No subtasks currently...</h1>}

            {subtasks && <div className="w-11/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
                {subtasks.map((subtask) => (
                    <SubtaskCard 
                        key={subtask.id}
                        subtask={subtask}
                        user={usersMap.get(subtask.handlerId)}
                    />
                ))}
            </div>}

            
            {subtaskDialog && <CreateSubtaskDialog taskId={taskId} onClose={() => handleSubtaskDialog(false)} members={Array.from(usersMap.values())}/>}
        </div>
    )
}
