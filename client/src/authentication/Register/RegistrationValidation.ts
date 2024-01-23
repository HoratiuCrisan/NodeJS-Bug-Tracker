
const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,11}$/
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{6,24}$/

const usernameValidation = (username: string) : boolean => {
    //Username validation logic
    return USER_REGEX.test(username)
}


const passwordValidation = (password: string) : boolean => {
    return PWD_REGEX.test(password)   
}

export {usernameValidation, passwordValidation}