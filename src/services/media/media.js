import express from "express";
import { getMedia, getReviews, writeMedia, writeReviews } from "../fsTools.js";
import { validationResult } from "express-validator";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import uniqid from "uniqid";
import { checkId, checkRevId, postValid, reviewValid } from "./middleWare.js";
import createHttpError from "http-errors";
import axios from "axios";
import { getPdfStream } from "./pdf.js";
//=
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary, //authomatic read cloud URL
  params: {
    folder: "StriveMovieImg",
  },
});
//=
const mediaR = express.Router();

//= GET
mediaR.get("/", async (req, res, next) => {
  try {
    const medias = await getMedia();
    res.send(medias);
  } catch (err) {
    next(err);
  }
});
//= GET SEARCH
mediaR.get("/search/", async (req, res, next) => {
  try {
    let dataOmdb = [];
    const urlS = process.env.OMDBAPI;
    // =
    const medias = await getMedia();
    const srchTitle = req.query.t;
    const srchYear = req.query.y;
    const filtered = medias.filter((med) => med.Title.includes(srchTitle));
    if (filtered[0]) {
      res.send(filtered);
    } else {
      let respns = await axios.get(`${urlS}&t=${srchTitle}&y={${srchYear}}`);
      dataOmdb = respns.data;
      medias.push(dataOmdb);
      await writeMedia(medias);
      res.send([dataOmdb]);
    }
  } catch (err) {
    next(err);
  }
});
// == GET BY ID
mediaR.get("/:mediaId", checkId, async (req, res, next) => {
  try {
    const medias = await getMedia();
    const media = medias.filter((m) => m.imdbID == req.params.mediaId);
    res.status(200).send(media);
  } catch (err) {
    next(err);
  }
});
// == POST
mediaR.post("/", postValid, async (req, res, next) => {
  const errorList = validationResult(req);
  if (!errorList.isEmpty()) {
    let errors = "";
    for (let err of errorList.errors) {
      errors += `${err.msg} \n`;
    }
    next(createHttpError(400, errors));
  } else {
    try {
      const medId = uniqid();
      const medias = await getMedia();
      const newMedia = { ...req.body, imdbID: medId };
      medias.push(newMedia);
      await writeMedia(medias);
      res.send(medId);
    } catch (err) {
      next(err);
    }
  }
});
// == POST IMG
mediaR.post(
  "/:mediaId/poster",
  checkId,
  multer({
    storage: cloudinaryStorage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype != "image/jpeg" && file.mimetype != "image/png")
        cb(createHttpError(400, "Format not suported!"), false);
      else cb(null, true);
    },
  }).single("cover"),
  //=
  async (req, res, next) => {
    try {
      let urlPhoto = req.file.path;
      const medias = await getMedia();
      const index = medias.findIndex((m) => m.imdbID == req.params.mediaId);
      let updateMedia = { ...medias[index], Poster: urlPhoto };
      medias[index] = updateMedia;
      await writeMedia(medias);
      res.status(201).send("Ok!");
    } catch (err) {
      next(err);
    }
  }
);
// === PUT
mediaR.put("/:mediaId", checkId, postValid, async (req, res, next) => {
  const errorList = validationResult(req);
  if (!errorList.isEmpty()) {
    let errors = "";
    for (let err of errorList.errors) {
      errors += `${err.msg} \n`;
    }
    next(createHttpError(400, errors));
  } else {
    const medias = await getMedia();
    const index = medias.findIndex((m) => m.imdbID == req.params.mediaId);
    let updateMedia = { ...medias[index], ...req.body };
    medias[index] = updateMedia;
    await writeMedia(medias);
    res.status(200).send("Text updated!");
  }
});
mediaR.delete("/:mediaId", checkId, async (req, res, next) => {
  const medias = await getMedia();
  const filtered = medias.filter((m) => m.imdbID != req.params.mediaId);
  await writeMedia(filtered);
  res.send("Deleted!");
});
// =reviews
// == GET
mediaR.get("/:mediaId/reviews", checkId, async (req, res, next) => {
  try {
    const reviews = await getReviews();
    const review = reviews.filter((rev) => rev.elementId == req.params.mediaId);

    res.status(200).send(review);
  } catch (err) {
    next(err);
  }
});
// == POST
mediaR.post("/:mediaId/reviews", reviewValid, async (req, res, next) => {
  const errorList = validationResult(req);
  if (!errorList.isEmpty()) {
    let errors = "";
    for (let err of errorList.errors) {
      errors += `${err.msg} \n`;
    }
    next(createHttpError(400, errors));
  } else {
    try {
      const revId = uniqid();
      const reviews = await getReviews();
      const newRev = {
        ...req.body,
        elementId: req.params.mediaId,
        _id: revId,
        createdAt: new Date(),
      };
      reviews.push(newRev);
      await writeReviews(reviews);
      res.status(201).send("Added!");
    } catch (err) {
      next(err);
    }
  }
});
// DELETE
mediaR.delete("/:revId/reviews", checkRevId, async (req, res, next) => {
  try {
    const reviews = await getReviews();
    const reviewUpd = reviews.filter((rev) => rev._id == req.params.revId);
    await writeReviews(reviewUpd);
    res.status(200).send("Deleted!");
  } catch (err) {
    next(err);
  }
});
mediaR.get("/:mediaId/pdf", checkId, async (req, res, next) => {
  try {
    const medias = await getMedia();
    const reviews = await getReviews();

    const mediaF = medias.filter((med) => med.imdbID == req.params.mediaId);
    const reviewF = reviews.filter(
      (rev) => rev.elementId == req.params.mediaId
    );
    res.setHeader(
      "Content-Disposition",
      `atachment; filename=${mediaF[0].Title}.pdf`
    );
    await getPdfStream(mediaF[0], reviewF, res);
  } catch (err) {
    next(err);
  }
});
export default mediaR;
