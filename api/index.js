import { createApp } from "../src/app.js";
import { connectDB } from "../src/config/db.js";

let appPromise;

async function init() {
  const collections = await connectDB({ runSetup: false });
  return createApp(collections);
}

export default async function handler(req, res) {
  try {
    if (!appPromise) appPromise = init();
    const app = await appPromise;
    return app(req, res);
  } catch (error) {
    appPromise = undefined; // porer request e abar try korbe
    console.error("Init failed:", error);
    return res.status(500).json({
      success: false,
      message: "Server initialization failed.",
    });
  }
}
