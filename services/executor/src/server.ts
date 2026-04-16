import express from "express";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "executor" });
});

app.post("/execute", (_req, res) => {
  res.status(501).json({
    error: "尚未實作。將在 Plan 3（沙盒執行引擎）中建置。",
  });
});

app.listen(PORT, () => {
  console.log(`執行引擎服務啟動於 port ${PORT}`);
});
