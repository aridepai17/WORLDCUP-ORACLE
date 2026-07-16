import { Router, type IRouter } from "express";
import healthRouter from "./health";
import worldcupRouter from "./worldcup";

const router: IRouter = Router();

router.use(healthRouter);
router.use(worldcupRouter);

export default router;