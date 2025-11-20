# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration to store user information and prize data from the Spin Wheel application.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it something like "Spin Wheel Data"
4. In the first row, add these headers:
   - **Column A**: Timestamp
   - **Column B**: Type
   - **Column C**: Name
   - **Column D**: Phone
   - **Column E**: Prize
5. Make the header row bold (optional but recommended)
6. Copy the **Sheet ID** from the URL:
   - The URL looks like: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the part between `/d/` and `/edit`

## Step 2: Create Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Click **"New Project"**
3. Delete all the default code in the editor
4. Open the file `google-apps-script.js` from this project
5. Copy the entire contents and paste it into the Google Apps Script editor
6. Replace `'YOUR_SHEET_ID'` with the Sheet ID you copied in Step 1
7. (Optional) Change `'UserData'` if you want a different sheet tab name

## Step 3: Deploy as Web App

1. In Google Apps Script, click **"Deploy"** > **"New deployment"**
2. Click the gear icon (⚙️) next to "Select type"
3. Choose **"Web app"**
4. Configure the deployment:
   - **Description**: "Spin Wheel Data Collection" (or any name you prefer)
   - **Execute as**: **"Me"** (your account)
   - **Who has access**: **"Anyone"** (this allows your website to send data)
5. Click **"Deploy"**
6. You may need to authorize the script:
   - Click **"Authorize access"**
   - Choose your Google account
   - Click **"Advanced"** > **"Go to [Project Name] (unsafe)"**
   - Click **"Allow"**
7. Copy the **Web App URL** that appears (it will look like: `https://script.google.com/macros/s/...`)

## Step 4: Configure Your Website

1. Open `public/app.js` in your project
2. Find the line: `const GOOGLE_SHEETS_WEB_APP_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';`
3. Replace `'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'` with the Web App URL you copied in Step 3
4. Save the file

## Step 5: Test the Integration

1. Open your website
2. Enter your name and phone number in the modal
3. Spin the wheel and win a prize
4. Check your Google Sheet - you should see:
   - One row with your user info (Type: "user_info")
   - One row with your prize (Type: "prize")

## Data Structure

The script will save two types of data:

### User Info (when form is submitted)
- **Timestamp**: When the form was submitted
- **Type**: "user_info"
- **Name**: User's name
- **Phone**: User's phone number
- **Prize**: (empty)

### Prize Data (when user wins)
- **Timestamp**: When the prize was won
- **Type**: "prize"
- **Name**: User's name
- **Phone**: User's phone number
- **Prize**: The prize won

## Troubleshooting

### Data not appearing in the sheet?
- Check the browser console (F12) for any error messages
- Verify the Web App URL is correct in `app.js`
- Make sure the Sheet ID is correct in the Google Apps Script
- Check that the deployment has "Anyone" access

### Script authorization errors?
- Make sure you've authorized the script to access your Google Sheets
- Try redeploying the script

### CORS errors?
- The script uses `no-cors` mode, so you won't see response data
- Check the Google Sheet directly to verify data is being saved
- Check the browser console for any network errors

## Security Note

The Web App URL allows anyone to send data to your sheet. If you want to add security:
- You can add a secret key in the script and check it in the request
- Consider using Google Sheets API with OAuth for production use
- Monitor your sheet for unexpected data

