import express, { Request, Response, NextFunction } from "express";
import { router } from "./routes/index";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/", router);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
