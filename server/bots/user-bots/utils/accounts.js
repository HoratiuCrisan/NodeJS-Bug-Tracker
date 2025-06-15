const generateAccounts = (count = 1) => {
    const accounts = [];

    for (let i = 1; i <= count; i++ ) {
        accounts.push({
            email: `bot${i}@gmail.com`,
            password: `Bot${i}@@`,
            displayName: `Bot${i}`,
        });
    }

    return accounts;
}

const accounts = generateAccounts(50);

module.exports = accounts;