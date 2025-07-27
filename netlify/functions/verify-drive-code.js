exports.handler = async (event) => {
  const { code } = JSON.parse(event.body || '{}');
  const normalizedCode = code?.trim().toUpperCase();

  if (!normalizedCode) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'No code provided' })
    };
  }

  // Argumentative Codes
  const argumentativeCodes = ['WRITE2025', 'MCTEACH', 'MAGGIE2025'];
  const opinionCodes = ['OPINION2025', 'GRADE3','OPTEACH'];

  let folderUrl = '';

  if (argumentativeCodes.includes(normalizedCode)) {
    folderUrl = 'https://drive.google.com/drive/folders/1_YHGrpp0HKzsFgAd_i-zHn5Aw-BbuVeD';
  } else if (opinionCodes.includes(normalizedCode)) {
    folderUrl = 'https://drive.google.com/drive/folders/1bSVPQc-JFjRrfcBrw_IzNB17p8nBI3Vw?usp=drive_link'; // replace with your real opinion folder link
  } else {
    return {
      statusCode: 403,
      body: JSON.stringify({ success: false, message: 'Invalid code' })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, folderUrl })
  };
};
