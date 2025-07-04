// netlify/functions/verify-code.js
exports.handler = async (event) => {
  const { code } = JSON.parse(event.body || '{}');
  const validCodes = ['WRITE2025', 'MCTEACH', 'MAGGIE2025'];

  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: "No code provided" })
    };
  }

  const normalizedCode = code.trim().toUpperCase();

  if (validCodes.includes(normalizedCode)) {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  }

  return {
    statusCode: 403,
    body: JSON.stringify({ success: false, message: "Invalid code" })
  };
};

