import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { MdAttachFile } from "react-icons/md";

interface MediaFile {
  file: File;
  previewUrl: string;
  name: string;
}

interface MessageInputProps {
  onSend: (message: string, mediaFiles: File[]) => Promise<void> | void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        e.preventDefault();
        closeModal();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  // Focus trap & restore focus
  useEffect(() => {
    if (isModalOpen) {
      lastFocusedElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      lastFocusedElement.current?.focus();
    }
  }, [isModalOpen]);

  const closeModal = () => setIsModalOpen(false);

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files);

    const newMediaFiles: MediaFile[] = await Promise.all(
      selectedFiles.map(async (file) => {
        const previewUrl = await readFileAsDataURL(file);
        return {
          file,
          previewUrl,
          name: file.name,
        };
      })
    );

    setMediaFiles((prev) => [...prev, ...newMediaFiles]);
    e.target.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() && mediaFiles.length === 0) return;

    setIsSending(true);
    try {
      await onSend(message.trim(), mediaFiles.map((mf) => mf.file));
      setMessage('');
      setMediaFiles([]);
    } catch (error) {
      console.error('Send failed:', error);
    }
    setIsSending(false);
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white flex flex-col gap-3">
        

        {mediaFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {mediaFiles.slice(0, 3).map((media, index) => (
              <div key={index} className="relative w-28 rounded border overflow-hidden">
                <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
                  {media.file.type.startsWith('image') ? (
                    <img
                      src={media.previewUrl}
                      alt={media.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <video
                      src={media.previewUrl}
                      controls
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <div className="text-xs p-1 truncate text-center">{media.name}</div>
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-0 right-0 text-white bg-black bg-opacity-60 rounded-bl px-1"
                >
                  ✕
                </button>
              </div>
            ))}

            {mediaFiles.length > 3 && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="relative w-28 h-24 bg-gray-100 border rounded flex items-center justify-center text-sm font-medium hover:bg-gray-200"
                aria-haspopup="dialog"
                aria-expanded={isModalOpen}
                aria-controls="media-modal"
              >
                +{mediaFiles.length - 3} more
              </button>
            )}
          </div>
        )}

		<div className="flex gap-2 items-center">
          <input
            type="text"
            className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <label className="cursor-pointer px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 border-2 hover:border-gray-800  text-black" >
            <MdAttachFile size={20}/>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-xl disabled:opacity-50"
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>

      {/* Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          tabIndex={-1}
          ref={modalRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
            opacity-100 transition-opacity duration-300"
        >
          <div
            id="media-modal"
            className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto p-4
              transform scale-100 transition-transform duration-300"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 id="modal-title" className="text-lg font-semibold">
                All Media Files
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {mediaFiles.map((media, index) => (
                <div key={index} className="relative rounded border overflow-hidden">
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                    {media.file.type.startsWith('image') ? (
                      <img
                        src={media.previewUrl}
                        alt={media.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <video
                        src={media.previewUrl}
                        controls
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <div className="text-xs p-1 truncate text-center">{media.name}</div>
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-0 right-0 text-white bg-black bg-opacity-60 rounded-bl px-1"
                    aria-label={`Remove ${media.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageInput;
