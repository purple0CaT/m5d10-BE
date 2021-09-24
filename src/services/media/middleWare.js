import createHttpError from "http-errors";
import { body } from "express-validator";
import { getMedia, getReviews } from "../fsTools.js";

//=
export const checkId = async (req, res, next) => {
  const medias = await getMedia();
  const check = medias.some((m) => m.imdbID == req.params.mediaId);
  if (check) {
    next();
  } else {
    next(createHttpError(404, "Movie not found!"));
  }
};
// =
export const checkRevId = async (req, res, next) => {
  const reviews = await getReviews();
  const check = reviews.some((rev) => rev._id == req.params.revId);
  if (check) {
    next();
  } else {
    next(createHttpError(404, "Movie not found!"));
  }
};
//=
export const postValid = [
  body("Title").exists().notEmpty().withMessage("Title is a mandatory field!"),
  body("Type").exists().notEmpty().withMessage("Type is a mandatory field!"),
  body("Year")
    .exists()
    .isNumeric()
    .notEmpty()
    .withMessage("Year is a mandatory field!"),
];
//=
export const reviewValid = [
  body("comment")
    .exists()
    .notEmpty()
    .withMessage("Comment is a mandatory field!"),
  body("rate")
    .exists()
    .isFloat({ min: 0, max: 5 })
    .notEmpty()
    .withMessage("Rate is a mandatory field! (minimum 0, maximum 5)"),
];
