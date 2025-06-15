import React, { useEffect, useState } from 'react'
import { Project } from '../../types/Project'
import { User } from '../../types/User'
import defaultPhoto from "../../Images/default-user-photo.svg";
import { stripHtml } from '../../utils/htmlStrip';
import dayjs from 'dayjs';

    type ProjectCardType = {
        manager: User | undefined;
        data: Project;
        members: (User | undefined)[];
    }

    export const ProjectCard: React.FC<ProjectCardType> = ({data, manager, members}) => {
        const [description, setDescription] = useState<string>("");
        
        useEffect(() => {
            const truncedDescription = stripHtml(data.description, 100);

            setDescription(truncedDescription);
        }, [manager]);

        return (
            <div className='flex flex-col w-full h-76 md:h-64 lg:h-56 bg-white border border-gray-400 shadow-2xl hover:border-2 hover:border-gray-500 rounded-lg cursor-pointer p-4'>
                <h1 className='font-semibold mb-2'>{data.title}</h1>
                <p dangerouslySetInnerHTML={{ __html: description }}></p>
                <h1 className='text-blue-800 font-medium my-2'>
                    {dayjs(data.createdAt).format("DD MMM YYYY")}
                </h1>

                <div className="flex flex-grow">

                </div>

                <div className="relative bottom-0 flex gap-1">
                    <img 
                        src={manager?.photoUrl ?? defaultPhoto} 
                        alt="manager profile" 
                        title={manager?.email}
                        onError={(e) => e.currentTarget.src=`${defaultPhoto}`}
                        className="rounded-full w-10 mt-4 border-2 border-black transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:scale-105"
                    />

                    {
                        members.slice(0, 5).map((member, index) => member && (
                            <img 
                                key={member.id}
                                src={member.photoUrl ?? defaultPhoto} 
                                title={member.email}
                                onError={(e) => e.currentTarget.src=`${defaultPhoto}`}
                                alt="member" 
                                className={`rounded-full w-10 mt-4 border-2 border-black -ml-4 z-${9 - index} transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:scale-105`} 
                            />
                        ))
                    }

                    {members.length > 5 && (
                        <div className="w-10 h-10 -ml-3 mt-4 rounded-full bg-gray-300 text-sm font-medium flex items-center justify-center border-2 border-black z-0">
                            +{members.length - 5}
                        </div>
                    )}
                </div>
            </div>
        )
    }
