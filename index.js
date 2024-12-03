const http = require("http");
const { spawn } = require("child_process");
const log = require('./src/log'); 
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

// Hàm khởi động bot
function startBot(message = "Đang khởi động...") {
  log(message, "[ START ]");

  const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "main.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  child.on("close", (codeExit) => {
    if (codeExit === 1) {
      log("Đã có lỗi xảy ra", "[ START-ERROR ]");
      process.exit(1);
    } else if (codeExit === 2) {
      log("Khởi động lại sau 5 giây...", "[ START ]");
      setTimeout(() => startBot("Đang khởi động lại...", "[ START ]"), 5000);
    } else {
      log("Hoàn thành quá trình khởi động", "[ START ]");
    }
  });

  child.on("error", (error) => {
    log(`Lỗi: ${error.message}`, "[ START-ERROR ]");
    process.exit(1);
  });
}

startBot();
