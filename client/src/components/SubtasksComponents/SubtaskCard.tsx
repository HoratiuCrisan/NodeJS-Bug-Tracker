import React, { useEffect, useState } from 'react'
import { Subtask } from '../../types/Tasks';
import { User } from '../../types/User';

import { MdEdit } from "react-icons/md";
import { BiTrash } from 'react-icons/bi';
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";

import defaultPicture from '../../Images/default-user-photo.svg';
import { EditSubtaskDialog } from './EditSubtaskDialog';
import { DeleteDialog } from '../DeleteDialog';


type SubtaskCardType = {
    subtask: Subtask;
    user: User | undefined;
}

export const SubtaskCard: React.FC<SubtaskCardType> = ({subtask, user}) => {
    const [editDialog, setEditDialog] = useState<boolean>(false);
    const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

    useEffect(() => {console.log(user)}, [subtask, user]);

    const handleEditDialog = (value: boolean) => {
        setEditDialog(value);
    }

    const handleDeleteDialog = (value: boolean) => {
        setDeleteDialog(value);
    }
    
    return (
        <div className="flex flex-col w-full h-full bg-white rounded-lg shadow-md hover:shadow-xl p-4">
            <p dangerouslySetInnerHTML={{ __html: subtask.description }} className="font-medium"></p>
            <span className="flex gap-2">
                <h1>Completed: </h1>
                <IoCheckmarkDoneCircleSharp 
                    className={`${subtask.done ? `text-green-500` : `text-red-500`} font-bold mx-1 mt-1`}
                    size={20}
                />
            </span>

            <div className="flex flex-grow flex-col-1"></div>
            
            <img src={user?.photoUrl ?? defaultPicture} alt="user profile" className="rounded-full w-10 h-10 my-2" />

            <div className="flex-grow"></div>

            <span className='flex justify-between gap-6 w-full font-semibold text-lg mt-4'>
                <button 
                    onClick={() => handleDeleteDialog(!deleteDialog)}
                    className="flex text-red-600 hover:bg-red-200 hover:rounded-md py-1 px-2"
                >
                    <BiTrash className="mt-1 mx-2" size={20}/> Delete
                </button>

                <button
                    onClick={() =>handleEditDialog(!editDialog)} 
                    className="flex text-green-600 hover:bg-green-200 hover:rounded-md py-1 px-2"
                >
                    <MdEdit className="mt-1 mx-2" size={20}/> Update 
                </button>
            </span>

            {editDialog && <EditSubtaskDialog onClose={handleEditDialog} subtask={subtask} user={user}/>}
            {
                deleteDialog && 
                <DeleteDialog 
                    id={subtask.id} 
                    parentId={subtask.taskId} 
                    onClose={() => handleDeleteDialog(false)} 
                    type="subtask"
                />
            }
        </div>
    )
}
