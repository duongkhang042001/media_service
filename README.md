# upload-server

- Nhận upload request stream lưu disk
- Task ngầm backup data lên google drive
- Hỗ trợ url xử lý ảnh đã upload
- Tự động download và sử dụng cloud file nếu mất local file (không hỗ trợ đồng bộ khi đổi tài khoản google với db cũ)

## Sử dụng

- checkout project và `npm install`
- tạo file config.prod.local.js với nội dung

```javascript
module.exports = {
  host: "127.0.0.1",
  port: 8005,

  storageDir: "data",

  clientId: "",
  clientSecret: "",

  uiUsers: [
    { username: string, password: string }, //Change username, password login
  ],

  database: {
    dbName: "db.sqlite3",
    type: "sqlite",
    pool: {
      afterCreate: (conn, cb) => {
        conn.run("PRAGMA journal_mode = DELETE; PRAGMA foreign_keys = ON", cb); //DELETE or VAL
      },
    },
  },

  // CORS option see https://github.com/fastify/fastify-cors#options
  cors: {
    origin: true,
    credentials: true,
    exposedHeaders: ["Content-Disposition"],
  },

  // BUSBOY options see https://github.com/mscdex/busboy#busboy-methods
  uploadLimits: {
    fields: 0, // Max number of non-file fields (Default: Infinity).
    fileSize: 300 * 1024 * 1024, // For multipart forms, the max file size (in bytes) (Default: Infinity).
    headerPairs: 100, // Max number of header key=>value pairs
  },
};
```

- nếu chưa có file `token.json` tức chưa kết nối google acc thì chạy `npm run auth`
- `npm run build`
- `npm run start`

### Hoạt động

- upload bằng cách `POST` `multipart/formdata` vào path `/upload`
  - data trả về sẽ có dạng
  ```json
  {
    "id": "dr8BNvn0q",
    "name": "anh-test.jpg",
    "size": 100547,
    "mimeType": "image/jpeg",
    "createTime": "2020-07-07T16:36:31.179Z",
    "updateTime": "2020-07-07T16:36:31.179Z"
  }
  ```
- truy cập file bằng path `file/:fileId` ví dụ `/file/dr8BNvn0q` sẽ trả về file gốc
- để truy cập file có chuyển đổi sài đường dẫn `/file/:fileId/:format` ví dụ `/file/dr8BNvn0q/h200-w210` các format cách nhau bằng dấu `-`
- Các format hiện tại:
  - `s200`: resize chiều lớn nhất của ảnh về 200px chiều còn lại theo tỉ lệ
  - `w200`: resize chiều rộng về 200px chiều cao cũng theo tỉ lệ
  - `h200`: resize chiều cao về 200px chiều rộng cũng theo tỉ lệ
  - nếu cùng có `w` va `h` thì cắt ảnh theo kích thước được yêu cầu hiện tại sài kiểu `cover`

### Các config chính

- `host` `port`
- `storageDir`:`string` thư mục lưu file upload
- `clientId` `clientSecret` là credential của 1 google project có enable drive api,
  - cách thay credential khác:
    - download `credentials.json` từ google ghi đè file của project
    - xóa `token.json` nếu có
    - `npm run auth` để tạo lại `token.json`
      \*Something went wrong installing the "sharp" module Cannot find module '../build/Release/sharp.node: `npm install sharp --save`

### Create Database Sqlite

- npx mikro-orm migration:up # Migrate up to the latest version

### Requirement

NodeJS version support: v14.21.1
