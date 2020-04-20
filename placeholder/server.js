const express = require("express");
const fileUpload = require("express-fileupload");
const Router = express.Router();
var bodyParser = require("body-parser");
const app = express();
const path = require("path");
app.use(
  fileUpload({
    createParentPath: true
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const fileUploader = Router.post("/", async (req, res, next) => {
  if (!req.files || req.files === null || Object.keys(req.files) === 0) {
    return res.status(400).json({ mes: "No file uploaded", type: "error" });
  }
  const item = req.files;
  let filePath = [];
  let filename = [];

  let res_promises = Object.values(item).map(
    file =>
      new Promise((resolve, reject) => {
        if (
          file.mimetype !== "image/png" &&
          file.mimetype !== "image/jpeg" &&
          file.mimetype !== "image/jpg"
        ) {
          return res.status(400).json({
            mes: "Invalid File Type please check your file....",
            type: "error"
          });
        } else {
          const path = `${__dirname}/client/build/uploads/${Date.now() +
            file.name}`;
          file.mv(path, err => {
            if (err) {
              reject(res.status(500).send(err));
            } else {
              resolve(filePath.push(`/uploads/${path.split("/uploads/")[1]}`));
              resolve(filename.push(file.name));
            }
          });
        }
      })
  );

  Promise.all(res_promises)
    .then(result =>
      res.json({
        fileName: filename,
        filePath: filePath
      })
    )
    .catch(error => {
      throw error;
    });
});

app.use("/upload", fileUploader);

app.use(express.static(path.join(__dirname, "client/build")));
const port = process.env.PORT || 9000;
app.listen(port, () => console.log("server is runing"));

/*
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const Router = express.Router();
const app = express();
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${__dirname}/client/public/uploads/`);
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + file.originalname);
  }
});

const upload = multer({
  storage: storage
});

const fileUploader = Router.post(
  "/",
  upload.single("file"),
  async (req, res, next) => {
    if (req.file === null || req.file === undefined) {
      res.status(404).json({ mes: "File not Exists" });
    }

    try {
      res.send({ mes: "File uploaded" });
    } catch (err) {
      res.status(500).json({ mes: "Sever Error 5000 " });
    }
  }
);

app.use("/upload", fileUploader);

app.listen("9000", () => console.log("server is runing"));
*/
