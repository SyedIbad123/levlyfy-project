const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const transcribeAudio = async (audioPath) => {
  try {
    const audioStream = fs.createReadStream(audioPath);

    const transcription = await openai.audio.transcriptions.create({
      file: audioStream,
      model: "whisper-1",
      language: "en",
    });

    return transcription.text;
  } catch (error) {
    console.error("Whisper API error:", error);
    throw error;
  }
};

module.exports = {
  transcribeAudio,
};
