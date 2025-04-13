const {
  successResponse,
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
} = require("./baseController.js");
const { transcribeAudio } = require("../services/whisperService");
const processCall = require("../jobs/processCall.js");
const CallRepo = require("../repos/CallRepo.js");
const path = require("path");
const fs = require("fs");
const { decryptFile } = require("../utils/fileEncryption.js");

uploadCall = async (req, res) => {
  const userId = req.user.id;
  const { callNotes } = req?.body;
  const file = req.file;

  if (!file) {
    return validationErrorResponse(res, "Please upload an audio file");
  }

  const newCall = await CallRepo.createCall({
    userId,
    status: "pending",
    audioUrl: file.path,
    callDate: new Date(),
    callNotes,
  });

  setImmediate(() => processCall(newCall, file));

  return successResponse(res, newCall, "Call uploaded successfully");
};

reanalyzeCall = async (req, res) => {
  const callId = req.params.id;

  const call = await CallRepo.findByPk(callId);
  if (!call) {
    return errorResponse(res, "Call not found", 400);
  }

  if (!["failed", "pending"].includes(call.status)) {
    return errorResponse(
      res,
      "Call is already being processed or has been completed",
      400
    );
  }

  await call.update({ status: "processing" });

  setImmediate(() => processCall(call));

  return successResponse(res, call, "Call reanalysis started successfully");
};

downloadDecryptedAudio = async (req, res) => {
  const { id } = req.params;
  const call = await CallRepo.findByPk(id);
  if (!call) return errorResponse(res, "Call not found", 404);

  // 1) Ensure temp folder exists
  const tempDir = path.resolve("temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  // 2) Define paths
  const encryptedPath = path.resolve(call.audioUrl);
  const decryptedName = `dec-${Date.now()}-${path.basename(call.audioUrl)}`;
  const decryptedPath = path.join(tempDir, decryptedName);

  // 3) Decrypt (sync version)
  try {
    await decryptFile(encryptedPath, decryptedPath);
  } catch (err) {
    console.error("Decrypt error:", err);
    return serverErrorResponse(res, "Could not decrypt file", 500);
  }

  // 4) Verify file exists
  if (!fs.existsSync(decryptedPath)) {
    return serverErrorResponse(res, "Decrypted file not found", 500);
  }

  // 5) Send it
  res.download(decryptedPath, decryptedName, (err) => {
    if (err) {
      console.error("Download error:", err);
      return serverErrorResponse(res, "Could not send file", 500);
    }
    // clean up
    fs.unlinkSync(decryptedPath);
  });
};

module.exports = {
  uploadCall,
  reanalyzeCall,
  downloadDecryptedAudio,
};
