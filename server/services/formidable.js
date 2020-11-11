const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const cloudinary = require("cloudinary");
const _ = require("lodash");
const env = process.env.NODE_ENV;

//-- configure cloudinary only in production
if (env === "production") {
  cloudinary.config({
    cloud_name: "xraybrain",
    api_key: "744654962837132",
    api_secret: "XsiZY4rNv1wCUrnv2jOxEpACdnU",
  });
}
function extname(fileName) {
  return fileName.slice(fileName.indexOf(".") + 1);
}

function filter(error, fileName, filters) {
  let extension = extname(fileName);

  if (!filters.includes(extension)) error.fileType = "File type not allowed";
}

module.exports = (
  options = { filters: ["jpg", "jpeg", "png"], uploadDir: "./uploads/" }
) => {
  return (req, res, next) => {
    let form = formidable.IncomingForm(); // The incoming form
    let filters = options.filters || ["jpg", "jpeg", "png"];
    let uploadDir = options.uploadDir || path.join(__dirname, "/../uploads");
    let errors = {};

    form.parse(req, (err, fields, files) => {
      let fileToUpload = files.fileToUpload;

      if (fileToUpload) {
        let fileName = fileToUpload.name;
        let tempPath = fileToUpload.path;
        //-- filter this file
        filter(errors, fileName, filters);

        //-- an error occured
        if (!_.isEmpty(errors)) {
          req.uploadStatus = { err: true, errors };
          return next();
        }

        let newFileName = `xb_${Date.now()}.${extname(fileName)}`;

        let uploadStatus = { err: null, fields };

        //-- check node ennvironment
        if (process.env.NODE_ENV === "production") {
          //-- on production use cloudinary
          cloudinary.uploader.upload(tempPath, (result) => {
            if (!result.error) {
              uploadStatus.fileName = result.secure_url;
              uploadStatus.uploadDir = result.secure_url;
              uploadStatus.env = "production";

              req.uploadStatus = uploadStatus;
              next();
            } else {
              req.uploadStatus = { err: true, msg: "Failed to upload file" };
              return next();
            }
          });
        } else {
          //-- on development use local storage

          //-- check if uploadDir exists
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
          }

          //-- read the file been uploaded
          fs.readFile(tempPath, (err, data) => {
            if (err) throw err;

            uploadDir = path.join(uploadDir, newFileName);
            fs.writeFile(uploadDir, data, (err) => {
              if (err) throw err;

              let uploadStatus = {
                err: null,
                uploadDir,
                fields,
                fileName: newFileName,
              };
              req.uploadStatus = uploadStatus;
              next();
            });
          });
        }
      } else {
        req.uploadStatus = { err: true, invalidFile: "Invalid file" };
        return next();
      }
    });
  };
};
