import React, { useEffect } from "react";
import { Message, MessageMedia } from "../../types/Chat"; // adjust import path
import { FaCheckDouble } from "react-icons/fa";
import { ImCheckmark } from "react-icons/im";
import { User } from "../../types/User";
import dayjs from "dayjs";
import defaultPhoto from "../../Images/default-user-photo.svg";

interface MessageProps {
  message: Message;
  currentUserId: string;
  users: Map<string, User>;
}

const baseUrl = "http://localhost:8003";

const GroupMessageComponent: React.FC<MessageProps> = ({ message, currentUserId, users }) => {
  const isCurrentUser = message.authorId === currentUserId;
  const sender = users.get(message.authorId);
  const isSeenByAll = message.unreadBy.length === 0;

  useEffect(() => {}, [message]);

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4 px-2`}>
      {!isCurrentUser && sender && (
        <div className="flex flex-col items-center mr-2">
          <img
            src={sender.photoUrl ?? defaultPhoto}
            alt={sender.displayName}
            onError={(e) => e.currentTarget.src=`${defaultPhoto}`}
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>
      )}

      <div
        className={`max-w-xs md:max-w-md lg:w-max-xl rounded-lg shadow-md px-4 ${
          isCurrentUser ? "bg-emerald-900 text-white" : "bg-slate-800 text-white"
        }`}
      >
        {!isCurrentUser && sender && (
          <div className="block font-semibold mt-1 text-sm">
            {sender.displayName}
          </div>
        )}

        {message.media && message.media.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.media.map((file, idx) => (
              <div key={idx}>
                {file.fileType.startsWith("image/") ? (
                  <img
                    src={`${baseUrl}${file.url}`}
                    alt={file.fileName}
                    className="max-h-48 rounded-lg"
                    width={"100%"}
                  />
                ) : (
                  <a
                    href={`${baseUrl}${file.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    {file.fileName}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="whitespace-pre-wrap break-words pt-4">{message.text}</div>

        <div className="flex items-center justify-end my-1 text-xs text-gray-200 gap-1">
          <span>
                {dayjs(message.timestamp).format("hh:mm A")}
            </span>
          {isCurrentUser && isSeenByAll && (
            <FaCheckDouble className="text-blue-500" title="Seen by everyone" />
          )}

          {isCurrentUser && !isSeenByAll && message.status.toLowerCase() === "sent" && (
            <ImCheckmark className="text-gray-400 font-bold" title="Sent" />
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupMessageComponent;
