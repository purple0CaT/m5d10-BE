import PdfPrinter from "pdfmake";
import axios from "axios";
import { pipeline } from "stream";
import { promisify } from "util";
// DEF VALUES
const asyncPipeline = promisify(pipeline); // promisify is an utility which transforms a function that uses callbacks into a function that uses Promises (and so Async/Await). Pipeline is a function that works with callbacks to connect two or more streams together --> I can promisify pipeline getting back an asynchronous pipeline
const fonts = {
  Roboto: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    //   italics: "fonts/Roboto-Italic.ttf",
    //   bolditalics: "fonts/Roboto-MediumItalic.ttf",
  },
};
const printer = new PdfPrinter(fonts);
// =
// PDF STREAM
export const getPdfStream = async (media, review, res) => {
  // Fetching Post Data
  const response = await axios.get(media.Poster, {
    responseType: "arraybuffer",
  });
  // Transforming Image
  const blogCoverURLParts = media.Poster.split("/").reverse();
  const [extension, id] = blogCoverURLParts[0].split(".").reverse();
  const base64 = response.data.toString("base64");
  const base64Image = `data:image/${extension};base64,${base64}`;
  // DOCUMENT PDF CONTENT
  const docContent = {
    content: [
      {
        image: base64Image,
        width: 200,
      },
      {
        text: "\n\n",
      },
      {
        text: `${media.Title} \n\n`,
        style: "header",
      },
      {
        text: `${media.Plot} \n\n`,
        lineHeight: 2,
      },
      {
        text: "Reviews",
        style: "header",
      },
    ],
    styles: {
      header: {
        fontSize: 15,
        bold: true,
      },
    },
  };
  const options = {};
  //  CREATE / SAVE / SEND
  const pdfDoc = printer.createPdfKitDocument(docContent, options);
  pdfDoc.end();

  await asyncPipeline(pdfDoc, res);
};
