import { createApp } from "../src/app.js";
import { connectDB } from "../src/config/db.js";

let appPromise;

// MongoDB কানেকশন ও app একবারই তৈরি হবে (warm invocation-এ reuse হবে)
function getApp() {
  if (!appPromise) {
    appPromise = connectDB().then((collections) => createApp(collections));
  }
  return appPromise;
}

export default async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
}
