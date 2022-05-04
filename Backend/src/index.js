const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fileController = require("./FileController");

const dotenv = require("dotenv");
dotenv.config();

const app = express();

//Express 4.16.0버전 부터 body-parser의 일부 기능이 익스프레스에 내장 body-parser 연결
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Test 버전으로 설정(이 설정은 모든 도메인을 허용한다는 뜻 실 서비스에 대포시 주의 :> )

app.post(
  "/api/file/upload",
  multer({ dest: `${process.env.SERVICE_TEMP_DIR}/` }).single("userfile"),
  fileController.upload
);
app.post("/api/file/download", fileController.download);

// http listen port 생성 서버 실행
app.listen(process.env.SERVICE_PORT, () =>
  console.log(`running on: http://localhost:${process.env.SERVICE_PORT}`)
);
