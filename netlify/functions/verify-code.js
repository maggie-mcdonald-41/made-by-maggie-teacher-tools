exports.handler = async (event) => {
  const { code } = JSON.parse(event.body || '{}');
  const validCodes = ['WRITE2025', 'MCTEACH', 'MAGGIE2025'];

  if (validCodes.includes(code)) {
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
