import React, { useState, useEffect } from 'react';
import { IoIosClose } from 'react-icons/io';
import { Ticket } from '../utils/types/Ticket';
import { AxiosResponse } from 'axios';
import { ErrorDialog } from './ErrorDialog';

interface Props {
  ticketId: string | undefined;
  method: (id: string, ticket: Ticket, author: string | null) => Promise<AxiosResponse<any, any> | null | undefined>;
  data: Ticket | undefined;
  author: string | null;
  type: string;
  isFetched: React.MutableRefObject<boolean>;
}

export const FilesUpload: React.FC<Props> = ({ ticketId, method, data, type, author, isFetched }) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [existingFiles, setExistingFiles] = useState<{ file: File; fileName: string }[]>(data ? data.files : []);
  const [error, setError] = useState<string | null>(null);

  const parseFileNameLength = (fileName: string) => {
    if (fileName.length < 20) return fileName;
    return fileName.slice(0, 20) + '......';
  };

  const handleFileExists = (file: File): boolean => {
    for (let i = 0; i < existingFiles.length; i++) {
      if (existingFiles[i].fileName === file.name) return true;
    }
    return false;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (!e.target.files) {
      setError('Error! Please select at least a file!');
      return;
    }

    const fileList: FileList = e.target.files;
    const newFileList = new DataTransfer();

    if (files) {
      for (let i = 0; i < files.length; i++) newFileList.items.add(files[i]);
    }

    const errorFiles: string[] = [];

    for (let i = 0; i < fileList.length; i++) {
      if (!handleFileExists(fileList[i])) newFileList.items.add(fileList[i]);
      else errorFiles.push(fileList[i].name);
    }

    if (newFileList.files.length > 0) setFiles(newFileList.files as FileList);
    else setFiles(null);

    if (errorFiles.length > 0) setError('Error! Already existing files: ' + errorFiles + '!');
  };

  const handleRemoveFile = (fileName: string) => {
    setError(null);

    if (!files) {
      setError('Error! There are no files to remove');
      return;
    }

    const newFiles: File[] = [];

    Array.from(files).forEach((file) => {
      if (file.name !== fileName) newFiles.push(file);
    });

    const newFileList = new DataTransfer();
    newFiles.forEach((file) => newFileList.items.add(file));

    if (newFiles.length === 0) setFiles(null);
    else setFiles(newFileList.files as FileList);
  };

  const handleUploadFiles = async () => {
    setError(null);

    if (!files) {
      setError('Error! Please select files to upload!');
      return;
    }

    if (!data) {
      setError('Please send items data!');
      return;
    }

    if (ticketId === undefined) {
      setError('Error! Please select an item to upload files to!');
      return;
    }

    const filesArray = [...existingFiles];

    for (let i = 0; i < files.length; i++) {
      filesArray.push({ file: files[i], fileName: files[i].name });
    }

    if (type === 'ticket') {
      const updatedTicket: Ticket = {
        id: data.id,
        title: data.title,
        authorId: data.authorId,
        description: data.description,
        deadline: data.deadline,
        handlerId: data.handlerId,
        createdAt: data.createdAt,
        closedAt: data.closedAt,
        status: data.status,
        priority: data.priority,
        type: data.type,
        response: data.response,
        files: filesArray,
        notified: data.notified,
      };

      const response = await method(ticketId, updatedTicket, author);
      if (response) {
        console.log(response.data);
        setFiles(null);
      } else {
        setError('Error! Failed to upload files!');
        return;
      }
    }

    isFetched.current = false; // This line ensures the parent component updates.
  };

  if (existingFiles === undefined) {
    return <></>;
  }

  return (
    <div className='block w-full lg:w-3/4 bg-gray-50 rounded-md shadow-lg p-2 my-8'>
      <h1 className='text-md lg:text-lg font-semibold my-4'>Files: </h1>
      {existingFiles.map((ef, index) => (
        <div key={index} className='flex justify-between border-2 border-green-700 text-green-700 rounded-md p-2 m-4 w-5/6'>
          {parseFileNameLength(ef.fileName)}
          <IoIosClose className='text-end text-xl cursor-pointer my-1' />
        </div>
      ))}

      <div className='flex flex-col justify-start items-start space-y-4 my-4'>
        <label htmlFor='file-upload' className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md cursor-pointer'>
          Add Files
        </label>

        <input type='file' id='file-upload' className='hidden' multiple onChange={handleFileChange} />

        {files && (
          <div className='flex flex-col items-start space-y-2 w-full'>
            {Array.from(files).map((file, index) => (
              <div key={index} className='flex justify-between border-2 border-green-700 text-green-700 rounded-md p-2 w-3/4'>
                <span>{parseFileNameLength(file.name)}</span>
                <IoIosClose onClick={() => handleRemoveFile(file.name)} className='text-end text-xl cursor-pointer my-1' />
              </div>
            ))}

            <button onClick={handleUploadFiles} className='justify-center items-center mx-auto bg-green-500 hover:bg-green-700 text-white rounded-md px-4 py-2'>
              Upload
            </button>
          </div>
        )}
      </div>

      {error && <ErrorDialog text={error} onClose={() => setError(null)} />}
    </div>
  );
};
