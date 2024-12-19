const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const log = require('./src/log');

const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, 'html', 'index.html');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      log(`Lỗi khi đọc file: ${err.message}`, "[ ERROR ]");
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Đã xảy ra lỗi khi đọc trang.');
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

server.listen(process.env.PORT || 3000, () => {
  log("Đang mở server bot", "[ START ]");
});

let restartCount = 0;
const MAX_RESTARTS = 5;

function startBot(message = "Đang khởi động...") {
  log(message, "[ START ]");

  const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "main.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  child.on("close", (exitCode) => {
    if (exitCode === 1) {
      log("Đã có lỗi xảy ra, tiến trình dừng lại.", "[ ERROR ]");
      process.exit(1);
    } else if (exitCode === 2) {
      if (restartCount < MAX_RESTARTS) {
        restartCount++;
        log(`Khởi động lại sau 5 giây... (Lần thứ ${restartCount}/${MAX_RESTARTS})`, "[ RESTART ]");
        setTimeout(() => startBot("Đang khởi động lại..."), 5000);
      } else {
        log("Đạt giới hạn số lần khởi động lại. Dừng tiến trình.", "[ ERROR ]");
        process.exit(1);
      }
    } else {
      log("Hoàn thành quá trình khởi động", "[ SUCCESS ]");
    }
  });

  child.on("error", (error) => {
    log(`Lỗi: ${error.message}`, "[ ERROR ]");
    process.exit(1);
  });
}

startBot();
