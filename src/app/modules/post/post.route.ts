import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { PostValidation } from "./post.validation";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import { PostController } from "./post.controller";

const router = Router();

router
    .route("/")
    .get(
        auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
        PostController.getWonePosts
    )

router
    .route("/one/:id")
    .get(
        auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
        PostController.aPost
    )
    .delete(
        auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
        PostController.deletePost
    )

router
    .route('/do')
    .post(
        auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
        fileUploadHandler(),
        validateRequest( PostValidation.createPostZodSchema ),
        PostController.createPost
    )
    .patch(
        auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
        fileUploadHandler(),
        validateRequest( PostValidation.updatePostZodSchema ),
        PostController.updateAPost
    )

router 
    .route("/latest")
    .get(
        auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
        PostController.lastPosts
    )

router
    .route("/favorite")
    .get(
        auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
        PostController.favorites
    )

router
    .route("/favorite/add/:id")
    .post(
        auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
        PostController.addFavorites
    )

router
    .route("/favorite/delete/:id")
    .delete(
        auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
        PostController.removeFavorites
    )

router
    .route("/delete/:id")
    .delete(
        auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
        PostController.skipPostID
    )

router
    .route("/map")
    .get(
        auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
        PostController.getPostWithCodinats
    )

export const PostRouter = router;