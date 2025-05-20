import React, {useState, useEffect, useRef} from 'react'
import { IoCloseOutline } from 'react-icons/io5'
import { TextEditor } from '../TextEditor'
import Select, { MultiValue } from 'react-select'
import { Project } from '../../types/Project'
import { User } from '../../types/User'
import { Task } from '../../types/Tasks'
import { useAuth } from '../../config/AuthContext'
import { DatePicker } from '../DatePicker'
import { updateProject } from '../../api/projects'
import { ErrorDialog } from '../ErrorDialog'

interface Props {
  onClose: () => void
  members: User[]
  projectData: Project
  id: string | undefined
  onTaskCreation: (newTask: Task) => void
}


export const CreateTaskDialog: React.FC<Props> = ({onClose, members, projectData, id, onTaskCreation}) => {
  const {currentUser} = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [taskDescription, setTaskDescription] = useState<string>('')
  const [taskTitle, setTaskTitle] = useState<string>('')
  const [membersOptions, setMembersOptions] = useState<{label: string, value: string}[]>([])
  const [selectedMember, setSelectedMember] = useState<{ label: string, value: string }>()
  const [taskDeadline, setTaskDeadline] = useState<string>('')
  const formData = useRef<Project>({
    id: projectData.id,
    title: projectData.title,
    description: projectData.description,
    createdAt: projectData.createdAt,
    projectManagerId: projectData.projectManagerId,
    memberIds: projectData.memberIds,
    code: projectData.code
  })

  useEffect(() => {
    if (members.length > 0) {
      const usersOptions = members.map((member) => ({
        label: member.displayName,
        value: member.displayName
      }))

      setMembersOptions(usersOptions)
    }
  }, [members])

  const handleSelectedMember = (selectedOption: { label: string, value: string } | null) => {
    setError(null)

    if (!selectedOption) {
        setError("Error! The member selected does not exist!")
        return
    }

    const user = members.find((usr) => usr.displayName === selectedOption.value)

    if (!user) {
      setError("Error! The member selected does not exist")
      return
    }

    setSelectedMember(selectedOption)
}

const handleDateChange = (value: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string | number | undefined) => {
  setError(null)

  if (value === undefined) {
    setError("Error! Please select a real date!")
    return
  }

  setTaskDeadline(value.toString())
}

 

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setError(null);

  // Validation checks
  if (taskTitle.length < 0) {
      setError("Error! Please enter a title longer than 10 characters!");
      return;
  }

  if (taskDescription.length < 10) {
      setError("Error! Please enter a description longer than 20 characters!");
      return;
  }

  if (!selectedMember) {
      setError("Error! Please select a user to handle the task!");
      return;
  }

  if (!taskDeadline) {
      setError("Error! Please select a deadline for the task!");
      return;
  }

  if (currentUser === null) {
      setError("Error! Unauthorized user!");
      return;
  }

  const currentUsr = currentUser.displayName ? currentUser.displayName : '';

  const handler = members.find(member => member.displayName === selectedMember.value)



  // Create the new task
  const newTask: Task = {
      id: '',
      projectId: '',
      description: taskDescription,
      createdAt: Date.now(),
      deadline: Date.now(),
      status: 'new',
      authorId: currentUser.uid,
      handlerIds: [selectedMember.value],
      completedAt: null,
  };
  

  const response = await updateProject(formData.current, id)

  console.log(response)

  if (!response) {
    setError("Error! Project could not be updated!")
    return
  }

  onTaskCreation(newTask)

  onClose()
}


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 mt-10">
      <div className="bg-gray-50 p-4 rounded-lg shadow-lg w-2/6">
          <div className='block justify-center mx-auto w-full bg-gray-50'>
              <div className='flex w-full justify-end items-end text-end'>
                  <IoCloseOutline 
                      onClick={onClose}
                      className='bg-gray-200 rounded-full hover:bg-red-500 hover:text-white cursor-pointer'
                      size={24}
                  />
              </div>

              <h1 className='text-lg font-bold mx-auto text-center'>
                Create Task
              </h1>

              <form
                onSubmit={handleSubmit}
              >
                <label
                    htmlFor="task-title"
                    className="text-lg font-mono font-semibold"
                >
                    Title
                    <input
                        type="text"
                        name="task-title"
                        id="task-title"
                        autoComplete="off"
                        required
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        className="block border-gray-300 font-medium text-sm w-full border-2 rounded-md my-4 py-2 pl-2"
                    />
                </label>

                <label
                    htmlFor="task-description"
                    className="text-lg font-mono my-10"
                >
                    <span className='font-semibold'>Description</span>
                    <div className=''>
                      <TextEditor 
                        value={taskDescription}
                        onChange={setTaskDescription}
                        readonly={false}
                      />
                    </div>
                </label>

                <div className='my-4'>
                  <label
                      htmlFor="task-members"
                      className="text-lg font-mono font-semibold my-10"
                  >
                      Assign to:
                    <Select 
                        options={membersOptions}
                        className='text-md font-sans my-2'
                        value={selectedMember}
                        onChange={handleSelectedMember}
                    />
                  </label>
                </div>

                <label 
                    htmlFor="ticket-deadline"
                    className="text-lg font-mono font-semibold"
                >
                    Deadline
                    {/* <DatePicker 
                        deadline={taskDeadline}
                        onInputChange={handleDateChange}
                        style={"block w-full text-sm md:w-1/3 border-2 border-gray-300 focus:border-gray-800 rounded-md p-2 mb-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"}
                    /> */}
                </label>

                <button
                type="submit"
                className='w-full rounded-md bg-emerald-600 hover:bg-emerald-900 text-white my-6 p-2'
              >
                Submit Task
              </button>
              </form>

          </div>
      </div>

      {
        error &&
        <ErrorDialog 
          text={error}
          onClose={() => setError(null)}
        />
      }
  </div>
  )
}
