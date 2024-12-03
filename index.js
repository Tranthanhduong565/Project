const http = require("http");
const { spawn } = require("child_process");
const log = require('./src/log'); 
const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
      res.end(JSON.stringify({ message: "Hii 🖖" }));
  } else if (req.url === "/api" && req.method === "GET") {
      res.end(JSON.stringify({ message: "API response here" }));
  } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "404 Not Found" }));
  }
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
