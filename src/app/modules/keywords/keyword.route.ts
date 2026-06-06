import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { KeywordController } from "./keyword.controller";



const router = Router();

router
    .route("/")
    .get(
        auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
        KeywordController.keywordsForSugation
    )

export const KeywordhRouter = router