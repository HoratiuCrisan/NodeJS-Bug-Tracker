const { getAccountId } = require("../config/firebase");

function getRandomMembers(pool, excludeId, count = 3) {
    const filtered = pool.filter(uid => uid !== excludeId);
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

async function getIds(accounts) {
    const idMap = {};
    const uidList = [];

    for (const acc of accounts) {
        try {
            const id = await getAccountId(acc);

            idMap[acc.email] = id;
            uidList.push(id);
        } catch (error) {
            console.error(`Failed to get user id`, error.message);
        }
    }

    return {idMap, uidList};
}

module.exports = {
    getIds, 
    getRandomMembers,
};

