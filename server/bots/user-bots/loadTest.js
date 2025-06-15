const accounts = require("./utils/accounts");
const { getIdToken, createAccount, getAccountId } = require("./config/firebase");
const { default: axios } = require("axios");
const env = require("dotenv");
const { getIds, getRandomMembers } = require("./utils/generateIds");
env.config();

const api = process.env.API;
const tickets_api = process.env.TICKETS_API;
const projects_api = process.env.PROJECTS_API;
const tasks_api = process.env.TASKS_API;

async function runConnectBot(account) {
    const token = await getIdToken(account.email, account.password);

    const start = performance.now();

    try {
        await axios.post(`${api}/login`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const end = performance.now();
        return { success: true, duration: end - start};
    } catch (error) {
        const end = performance.now();
        return {
            success: false,
            duration: end - start,
            error: error.message
        };
    }
}

async function runCreateBot(account) {
    const start = performance.now();

    try {
        const user = await createAccount(account);

        const token = await getIdToken(account.email, account.password);

        await axios.post(`${api}/`, {userId: user.uid, displayName: user.displayName, email: user.email, photoUrl: user.photoURL ?? "random url"}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const end = performance.now();
        return {success: true, duration: end - start};
    }  catch (error) {
        const end = performance.now();
        return {
            success: false,
            duration: end - start,
            error: error.message,
        };
    }
}

async function updateBotRole(account) {
    const start = performance.now();

    try {
        const id = await getAccountId(account);

        await axios.put(`${api}/role/${id}`, {role: "admin", userEmail: account.email}, {
            headers: {
                Authorization: `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjU5MWYxNWRlZTg0OTUzNjZjOTgyZTA1MTMzYmNhOGYyNDg5ZWFjNzIiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSG9yYXRpdSBDcmlzYW4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS0pEQkU0M0EtNUpPZGdaVXdjX0Nld1JCYlQtc3RQakszOUZXUDEzYmpSNlRFQmlRPXM5Ni1jIiwicm9sZSI6ImFkbWluIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2ZpcnN0LXJlYWN0LXByb2plY3QtZDQ5ZmIiLCJhdWQiOiJmaXJzdC1yZWFjdC1wcm9qZWN0LWQ0OWZiIiwiYXV0aF90aW1lIjoxNzQ3MDY0ODg1LCJ1c2VyX2lkIjoiM1JCYUhHT2s1RGhWcnVLQmNHNE1WZXdzc2wyMyIsInN1YiI6IjNSQmFIR09rNURoVnJ1S0JjRzRNVmV3c3NsMjMiLCJpYXQiOjE3NDcwNjQ4ODYsImV4cCI6MTc0NzA2ODQ4NiwiZW1haWwiOiJob3JhdGl1LmNyaXNhbjAxQGUtdXZ0LnJvIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMTUyOTU3MzUxMzY4Mzc1NzI5MTQiXSwiZW1haWwiOlsiaG9yYXRpdS5jcmlzYW4wMUBlLXV2dC5ybyJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.LmfB3iubFK31kkvdVF9YrgQ8zPb_oeOYGLcVNGWliohfLI8lGMJVaLt2tKlTjaSzqGtiix91y6xyUI3rvvuVKELzZnF08CNNF0vnW9MNXeVeLTRQhgchnKVE25dg-pb-KRslmsC7jDrQoD-_AuTxsescOzTRbjgD88q-9v7d5w_q37hzAP4lqIVZGO7Diw4SXUxTng4e72qk4cZ1Z68HlfIbCJ9mpJrOtdG6tqph2LWreHc4R_q5qiiMj7CiyiyTtRoeKuX7IfcBEJk57pTMhLzyEQ9VfOz5cFElMwZVjrB6Ptz1EBGngIew0ZIhc3xs1OeoMYScq60XQefz02qoxg`
            },
        });

        const end = performance.now();
        return {success: true, duration: end - start};
    } catch (error) {
        const end = performance.now();
        return {
            success: false,
            duration: end - start,
            error: error.message,
        };
    }
}

async function runCreateTicket(account) {
    const start = performance.now();

    try {
        const token = await getIdToken(account.email, account.password);

        const data = {
            title: `${account.displayName} test ticket`,
            description: `${account.displayName} test ticket description`,
            priority: "high",
            type: "bug",
            deadline: Date.now() + 24 * 3600 * 1000,
        };

        const response = await axios.post(`${tickets_api}/`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const end = performance.now();
        return {success: true, duration: end - start, ticketId: response.data.id};
    } catch (error) {
        const end = performance.now();
        return {
            success: false,
            duration: end - start,
            error: error.resposne?.data?.message || error.message,
        };
    }
}

async function runCreateProject(account) {
    const start = performance.now();
    const { idMap, uidList } = await getIds(accounts);

    
    try {
        const token = await getIdToken(account.email, account.password);

        const id = await getAccountId(account);

        const data = {
            title: `${account.displayName} test project`,
            description: `${account.displayName} test project description`,
            projectManagerId: id,
            members: getRandomMembers(uidList, id),
        }

        // console.log(data.projectManagerId, data.members)

        const repponse = await axios.post(`${projects_api}/`, {title: data.title, description: data.description, projectManagerId: data.projectManagerId, memberIds: data.members}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const end = performance.now();
        return {success: true, duration: end - start};
    }  catch (error) {
        const end = performance.now();
        return {
            success: false,
            duration: end - start, 
            error: error.message,
        };
    }
}

async function runCreateTask(account) {
    const start = performance.now();
    
    try {
        const id = await getAccountId(account);

        const token = await getIdToken(account.email, account.password);
        
        const data = {
            description: `${account.displayName} subtask inside task ${"0851f446-8824-4529-9b88-0aa4cb411bbf"}`,
            handlerId: id,
        };

        await axios.post(`${tasks_api}/0851f446-8824-4529-9b88-0aa4cb411bbf`, {handlerId: data.handlerId, description: data.description}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const end = performance.now();
        return {success: true, duration: end - start};
    } catch (error) {
        const end = performance.now();
        return {
            success: false,
            duration: end - start,
            error: error.message,
        };
    }
}

async function runTest() {
    const globalStart = performance.now();
    const bots = accounts.map((acc) => runCreateTask(acc));
    const results = await Promise.all(bots);

    const globalEnd = performance.now();
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    const durations = results.map(r => r.duration);
    const avg = (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2);
    const min = Math.min(...durations).toFixed(2);
    const max = Math.max(...durations).toFixed(2);

    console.log("\n--- Load Test Report ---");
    console.log(`Success: ${successCount}`);
    console.log(`Failed:  ${failCount}`);
    console.log(`Total Time: ${(globalEnd - globalStart).toFixed(2)} ms`);
    console.log(`Min: ${min} ms`);
    console.log(`Max: ${max} ms`);
    console.log(`Avg: ${avg} ms`);

    if (failCount > 0) {
        console.log("\nErrors:");
        results.filter(r => !r.success).slice(0, 5).forEach(r => {
        console.log(`Bot ${r.id}: ${r.error}`);
        });
    }
}

runTest();