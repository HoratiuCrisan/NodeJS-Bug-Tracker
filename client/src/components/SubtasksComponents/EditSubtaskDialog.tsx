import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { Subtask, TaskCard } from '../../types/Tasks';
import { IoCloseOutline } from 'react-icons/io5';

import {
  updateSubtaskDescription,
  updateSubtaskHandler,
  updateSubtaskStatus,
  getTaskById,
} from '../../api/tasks';

import { useCan } from '../../hooks/useCan';
import { TextEditor } from '../TextEditor';
import { User } from '../../types/User';
import { useParams } from 'react-router-dom';

type EditSubtaskDialogType = {
  onClose: (value: boolean) => void;
  subtask: Subtask;
  user: User | undefined;
};

export const EditSubtaskDialog: React.FC<EditSubtaskDialogType> = ({subtask, onClose, user}) => {
	const { projectId } = useParams();

	const [description, setDescription] = useState(subtask.description);
	const [handler, setHandler] = useState<{ label: string; value: string }>({
		label: user?.email ?? 'unknown',
		value: user?.id ?? 'unknown',
	});
	const [status, setStatus] = useState<boolean>(subtask.done);
	const [members, setMembers] = useState<{ label: string; value: string }[]>([]);

	const canUpdateDescription = useCan('updateSubtaskDescription', subtask);
	const canUpdateHandler = useCan('updateSubtaskHandler', subtask);
	const canUpdateStatus = useCan('updateSubtaskStatus', subtask);

	useEffect(() => {
		const fetchTaskUsers = async (projectId: string) => {
		try {
			const task: TaskCard = await getTaskById(projectId, subtask.taskId);
			const mapped = task.users.filter((u) => u.id !== user?.id).map((user) => ({
				label: user.email,
				value: user.id,
			}));
			setMembers(mapped);
		} catch (error) {
			console.error(error);
		}
		};

		if (projectId) {
			fetchTaskUsers(projectId);
		}
	}, [projectId, subtask.taskId]);

  	const handleSubtaskUpdate = async () => {
		try {
      		await Promise.all([
				handleSubtaskDescriptionUpdate(),
				handleSubtaskHandlerUpdate(),
				handleSubtaskStatusUpdate(),
      		]);

			onClose(false);
			window.location.reload();
    	} catch (error) {
      		console.error(error);
    	}
  	};

	const handleSubtaskDescriptionUpdate = async () => {
		if (!canUpdateDescription || subtask.description === description || description === '') return;
		console.log(description)
		await updateSubtaskDescription(subtask.taskId, subtask.id, description);
	};

	const handleSubtaskHandlerUpdate = async () => {
		if (!canUpdateHandler || subtask.handlerId === handler.value) return;
		await updateSubtaskHandler(subtask.taskId, subtask.id, handler.value);
	};

	const handleSubtaskStatusUpdate = async () => {
		if (subtask.done === status) return;
		await updateSubtaskStatus(subtask.taskId, subtask.id, status);
	};

	const toggleStatus = () => {
		setStatus((prev) => !prev);
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
			<div className={`w-4/5 md:w-3/5 ${canUpdateStatus ? `lg:w-2/6` : `lg:w-3/6`} bg-gray-50 p-4 rounded-lg shadow-lg`}>
				<div className="block w-full bg-gray-50">
				<div className="flex justify-end">
					<IoCloseOutline
					onClick={() => onClose(false)}
					className="bg-gray-200 rounded-full hover:bg-red-500 hover:text-white cursor-pointer"
					size={24}
					/>
				</div>

				{
					canUpdateDescription &&
					<>
						<h1 className="text-lg font-semibold my-2">Update Subtask</h1>

						<TextEditor
							value={description}
							onChange={(value) => setDescription(value)}
							readonly={!canUpdateDescription}
							classname="my-4"
						/>

					</>
				}

				{
					canUpdateHandler &&
					<>
						<h1 className="text-lg font-semibold my-2">Handler:</h1>

						<Select
							value={handler}
							options={members}
							isDisabled={!canUpdateHandler}
							onChange={(option) => option && setHandler(option)}
						/>
					</>
				}
				

				{
					canUpdateStatus &&
					<>
						<h1 className="text-lg font-semibold my-4">Update status:</h1>
					
						<div className="flex items-center gap-3">
							<input
								type="checkbox"
								checked={status}
								onChange={() => toggleStatus()}
								className="w-5 h-5 cursor-pointer"
							/>
							<label className="text-md">
								{status ? '✅ Completed' : '⏳ In Progress'}
							</label>
						</div>
					</>
				}


				<div className="flex justify-end gap-2 mt-6">
					<button
						onClick={() => onClose(false)}
						className="bg-red-600 text-white hover:bg-red-700 rounded-md px-4 py-2"
					>
						Cancel
					</button>

					<button
						onClick={handleSubtaskUpdate}
						className="bg-green-600 text-white hover:bg-green-700 rounded-md px-4 py-2"
					>
						Submit
					</button>
				</div>
				</div>
			</div>
		</div>
	);
};
