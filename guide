🛠 How to Set Up Your Smart Vocab Bot (Step-by-Step)

Setting this up is actually easier than making a cup of coffee. Just follow these simple steps and you'll have your own AI-powered English coach in no time! 🚀

🧠 Step 1: The Brain (Google Sheet)

Create a new Google Sheet: Head over to sheets.new.

Tab Name: Make sure your first tab is named Sheet1.

The Layout: Set up your columns in the first row exactly like this:

Column A: Word

Column B: Example Sentence

Column C: Level

Pro Tip: Don’t fill anything in the Level column! Just name it. The bot is smart enough to fill it with "1" automatically for every new word you add.

🤵‍♂️ Step 2: The Face (Telegram Bot)

Get a Token: Chat with @BotFather on Telegram. Use the /newbot command and follow the instructions to get your API Token.

Get your ID: Chat with @userinfobot and hit Start. It’ll give you your User ID (a string of numbers).

Wake it up: Open your new bot's chat and hit Start. This is a crucial step—the bot can't talk to you if you don't talk to it first!

⚡ Step 3: The Engine (Apps Script)

Open the Editor: In your Google Sheet, go to Extensions > Apps Script.

Clean Slate: Delete any code you see there.

The Code: Copy and paste the entire code from script.gs into the editor.

Configure: Look at the top of the script and put your Token and ID inside the single quotes.

Go Live: - Click Deploy > New Deployment.

Select Web App.

Set "Who has access" to Anyone.

Hit Deploy and Copy the Web App URL.

🔗 Step 4: The Magic Link (Webhook)

To link Telegram to your script, copy this link, replace the placeholders with your actual data, and paste it into your browser:

https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=<YOUR_WEBAPP_URL>

If you see {"ok":true...}, you're officially a legend. Your bot is alive! 🦾

🌍 How to Change the Translation Language?

Want the bot to translate to Chinese? Spanish? or Hindi? It’s a one-second fix. Look for this line in the code:

const translation = LanguageApp.translate(word, 'en', 'ar');


Just swap 'ar' with your preferred language code:

Spanish: 'es'

French: 'fr'

Chinese: 'zh'

Hindi: 'hi'

German: 'de'

Google supports almost every language. Just look up "ISO language codes" if you need a different one!

💡 Need Help?

If you get stuck at any step, don't sweat it. Just reach out to me on WhatsApp.

Happy Learning! 🎓✨
