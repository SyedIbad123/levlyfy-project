const { transcribeAudio } = require("../services/whisperService");
const { analyzeCall } = require("../services/gptService");
const { Call, Performance } = require("../../models");
const path = require("path");
const fs = require("fs");
const { encryptFile, decryptFile } = require("../utils/fileEncryption");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const processCall = async (call, file) => {
  try {
    console.log(`Processing Call ID ${call.id}`);
    console.log(`File path: ${file.path}`);
    console.log(`File name: ${file.originalname}`);

    const encryptedFilePath = path.join(
      "uploads",
      `enc-${Date.now()}-${file.originalname}`
    );

    console.log(`Encrypting file to: ${encryptedFilePath}`);

    encryptFile(file.path, encryptedFilePath);

    fs.unlinkSync(file.path);

    // const transcript = await transcribeAudio(encryptedFilePath);
    // let analysis = null;
    // const maxRetries = 3;
    // for (let attempt = 1; attempt <= maxRetries; attempt++) {
    //   try {
    //     console.log(`🔁 GPT attempt ${attempt} for Call ID: ${call.id}`);
    //     analysis = await analyzeCall(transcript);
    //     break;
    //   } catch (err) {
    //     console.error(`GPT Error on attempt ${attempt}:`, err.message);
    //     if (attempt < maxRetries) {
    //       const wait = 1000 * attempt;
    //       console.log(`Retrying in ${wait}ms...`);
    //       await sleep(wait);
    //     } else {
    //       throw new Error("GPT analysis failed after retries");
    //     }
    //   }
    // }

    await Call.update(
      {
        audioUrl: encryptedFilePath,
        // transcript,
        // sentiment: analysis.sentiment,
        // callFeedback: analysis.feedback,
        // callNotes: analysis.notes,
        // ivKey: iv,
        status: "complete",
      },
      {
        where: { id: call.id },
      }
    );

    await Performance.create({
      userId: call.userId,
      score: "10",
      // feedback: analysis.feedback,
    });

    console.log(`Successfully analyzed Call ID ${call.id}`);
  } catch (err) {
    console.error(`Final failure for Call ID ${call.id}`, err.message);
    await Call.update({ status: "failed" }, { where: { id: call.id } });
  }
};

module.exports = processCall;
