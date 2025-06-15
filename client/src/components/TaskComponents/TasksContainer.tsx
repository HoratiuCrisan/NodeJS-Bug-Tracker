import React, { useEffect, useState } from 'react'
import { Task, TaskCard } from '../../types/Tasks'
import { getTasks } from '../../api/tasks';
import { TaskCardDetails } from './TaskCardDetails';
import { Project } from '../../types/Project';

type TasksContainerType = {
    project: Project
    limit: number;
    orderBy: string;
    orderDirection: string;
}

export const TasksContainer: React.FC<TasksContainerType> = ({project, limit, orderBy, orderDirection}) => {
    const [startAfter, setStartAfter] = useState<string | null>(null);
    const [taskCards, setTaskCards] = useState<TaskCard[]>([]);

    useEffect(() => {
    const fetchProjectTasks = async () => {
        try {
            const response: TaskCard[] = await getTasks(project.id, limit, orderBy, orderDirection, startAfter);
            
            setTaskCards(response);
        } catch (error) {
            console.error(error);
            return;
        }
    };

    fetchProjectTasks();
    }, [project.id, limit, orderBy, orderDirection, startAfter]);

    
    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4'>
            {taskCards && taskCards.map((taskCard: TaskCard, index) => (
                <TaskCardDetails
                    key={index} 
                    projectManager={project.projectManagerId}
                    taskCard={taskCard}
                />
            ))}
        </div>
    )
}
