import { Router } from 'express';
import { getUser, login, refreshToken, register } from '../controllers/auth.controllers.js';
import { protect } from '../middleware/auth.middleware.js'

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refreshToken);
authRouter.get("/getUser", protect ,getUser);

export default authRouter;
