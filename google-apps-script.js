/**
 * Google Apps Script for Spin Wheel - Google Sheets Integration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Click "New Project"
 * 3. Delete the default code and paste this entire file
 * 4. Replace 'YOUR_SHEET_ID' with your actual Google Sheet ID
 * 5. Click "Deploy" > "New deployment"
 * 6. Click the gear icon and select "Web app"
 * 7. Set "Execute as" to "Me"
 * 8. Set "Who has access" to "Anyone"
 * 9. Click "Deploy"
 * 10. Copy the Web App URL and paste it in app.js as GOOGLE_SHEETS_WEB_APP_URL
 * 
 * GOOGLE SHEET SETUP:
 * - Create a new Google Sheet
 * - Name the first sheet "UserData" (or change SHEET_NAME below)
 * - Add headers in row 1: Timestamp | Type | Name | Phone | Prize
 * - Copy the Sheet ID from the URL (the long string between /d/ and /edit)
 */

// Configuration - UPDATE THESE VALUES
const SHEET_ID = '1tvVI5lU7mC_UR2dGUddtsw_yXt_AgrqbNzL8gAsoMCc'; // Replace with your Google Sheet ID
const SHEET_NAME = 'UserData'; // Name of the sheet tab

/**
 * Main function to handle POST requests
 */
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Open the Google Sheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.getRange(1, 1, 1, 5).setValues([['Timestamp', 'Type', 'Name', 'Phone', 'Prize']]);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    }
    
    const result = handleData(sheet, data);
    
    // Add CORS headers for cross-origin requests
    return ContentService
      .createTextOutput(result.getContent())
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle OPTIONS request for CORS preflight
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle the data and write to sheet
 */
function handleData(sheet, data) {
  try {
    const timestamp = data.timestamp || new Date().toISOString();
    const type = data.type || 'unknown';
    const name = data.name || '';
    const phone = data.phone || '';
    const prize = data.prize || '';
    
    // Append the data to the sheet
    sheet.appendRow([timestamp, type, name, phone, prize]);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Data saved successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function - you can run this to test the script
 */
function test() {
  const testData = {
    type: 'user_info',
    name: 'Test User',
    phone: '1234567890',
    timestamp: new Date().toISOString()
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}

