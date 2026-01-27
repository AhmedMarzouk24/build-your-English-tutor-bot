> #  Smart Vocab Bot: Your AI-Powered English Coach

Setting up your Smart Vocab Bot is actually easier than making a cup of coffee. Follow this step-by-step guide to get your bot up and running in no time!

---

##  Step 1: The Brain (Google Sheets)

1.  **Create a Sheet:** Head over to [sheets.new](https://sheets.new).
2.  **Tab Name:** Ensure your first tab is named `Sheet1`.
3.  **The Layout:** Set up your columns in the first row (**A1, B1, C1**) exactly like this:
    * **Column A:** `Word`
    * **Column B:** `Example Sentence`
    * **Column C:** `Level`

> [!TIP]
> **Pro Tip:** Don’t fill anything in the **Level** column! The bot is smart enough to fill it with "1" automatically for every new word you add, and "5" for words you have already mastered.

---

##  Step 2: The Face (Telegram Bot)

1.  **Get a Token:** Chat with [@BotFather](https://t.me/BotFather) on Telegram. Use the `/newbot` command and follow the instructions to receive your **API Token**.
2.  **Get your ID:** Chat with [@userinfobot](https://t.me/userinfobot) and hit **Start**. It will provide your **User ID** (a string of numbers).
3.  **Wake it up:** Open your new bot's chat and hit **Start**. This is a crucial step—the bot can't talk to you if you don't talk to it first!

---

##  Step 3: The Engine (Apps Script)

1.  **Open the Editor:** In your Google Sheet, go to **Extensions** > **Apps Script**.
2.  **Clean Slate:** Delete any existing code in the editor.
3.  **The Code:** Copy and paste the entire code from the `script.gs` file into the editor.
4.  **Configure:** Find the variables at the top of the script and paste your **Token** and **ID** inside the single quotes.
5.  **Go Live:**
    * Click **Deploy** > **New Deployment**.
    * Select **Web App**.
    * Set **"Who has access"** to **Anyone**.
    * Hit **Deploy** and **Copy the Web App URL**.

---

##  Step 4: The Magic Link (Webhook)

To link Telegram to your script, copy the link below, replace the placeholders with your actual data, and paste it into your browser:

`https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=<YOUR_WEBAPP_URL>`

> [!IMPORTANT]
> If you see `{"ok":true...}`, you're officially a legend. Your bot is alive! 🦾

---

##  How to Change the Translation Language?

Want the bot to translate to Spanish, French, or any other language? It’s a one-second fix. Find this line in the code:

```javascript
const translation = LanguageApp.translate(word, 'en', 'ar');
```
you will find it at line 101 of the code 
| Language | ISO code |
|----------|----------|
| Spanish  | `es`     |
| French   | `fr`     |
| Chinese  | `zh`     |
| Hindi    | `hi`     |
| German   | `de`     |


## Need Help?

If you get stuck at any step, don't sweat it. Just reach out to me on [WhatsApp](https://wa.me/01118018956)

Happy Learning!


