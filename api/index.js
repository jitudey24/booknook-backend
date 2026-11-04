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


// import { createApp } from "../src/app.js";
// import { connectDB } from "../src/config/db.js";

// let appPromise;

// // Initialize MongoDB connection and Express app
// // Reuse the app during warm serverless invocations
// function getApp() {
//   if (!appPromise) {
//     appPromise = connectDB()
//       .then((collections) => createApp(collections))
//       .catch((error) => {
//         appPromise = null;
//         throw error;
//       });
//   }

//   return appPromise;
// }

// // Vercel Serverless Function Handler
// export default async function handler(req, res) {
//   try {
//     const app = await getApp();

//     return app(req, res);
//   } catch (error) {
//     console.error("Vercel Backend Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error.",
//     });
//   }
// }
