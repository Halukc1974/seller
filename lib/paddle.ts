import { Paddle, Environment } from "@paddle/paddle-node-sdk";

const paddleEnv =
  process.env.PADDLE_ENVIRONMENT === "production"
    ? Environment.production
    : Environment.sandbox;

export const paddle = new Paddle(process.env.PADDLE_API_KEY || "", {
  environment: paddleEnv,
});
