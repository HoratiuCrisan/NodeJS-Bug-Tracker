export const measureTime = async <T>(fn: () => Promise<T>, name = 'Method') => {
    const start = process.hrtime();

    try {
        const result = await fn();

        const [seconds, nanoseconds] = process.hrtime(start);
        const durationMs = Math.round((seconds * 1000) + (nanoseconds / 1e6));

        return {data: result, duration: durationMs};
    } catch (error) {
        const [seconds, nanoseconds] = process.hrtime(start);
        const durationMs = Math.round((seconds * 1000) + (nanoseconds / 1e6));

        console.error(`"${name}" failed after ${durationMs}ms `);
        throw error;
    }
}