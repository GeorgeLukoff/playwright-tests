import express, { Express, Request, Response } from "express";

interface User {
  id: number;
  name: string;
  email: string;
}

let users: User[] = [];

const app: Express = express();

app.use(express.json());

app.get("/users/:id", (req: Request, res: Response) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// Mock function to set up user for testing
export const setupUser = async (user: User): Promise<void> => {
  users = [user];
};

export default app.listen(3000, () => {
  console.log("Provider running on http://localhost:3000");
});
