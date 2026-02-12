# 📝 Step-by-Step Guide: After Pasting the Code

## ✅ You've Pasted the Code - Now What?

Follow these steps **in order**:

---

## Step 1: Configure Your Bot Credentials

1. **Find these lines at the top of the code:**
   ```javascript
   const TELEGRAM_TOKEN = 'YOUR_TOKEN';
   const CHAT_ID = 'YOUR_ID';
   ```

2. **Replace with your actual values:**
   ```javascript
   const TELEGRAM_TOKEN = '123456789:ABCdefGHIjklMNOpqrsTUVwxyz';
   const CHAT_ID = '987654321';
   ```

3. **Save** (Ctrl+S or File → Save)

---

## Step 2: Deploy as Web App

1. **Click the "Deploy" button** (top-right corner)
   
2. **Select "New deployment"**

3. **Click the gear icon ⚙️** next to "Select type"

4. **Choose "Web app"**

5. **Configure settings:**
   - **Description:** "Vocab Bot Webhook" (or anything you want)
   - **Execute as:** Select **"Me (your-email@gmail.com)"**
   - **Who has access:** Select **"Anyone"**
   
   ⚠️ **Important:** Must be "Anyone" for Telegram to access it!

6. **Click "Deploy"**

7. **Authorize access:**
   - A popup will appear asking for permissions
   - Click **"Authorize access"**
   - Choose your Google account
   - Click **"Allow"** (it may show a warning - click "Advanced" → "Go to Project")

8. **Copy the Web App URL**
   - After deployment, you'll see a URL like:
     `https://script.google.com/macros/s/AKfycbz.../exec`
   - **COPY THIS URL** - you'll need it in the next step!

---

## Step 3: Set Up the Webhook

1. **Go back to the Apps Script editor**

2. **Find the `setWebhook()` function** (scroll down in the code)

3. **Update this line:**
   ```javascript
   const webAppUrl = 'YOUR_WEB_APP_URL_HERE';
   ```
   
   **Paste your URL from Step 2:**
   ```javascript
   const webAppUrl = 'https://script.google.com/macros/s/AKfycbz.../exec';
   ```

4. **Save** (Ctrl+S)

5. **Run the function:**
   - At the top of the editor, find the dropdown that says "Select function"
   - Click it and select **"setWebhook"**
   - Click the **▶️ Run button**
   - Wait a few seconds

6. **Check the logs:**
   - Click "Execution log" at the bottom
   - You should see: `{"ok":true,"result":true,"description":"Webhook was set"}`
   - ✅ If you see this = SUCCESS!
   - ❌ If you see an error = check your TELEGRAM_TOKEN

---

## Step 4: Create the Automatic Timer

1. **In the function dropdown, select** `createFiveHourTrigger`

2. **Click the ▶️ Run button**

3. **You may need to authorize again** - click "Review permissions" → "Allow"

4. **Check the logs:**
   - Should see: "✅ Trigger created successfully!"

5. **Verify the trigger was created:**
   - On the left sidebar, click the **⏰ Triggers** icon (clock icon)
   - You should see a trigger for `sendDailyWordWithButtons`
   - It should run "Time-driven, Hour timer, Every 5 hours"

---

## Step 5: Test Immediately!

1. **In the function dropdown, select** `testSendWord`

2. **Click the ▶️ Run button**

3. **Check your Telegram:**
   - You should receive a vocabulary word message!
   - Try pressing all the buttons:
     - 🔊 Listen - should send 1 voice message (not 7!)
     - 👁️ Meaning - should show Arabic translation
     - 🎥 YouGlish - should open website
     - ✅ Done - should update the word level
     - ⌛ Not Yet - should mark for review
     - 🗑️ Delete - should remove the word

---

## 🎉 You're Done!

Your bot will now:
- Send a word every 5 hours automatically
- Respond to button presses
- Track your learning progress

---

## 🔧 Troubleshooting

### "Bot not sending words?"
- Check: Extensions → Apps Script → Triggers (clock icon)
- Make sure the trigger exists
- Run `testSendWord` manually to test

### "Buttons not working?"
- Make sure you ran `setWebhook()` function
- Check the Web App is deployed with "Anyone" access
- Try redeploying: Deploy → Manage deployments → Edit → New version

### "Still getting 7 voice messages?"
- You need to **redeploy** after pasting the new code
- Go to: Deploy → Manage deployments → Edit → **New version** → Deploy
- The old version is still running until you create a new version!

### "Webhook error"
- Make sure TELEGRAM_TOKEN is correct (no extra spaces)
- Get your token from @BotFather on Telegram
- Format: `123456789:ABCdef...`

### "Permission denied"
- When running functions, click "Review permissions"
- Choose your Google account
- Click "Advanced" → "Go to Project (unsafe)" → "Allow"
- This is normal for personal projects

---

## 📊 Monitoring Your Bot

### View Execution History:
1. Click **⏱️ Executions** on the left sidebar
2. See all times the bot ran
3. Click on any execution to see logs/errors

### View Triggers:
1. Click **⏰ Triggers** on the left sidebar
2. See when the bot will run next
3. You can delete/edit triggers here

### View Logs:
1. After running any function, click "Execution log" at bottom
2. Shows `Logger.log()` messages
3. Helpful for debugging

---

## 📚 Next Steps

1. **Add more words** to your Google Sheet (Column A, B, C)
2. **Adjust frequency:**
   - Change `everyHours(5)` to `everyHours(3)` for every 3 hours
   - Or use `everyDays(1)` for daily
3. **Customize messages** - edit the text in the code
4. **Track progress** - Column C shows your learning level (1-5)

---

## 🆘 Need More Help?

**Common Questions:**

**Q: How do I stop the bot?**
A: Go to Triggers → Click the 3 dots → Delete trigger

**Q: How do I change the schedule?**
A: Delete the old trigger, edit the code, run `createFiveHourTrigger` again

**Q: Can I use this for other languages?**
A: Yes! Change the translation language in `LanguageApp.translate(word, 'en', 'ar')`
   - 'ar' = Arabic
   - 'fr' = French
   - 'es' = Spanish
   - 'de' = German

**Q: Where do I find my TELEGRAM_TOKEN?**
A: Message @BotFather on Telegram → /newbot → follow steps → copy the token

**Q: Where do I find my CHAT_ID?**
A: Message @userinfobot on Telegram → it will show your Chat ID

---

**Status:** Your bot is ready! 🚀

The bot will automatically send words every 5 hours starting from now.
