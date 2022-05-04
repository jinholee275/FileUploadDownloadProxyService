const fs = require("fs");
const ftp = require("basic-ftp");
const request = require("request");

const dotenv = require("dotenv");
dotenv.config();

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function removeLocalFile(path) {
  fs.access(path, fs.constants.F_OK, (accessError) => {
    if (accessError) return;
    fs.unlink(path, (removeError) =>
      removeError ? console.error(`Failed : ${removeError}`) : ""
    );
  });
}

exports.upload = async (req, res) => {
  console.log(req.file);

  const client = new ftp.Client();
  client.ftp.verbose = false;

  await client.access({
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASS,
    port: process.env.FTP_PORT,
  });

  await client
    .uploadFrom(
      req.file.path,
      `${process.env.FTP_ROOT}/${req.file.originalname}`
    )
    .then((result) => console.log(`Success :`, result))
    .catch((error) => console.error(`Failed : `, error));

  client.close();

  removeLocalFile(req.file.path);

  return res.status(200).json({
    status: "success",
  });
};

exports.download = async (req, res) => {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  await client.access({
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASS,
    port: process.env.FTP_PORT,
  });

  const fileExt = req.body.path.split(".").pop();
  const filename = uuidv4() + (fileExt ? `.${fileExt}` : "");
  const filePath = `${process.env.SERVICE_TEMP_DIR}/${filename}`;

  await client.downloadTo(
    filePath,
    `${process.env.FTP_ROOT}/${decodeURI(req.body.path)}`
  );

  client.close();

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error(`Failed : `, err);
    }
    removeLocalFile(filePath);
  });
};

// HTTP 로 다운로드 받을 경우
// exports.download = (req, res) => {
//   const url = `${process.env.FS_PROTOCOL}://${process.env.FS_HOST}/${process.env.FS_ROOT}/${req.body.path}`;
//   return request(url).pipe(res);
// };
