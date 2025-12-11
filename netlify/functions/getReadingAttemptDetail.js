// netlify/functions/getReadingAttemptDetail.js

const { getStore, connectLambda } = require("@netlify/blobs");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: "Method Not Allowed" }),
    };
  }

  try {
    // Required for Netlify Blobs v1
    connectLambda(event);
    const store = getStore("reading-attempts");

    const params = event.queryStringParameters || {};
    const rawAttemptId = (params.attemptId || "").trim();

    if (!rawAttemptId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: "Missing attemptId parameter",
        }),
      };
    }

    // Respect same scoping rules as getReadingAttempts
    const rawOwnerEmail =
      (params.ownerEmail || params.teacherEmail || params.owner || "").trim();
    const rawViewerEmail = (params.viewerEmail || "").trim();

    // ---- Look up the blob for this attemptId ----
    // Attempts are stored as:
    //   key = `session/${safeSession}/${attemptId}.json`
    // so we search for a key that ends with `/${attemptId}.json`.
    const list = await store.list();
    const entries = list.blobs || list || [];

    const suffix = `/${rawAttemptId}.json`;

    const match = entries.find((item) => {
      if (!item || !item.key) return false;
      const key = String(item.key);
      return (
        key.endsWith(suffix) ||
        key === `${rawAttemptId}.json` ||
        key === rawAttemptId
      );
    });

    if (!match) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: "Attempt not found",
        }),
      };
    }

    const data = await store.get(match.key, { type: "json" });

    if (!data) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: "Attempt data not found",
        }),
      };
    }

    // ---- Normalize ownership info (same as getReadingAttempts) ----
    const ownerEmail =
      data.ownerEmail ||
      data.teacherEmail ||
      (data.sessionInfo && data.sessionInfo.ownerEmail) ||
      (data.sessionInfo && data.sessionInfo.teacherEmail) ||
      "";

    const sharedWithEmails = Array.isArray(data.sharedWithEmails)
      ? data.sharedWithEmails
      : Array.isArray(data.sessionInfo && data.sessionInfo.sharedWithEmails)
      ? data.sessionInfo.sharedWithEmails
      : [];

    // ---- Authorization, mirroring getReadingAttempts logic ----
    if (rawViewerEmail) {
      const viewerLower = rawViewerEmail.toLowerCase();
      const ownerLower = (ownerEmail || "").toLowerCase();
      const sharedLower = sharedWithEmails.map((e) => String(e).toLowerCase());
      const hasOwnershipInfo = !!ownerLower || sharedLower.length > 0;

      // Secure behavior: if there is NO ownership info, do NOT show the attempt.
      if (!hasOwnershipInfo) {
        return {
          statusCode: 403,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: "Not authorized to view this attempt",
          }),
        };
      }

      // Allow if viewer is owner or co-teacher
      const isOwner = ownerLower === viewerLower;
      const isShared = sharedLower.includes(viewerLower);

      if (!isOwner && !isShared) {
        return {
          statusCode: 403,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: "Not authorized to view this attempt",
          }),
        };
      }
    } else if (rawOwnerEmail) {
      // Explicit owner-only filter (e.g. co-teacher dashboard using ownerEmail)
      const ownerFilterLower = rawOwnerEmail.toLowerCase();
      const ownerLower = (ownerEmail || "").toLowerCase();

      if (!ownerLower || ownerLower !== ownerFilterLower) {
        return {
          statusCode: 403,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: "Not authorized to view this attempt",
          }),
        };
      }
    } else {
      // No viewer or owner context → do not allow detail access
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: "Viewer context required to access attempt detail",
        }),
      };
    }

    // ---- Normalize detail shape for the dashboard ----
    const attemptDetail = {
      // everything from the stored attempt
      ...data,

      // ensure core fields exist / normalized
      attemptId: data.attemptId || rawAttemptId,
      sessionCode:
        data.sessionCode ||
        (data.sessionInfo && data.sessionInfo.sessionCode) ||
        "",
      classCode:
        data.classCode ||
        (data.sessionInfo && data.sessionInfo.classCode) ||
        "",
      assessmentName:
        data.assessmentName ||
        (data.sessionInfo && data.sessionInfo.assessmentName) ||
        "",
      assessmentType:
        data.assessmentType ||
        (data.sessionInfo && data.sessionInfo.assessmentType) ||
        "",
      studentName:
        data.studentName || (data.student && data.student.name) || "",

      // Front-end expects .questions; logReadingAttempt stored questionResultsArray
      questions: Array.isArray(data.questionResultsArray)
        ? data.questionResultsArray
        : Array.isArray(data.questions)
        ? data.questions
        : [],
    };

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        attempt: attemptDetail,
      }),
    };
  } catch (err) {
    console.error("[getReadingAttemptDetail] Fatal error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: err.message,
        stack: err.stack,
      }),
    };
  }
};
