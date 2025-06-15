import React, { useEffect, useRef, useState } from 'react';
import { LogMessage } from '../types/Logs';
import { getLogs } from '../api/logs';
import dayjs from 'dayjs';

const LOG_TYPES = ['audit', 'info', 'error'] as const;
type LogType = typeof LOG_TYPES[number];

export const LogConsole: React.FC = () => {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<LogType>('info');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startAfter, setStartAfter] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Fetch logs when selectedType or selectedDate changes (reset pagination)
  useEffect(() => {
    const fetchInitialLogs = async () => {
      setIsLoading(true);
      setStartAfter(undefined);
      setHasMore(true);
      try {
        const formattedDate = `${selectedDate.getMonth()}-${selectedDate.getDate()}-${selectedDate.getFullYear()}`;
        const data = await getLogs(formattedDate, selectedType, 10, undefined);
        setLogs(data);
        // If less than requested, no more logs to load
        setHasMore(data.length === 10);
        // Update startAfter with last log ID if any logs fetched
        if (data.length > 0) {
          setStartAfter(data[data.length - 1].id);
        }
      } catch (err) {
        console.error('Failed to fetch logs', err);
        setLogs([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialLogs();
  }, [selectedType, selectedDate]);

  // Load more logs on demand
  const loadMoreLogs = async () => {
    if (!hasMore) return;
    setIsLoading(true);
    try {
      const formattedDate = `${selectedDate.getMonth()}-${selectedDate.getDate()}-${selectedDate.getFullYear()}`;
      const data = await getLogs(formattedDate, selectedType, 10, startAfter);
      setLogs((prev) => [...prev, ...data]);
      setHasMore(data.length === 10);
      if (data.length > 0) {
        setStartAfter(data[data.length - 1].id);
      }
    } catch (err) {
      console.error('Failed to load more logs', err);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const getColorClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'error':
        return 'text-red-400';
      case 'info':
        return 'text-blue-400';
      case 'audit':
        return 'text-green-400';
      default:
        return 'text-white';
    }
  };

  const renderLogEntry = (log: LogMessage) => (
    <div key={log.id} className={`${getColorClass(log.type)} mb-4`}>
      <div>
        <span className="text-gray-500">
          [{dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}]
        </span>{' '}
        <span className="uppercase">{log.type}</span> - {log.message}
      </div>

      <div className="text-gray-500 ml-4">
        {log.requestDetails.method} {log.requestDetails.endpoint} → {log.requestDetails.status} (
        {log.requestDetails.duration}ms)
      </div>

      <div className="text-gray-500 ml-4">
        User: {log.user.displayName} ({log.user.email}) - {log.user.role}
      </div>
    </div>
  );

  return (
    <div className="px-4 lg:px-0 w-full max-w-5xl mx-auto">
      {/* Date Picker and Log Type Tabs */}
      <div className="flex flex-wrap items-center gap-4 mb-4 mt-4">
        {/* Date picker */}
        <label className="flex flex-col text-gray-700 text-sm">
          Select Date:
          <input
            type="date"
            className="mt-1 px-2 py-1 rounded border border-gray-300 text-sm"
            value={dayjs(selectedDate).format('YYYY-MM-DD')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
        </label>

        {/* Log type buttons */}
        <div className="flex space-x-2">
          {LOG_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded transition-all duration-150 ${
                selectedType === type
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Log Console */}
      <div
        ref={consoleRef}
        className="h-[400px] md:h-[600px] lg:h-[700px] bg-black text-white rounded-lg p-4 overflow-y-auto font-mono text-sm"
      >
        {isLoading && logs.length === 0 ? (
          <div className="text-gray-400">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-gray-400">
            No logs of type "{selectedType}" on {selectedDate.getMonth()}-
            {selectedDate.getDate()}-{selectedDate.getFullYear()}
          </div>
        ) : (
          logs.map(renderLogEntry)
        )}
      </div>

      {/* Load More Button */}
      <div className="flex justify-center mt-4">
        {hasMore ? (
          <button
            onClick={loadMoreLogs}
            disabled={isLoading}
            className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        ) : (
          <div className="text-gray-500">No more logs to load.</div>
        )}
      </div>
    </div>
  );
};
