exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  const { code } = JSON.parse(event.body);
  const normalizedCode = code.trim().toUpperCase();

  const argumentativeCodes = ["WRITE2025", "MCTEACH", "MAGGIE2025"];
  const opinionCodes = ["OPINION2025", "GRADE3", "OP2025"];

  if (argumentativeCodes.includes(normalizedCode)) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        redirectPath: "./argumentative-organizer/index.html",
      }),
    };
  }

  if (opinionCodes.includes(normalizedCode)) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        redirectPath: "./opinion-organizer/index.html",
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: false }),
  };
};
