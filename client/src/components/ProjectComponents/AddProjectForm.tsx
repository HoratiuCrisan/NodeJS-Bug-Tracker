import React, { useState, useEffect } from 'react';
import Select, { MultiValue } from 'react-select';
import { customStyles, selectStyles } from '../../utils/Select-Styles';
import { useAuth } from '../../config/AuthContext'
import { getUsers } from '../../api/users';
import {createProject} from '../../api/projects';
import {User} from "../../types/User";
import { Project } from '../../types/Project'
import {ErrorDialog} from '../ErrorDialog'
import { useNavigate } from 'react-router-dom';


export const AddProjectForm = () => {
    const navigate = useNavigate()
    const {currentUser} = useAuth()
    const [error, setError] = useState<string | null>(null)
    const [isUserFetched, setIsUserFetched] = useState<boolean>(false);
    const [users, setUsers] = useState<User[]>([]);
    const [options, setOptions] = useState<{ label: string, value: string }[]>([]);
    const [selectedManager, setSelectedManager] = useState<{ label: string, value: string } | null>(null);
    const [selectedMembers, setSelectedMembers] = useState<{ label: string, value: string }[]>([]);
    const [formData, setFormData] = useState<Project | null>(null)

    let projectManager: Project

    useEffect(() => {
        const fetchUsers = async () => {
            const result = await getUsers("displayName", "asc", 10, undefined);
            if (result) {
                setUsers(result);
                setIsUserFetched(true);
            }
        };

        if (!isUserFetched) {
            fetchUsers();
        }
    }, [isUserFetched]);

    useEffect(() => {
        if (users.length > 0) {
            const userOptions = users.map((usr) => ({
                label: usr.email,
                value: usr.email
            }));
            setOptions(userOptions);
        }
    }, [users]);

    const handleManagerChange = (selectedOption: { label: string, value: string } | null) => {
        setError(null)

        if (currentUser === null || currentUser === undefined) {
            setError("Error! Unautorized user!")
            return
        }

        const creator = currentUser.displayName ? currentUser.displayName : ''

        if (!selectedOption) {
            setError("Error! The manager selected does not exist!")
            return
        }

        const user = users.find((usr) => usr.email === selectedOption.value);
        if (user) {
            setSelectedManager(selectedOption);
            // setFormData((prevFormData) => ({
            //     ...prevFormData,
            //     projectManager: user,
            //     Creator: creator,
            // }));
        }
    };

    const handleMembersChange = (selectedOptions: MultiValue<{ label: string, value: string }>) => {
        const selectedUsers = selectedOptions.map(option => users.find(user => user.email === option.value)!);
        setSelectedMembers(selectedOptions as { label: string, value: string }[]);
    //     setFormData((prevFormData) => ({
    //         ...prevFormData,
    //         Members: selectedUsers
    //     }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)

        if (!formData) {
            return;
        }

        if (formData.title.length < 10) {
            setError("Error! Please enter a project title that is at least 10 characters long!")
            return
        }

        if (formData.description.length < 20) {
            setError("Error! Please enter a project description that is at least 20 characters long!")
            return
        }

        if (formData.memberIds.length <= 0)  {
            setError("Error! Please selecte the project members!")
            return
        }

        if (!currentUser) {
            setError("Error! Unauthorized user!")
            return
        }

        const response = await createProject(formData)

        if (!response) {
            setError("Error! Failed to create project!")
            return
        }
        
        //console.log(response)
        navigate("/projects")
    }

    if (!isUserFetched) {
        return <div>Loading...</div>;
    } else {
        return (
            <div className='w-4/5 mx-auto bg-gray-50'>
                <form
                    onSubmit={handleSubmit} 
                    className='my-4 bg-white shadow-xl rounded-md p-4'
                >
                    <h1 className='text-center text-xl font-bold my-4'>
                        Create Project
                    </h1>
                    <label
                        htmlFor="ticket-title"
                        className="text-lg font-mono font-semibold"
                    >
                        Title
                        <input
                            type="text"
                            name="ticket-title"
                            id="ticket-title"
                            autoComplete="off"
                            required
                            value={formData?.title}
                            // onChange={(e) => onInputChange(e.target.value, 'Title')}
                            className="block border-gray-300 font-medium text-sm w-full border-2 rounded-md my-4 py-2 pl-2"
                        />
                    </label>

                    <label
                        htmlFor="ticket-description"
                        className="text-lg font-mono font-semibold"
                    >
                        Description
                        <input
                            type="text"
                            name="ticket-description"
                            id="ticket-description"
                            autoComplete="off"
                            required
                            value={formData?.description}
                            // onChange={(e) => onInputChange(e.target.value, 'Description')}
                            className="block border-gray-300 font-medium text-sm w-full border-2 rounded-md my-4 py-2 pl-2"
                        />
                    </label>

                    <label
                        htmlFor="project-manager"
                        className="text-lg font-mono font-semibold"
                    >
                        Project Manager
                        <div className='block my-2'>
                            <Select
                                name='project-manager'
                                id="project-manager"
                                options={options}
                                placeholder={"Select Project Manager..."}
                                required
                                value={selectedManager}
                                onChange={handleManagerChange}
                                className='block font-semibold text-sm text-black w-full rounded-md my-4'
                            />
                        </div>
                    </label>

                    <label
                        htmlFor="project-members"
                        className="text-lg font-mono font-semibold"
                    >
                        Members
                        <div className='block my-2'>
                            <Select
                                name='project-members'
                                id="project-members"
                                options={options}
                                placeholder={"Select Project Members..."}
                                isMulti
                                value={selectedMembers}
                                onChange={handleMembersChange}
                                className='block font-semibold text-sm text-black w-full rounded-md my-4'
                            />
                        </div>
                    </label>

                    <button 
                        className={`w-full ${error !== null ? 'bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-700'} rounded-md text-white font-semibold py-2 my-2`}
                        disabled={error !== null ? true : false}
                        type="submit"
                    >
                        Submit Project
                    </button>
                </form>

                {
                    error && 
                    <ErrorDialog 
                        text={error}
                        onClose={() => setError(null)}
                    />
                }
            </div>
        );
    }
};
