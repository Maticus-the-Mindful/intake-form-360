/**
 * Maticus Media 360 — Intake Form receiver
 *
 * Setup:
 *  1. Open your Google Sheet that has the headers:
 *       Timestamp | Name | Email | Phone | Company | Services Needed | Budget | Timeline | Notes
 *  2. Extensions > Apps Script. Paste this file in as Code.gs.
 *  3. Set SHEET_NAME below to the tab name (default: "Intake").
 *  4. Deploy > New deployment > Type: Web app.
 *       Execute as: Me
 *       Who has access: Anyone
 *     Copy the deployed /exec URL into the Next.js env var APPS_SCRIPT_URL.
 *  5. Each time you change this code, use Deploy > Manage deployments > edit > New version.
 */

var SHEET_NAME = 'Intake';
var HEADERS = [
  'Timestamp',
  'Name',
  'Email',
  'Phone',
  'Company',
  'Services Needed',
  'Budget',
  'Timeline',
  'Notes',
];

/**
 * Run this ONCE from the Apps Script editor (Select function: setupHeaders, then Run).
 * Creates the "Intake" tab if it doesn't exist and writes the header row.
 * Safe to re-run; it will not duplicate headers.
 */
function setupHeaders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  var range = sheet.getRange(1, 1, 1, HEADERS.length);
  range.setValues([HEADERS]);
  range.setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut({ success: false, error: 'Missing request body.' });
    }

    var data = JSON.parse(e.postData.contents);

    var name = safeStr(data.name);
    var email = safeStr(data.email);
    var phone = safeStr(data.phone);
    var company = safeStr(data.company);
    var services = safeStr(data.services); // server already joined with ", "
    var budget = safeStr(data.budget);
    var timeline = safeStr(data.timeline);
    var notes = safeStr(data.notes);

    if (!name || !email || !services || !budget || !timeline) {
      return jsonOut({ success: false, error: 'Required fields missing.' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return jsonOut({
        success: false,
        error: 'Sheet tab "' + SHEET_NAME + '" not found.',
      });
    }

    sheet.appendRow([
      new Date(),
      name,
      email,
      phone,
      company,
      services,
      budget,
      timeline,
      notes,
    ]);

    return jsonOut({ success: true });
  } catch (err) {
    return jsonOut({ success: false, error: String(err && err.message ? err.message : err) });
  }
}

function doGet() {
  return jsonOut({ success: true, message: 'Intake endpoint is live.' });
}

function safeStr(v) {
  return (v === null || v === undefined) ? '' : String(v).trim();
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
