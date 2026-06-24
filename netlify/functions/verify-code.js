exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  const { code } = JSON.parse(event.body);
  const normalizedCode = code.trim().toUpperCase();

  const argumentativeCodes = ["WRITE2026", "MCTEACH", "MAGGIE2026"];
  const opinionCodes = ["OPINION2026", "GRADE3", "OP2026"];

  // NEW: Reading Question-Type Trainer codes
  const readingTrainerCodes = ["READING2026", "READTRAIN"];

  if (argumentativeCodes.includes(normalizedCode)) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        redirectPath: "./argumentative-organizer-2026-2027/index.html",
      }),
    };
  }

  if (opinionCodes.includes(normalizedCode)) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        redirectPath: "./opinion-organizer-2026-2027/index.html",
      }),
    };
  }

  // NEW: Reading Trainer redirect
  if (readingTrainerCodes.includes(normalizedCode)) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        redirectPath: "./reading-practice/index.html", 
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: false }),
  };
};
