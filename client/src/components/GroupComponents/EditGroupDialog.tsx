import React, { useState, useRef, useEffect, useContext } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { MdEdit } from "react-icons/md";
import { GroupConversation, MessageMedia } from '../../types/Chat';
import { User } from '../../types/User';
import { getUsersData } from '../../api/users';
import { IoMdPersonAdd, IoIosRemoveCircle } from "react-icons/io";
import defaultPhoto from "../../Images/default-user-photo.svg";
import { AddUsersDialog } from '../UserComponents/AddUsersDialog';
import { UserContext } from '../../context/UserProvider';
import { useCan } from '../../hooks/useCan';
import { removeMembers, updateGroupDescription, updateGroupPhoto, updateGroupTitle, uploadGroupFiles } from '../../api/groups';
import { BiTrash } from 'react-icons/bi';
import { DeleteDialog } from '../DeleteDialog';
import dayjs from 'dayjs';

type EditGroupDialogType = {
  group: GroupConversation;
  onClose: (value: boolean) => void;
};

export const EditGroupDialog: React.FC<EditGroupDialogType> = ({ group, onClose }) => {
  const {user} = useContext(UserContext);
  const [users, setUsers] = useState<User[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string>(group.photoUrl);
  const [title, setTitle] = useState<string>(group.title);
  const [description, setDescription] = useState<string>(group.description);
  const [members, setMembers] = useState<string[]>(group.members || []);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
  const [removedMembers, setRemovedMembers] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [usersDialog, setUsersDialog] = useState<boolean>(false);
  const [groupPhoto, setGroupPhoto] = useState<File | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

  const canUpdateGroup = useCan("updateGroup", group);

  const original = {
    photoUrl: group.photoUrl,
    groupPhoto: null,
    title: group.title,
    description: group.description,
    members: group.members?.slice().sort().join(','),
    removedMembers: [],
  };

  const isDirty =
    photoUrl !== original.photoUrl ||
    groupPhoto !== original.groupPhoto ||
    title !== original.title ||
    description !== original.description ||
    members.slice().sort().join(',') !== original.members ||
    removedMembers.length !== 0;

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const response: User[] = await getUsersData(group.members);
        setUsers(response);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsersData();
  }, [group]);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGroupPhoto(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMember = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setRemovedMembers(prev => Array.from(new Set([...prev, userId])))
  };

  const handleUsersDialog = (value: boolean) => {
    setUsersDialog(value);
  }

  const handleAddedMembes = (newUserIds: string[]) => {
    setMembers(prev => Array.from(new Set([...prev, ...newUserIds])));
  }

  const handleDeleteDialog = (value: boolean) => {
    setDeleteDialog(value);
  }

  const handleSave = async () => {
    try {
      await Promise.all([
          handleGroupPhotoUpdate(),
          handleGroupTitleUpdate(),
          handleGroupDescriptionUpdate(),
          handleRemoveMembersUpdate(),
      ]);
      onClose(false);
    } catch (error) {
      console.error(error);
      return;
    }
  };

  const handleGroupPhotoUpdate = async () => {
    if (!groupPhoto) return;
    try {
      const response: MessageMedia = await uploadGroupFiles(groupPhoto);

      await updateGroupPhoto(group.id, response.url);
    } catch (error) {
      console.error(error);
      return;
    }
  }

  const handleGroupTitleUpdate = async () => {
    if (title === group.title || title.length === 0) return;

    try {
      await updateGroupTitle(group.id, title);
    } catch (error) {
      console.error(error);
      return;
    }
  }

  const handleGroupDescriptionUpdate = async () => {
    if (description === group.description || description.length === 0) return;
    try {
      await updateGroupDescription(group.id, description);
    } catch (error) {
      console.error(error);
      return;
    }
  }

  const handleRemoveMembersUpdate = async () => {
    if (removedMembers.length === 0) return;
    try {
      await removeMembers(group.id, removedMembers);
    } catch (error) {
      console.error(error);
      return;
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="w-4/5 md:w-3/5 lg:w-2/5 bg-slate-100 p-6 rounded-lg shadow-lg text-black relative">
        {/* Close Button */}
        <div className="flex w-full justify-end md:mt-28 lg:mt-0">
          <IoCloseOutline
            onClick={() => onClose(false)}
            className="bg-gray-200 rounded-full hover:bg-red-500 hover:text-white cursor-pointer"
            size={24}
          />
        </div>

        <div className="flex flex-col items-center">
          {/* Group Photo */}
          <div className="relative cursor-pointer" onClick={handlePhotoClick}>
            <img
              src={photoUrl}
              onError={(e) => e.currentTarget.src=`http://localhost:8003${photoUrl}`}
              alt="group profile"
              className="rounded-full object-cover w-32 h-32"
            />
            {canUpdateGroup && <>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <span className="absolute bottom-2 right-2 bg-white p-1 rounded-full shadow">
              <MdEdit className="text-gray-600" />
            </span> 
            </> }
          </div>

          {/* Title and Description */}
          <div className="mt-4 w-full">
            <div className="flex gap-2 items-center mb-4">
              {isEditingTitle ? (
                <input
                  type="text"
                  className="p-1 rounded w-full text-black font-medium focus:outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  autoFocus
                />
              ) : (
                <>
                  <h1 className="text-lg font-medium flex-grow">{title}</h1>
                 {canUpdateGroup && <MdEdit className="cursor-pointer" size={20} onClick={() => setIsEditingTitle(true)} />}
                </>
              )}
            </div>

            <div className="flex items-start gap-2 mt-2">
              {isEditingDescription ? (
                <textarea
                  className="p-1 rounded w-full focus:outline-none text-black"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => setIsEditingDescription(false)}
                  autoFocus
                />
              ) : (
                <>
                  <p className="flex-grow">{description}</p>
                 {canUpdateGroup && <MdEdit className="cursor-pointer" size={20} onClick={() => setIsEditingDescription(true)} />}
                </>
              )}
            </div>
          </div>

         <span className="flex justify-start items-start text-start w-full gap-4 font-semibold text-gray-500 mt-4">
              <h1>Group created at: </h1>
              <h1 className="font-medium">{`${dayjs(group.createdAt).format("D MMMM YYYY")} at ${dayjs(group.createdAt).format("h:mm A")}`}</h1>
          </span>

          {/* Member List */}
          <div className="mt-6 w-full">
            {canUpdateGroup && <button
              onClick={() => handleUsersDialog(!usersDialog)}
              className="flex items-center gap-4 my-2 hover:bg-gray-300 hover:rounded-md w-full py-1 px-2"
            >
              <span className="rounded-full bg-green-700 text-white px-2 py-1">
                <IoMdPersonAdd size={25} />
              </span>
              <h1 className="text-lg font-medium mt-1">Add member</h1>
            </button>
            }
            <h1 className="font-medium text-gray-600 my-4">{users.length} members: </h1>
            <ul className="max-h-28 lg:max-h-56 overflow-y-auto">
              {[...users].sort((a, b) => (a.id === group.admin ? -1 : b.id === group.admin ? 1 : 0)).map((nUser) => (
                <li key={nUser.id} className="flex justify-between items-center py-2 px-2">
                  <div className="flex gap-4 font-semibold items-center">
                    <img src={nUser.photoUrl ?? defaultPhoto} alt="profile" className="rounded-full w-10 h-10" onError={(e) => e.currentTarget.src=`${defaultPhoto}`}/>
                    <span>{nUser.displayName}</span>
                  </div>
                  {nUser.id === group.admin ? (
                    <span className="text-xs text-rose-600 font-semibold px-2 py-1 border-2 border-rose-500 rounded">
                      Admin
                    </span>
                  ) : (
                    canUpdateGroup && (
                      <button
                        onClick={() => handleRemoveMember(nUser.id)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        <IoIosRemoveCircle size={25} />
                      </button>
                    )
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {
          canUpdateGroup && 
          <div className="w-full text-rose-600 font-semibold mt-2">
            <button
              onClick={() => handleDeleteDialog(!deleteDialog)} 
              className="flex w-full md:w-2/5 xl:w-1/5 hover:bg-rose-200 hover:rounded-md mx-auto items-center text-center p-2 gap-4"
            >
              <BiTrash />
              Delete group
            </button>
          </div>
        }

        {/* Save Button */}
        {isDirty && (
          <div className="mt-6 items-end text-end">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {deleteDialog && <DeleteDialog id={group.id} onClose={handleDeleteDialog} type="group"/>}

      {canUpdateGroup && usersDialog && <AddUsersDialog groupId={group.id} existingUsers={users.map((user) => user.id)} onClose={handleUsersDialog} handleNewMembers={handleAddedMembes}/>}
    </div>
  );
};
