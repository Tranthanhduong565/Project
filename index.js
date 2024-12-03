const http = require("http");
const { spawn } = require("child_process");
const log = require('./src/log'); 

// Tạo một server đơn giản
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head>
        <title>Bot Server</title>
      </head>
      <body>
        <h1>Hii 🖖</h1>
        <p>Welcome to the bot server. Đây là một server đơn giản trả về HTML cho tất cả các route.</p>
        <p>Đường dẫn /api hay bất kỳ đường dẫn nào khác cũng trả về trang này.</p>
      </body>
    </html>
  `);
});

server.listen(process.env.PORT || 3000, () => {
  log("Đang mở server bot", "[ START ]");
});

// Biến kiểm soát số lần khởi động lại
let restartCount = 0;
const MAX_RESTARTS = 5;

// Hàm khởi động bot
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
