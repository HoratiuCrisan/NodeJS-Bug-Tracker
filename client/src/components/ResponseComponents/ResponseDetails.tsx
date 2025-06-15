import React, { useState } from 'react';
import { User } from '../../types/User';
import { Response } from '../../types/Tasks';

import { FaRegEdit } from "react-icons/fa";
import { BiTrash } from 'react-icons/bi';

import defaultPicture from '../../Images/default-user-photo.svg';
import { DeleteDialog } from '../DeleteDialog';
import { EditResponse } from './EditResponse';
import dayjs from 'dayjs';

type ResponseDetailsType = {
    author: User | undefined;
    response: Response;
}

export const ResponseDetails: React.FC<ResponseDetailsType> = ({author, response}) => {
    const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
    const [editDialog, setEditDialog] = useState<boolean>(false);

    const handleDeleteDialog = (value: boolean) => {
        setDeleteDialog(value);
    }

    const handleEditDialog = (value: boolean) => {
        setEditDialog(value);
    }

    return (
        <div className="block lg:flex justify-between hover:bg-gray-200 hover:rounded-md mb-4 p-2">
            <div className='flex items-start justify-start mb-4 lg:mb-0'> 
                <img
                    src={author?.photoUrl ?? defaultPicture}
                    alt="author"
                    className="rounded-full w-10 h-10 mr-3 mt-1"
                />
                <div>
                    <h6 className="font-medium">{author?.displayName ?? 'Unknown'}</h6>
                    <p  dangerouslySetInnerHTML={{ __html: response.message }} className="text-sm"></p>
                </div>
            </div>

            <span className="text-sm font-semibold">
                {dayjs(response.timestamp).format("DD/MM/YYYY hh:mm A")}
                <hr className="hidden lg:block border border-gray-200 w-full"/>

                <span className="flex justify-end text-lg gap-2 my-2">
                    <button
                        onClick={() => handleEditDialog(!editDialog)} 
                        className="border-2 rounded-md border-green-600 text-green-600 hover:bg-green-600 hover:text-white p-1"
                    >
                        <FaRegEdit />
                    </button>
                    <button
                        onClick={() => handleDeleteDialog(!deleteDialog)} 
                        className="border-2 rounded-md border-red-600 text-red-600 hover:bg-red-600 hover:text-white p-1"
                    >
                        <BiTrash />
                    </button>
                </span>
            </span>

            {deleteDialog && <DeleteDialog onClose={() => handleDeleteDialog(false)} id={response.id} parentId={response.taskId} type="response"/>}
            {editDialog && <EditResponse onClose={() => handleEditDialog(false)} response={response}/>}
        </div>
    )
}
