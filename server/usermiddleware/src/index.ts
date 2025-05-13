import env from "dotenv";
env.config();

export {CustomRequest} from "./utils/customRequest";

/* Middleware functionalities */
export { verifyToken } from "./middleware/tokenMiddleware";
export { errorHandler } from "./middleware/errorHandler";
export { checkRequestError } from "./middleware/checkRequestError";
export { verifyUserRole } from "./middleware/roleMiddleware";
export { responseHandler } from "./middleware/responseHandler";
export { handleResponseSuccess } from "./utils/handleResponseSuccess";

/* Utils functionalities */
export { AppError } from "./utils/appError";
export { executeWithHandling } from "./utils/executeWithHandling";  
export { validateData } from "./utils/joiValidateData";
export { measureTime} from "./utils/measureTime";


/* Types */
export {FirebaseUser, User} from "./types/User";
