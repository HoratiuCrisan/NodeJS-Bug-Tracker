import React, { useEffect } from 'react';
import { Message } from '../../types/Chat';
import { FaCheckDouble } from 'react-icons/fa';
import { ImCheckmark } from "react-icons/im";
import dayjs from 'dayjs';

type ChatMessageComponentType = {
	message: Message;
	currentUserId: string;
}

const baseUrl = "http://localhost:8003";

const ChatMessageComponent: React.FC<ChatMessageComponentType> = ({message, currentUserId}) => {
	const isCurrentUser = message.authorId === currentUserId;
	const isSeenByAll = message.unreadBy.length === 0;

	useEffect(() => {console.log(message)}, [message]);

    return (
      <div className={`flex ${isCurrentUser ? `justify-end` : `justify-start`} mb-4 px-2`}>
		<div className={`max-w-xs md:max-w-md lg:w-max-xl rounded-lg shadow-md px-4 text-white ${
			isCurrentUser ? `bg-emerald-900` : `bg-slate-800`
		}`}>
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

			<div className="whitespace-pre-wrap break-words pt-4">
				{message.text}
			</div>

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

export default ChatMessageComponent;
