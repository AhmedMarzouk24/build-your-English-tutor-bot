How to Set Up Your Smart Vocab Bot (Step-by-Step)
=================================================

 Introduction
---------------

Setting this up is actually easier than making a cup of coffee. Just follow these simple steps and you'll have your own AI-powered English coach in no time! 


 Step 1: The Brain (Google Sheet)
----------------------------------

1. Create a new Google Sheet: Head over to `sheets.new`.
2. Tab Name: Make sure your first tab is named ``Sheet1``.
3. The Layout: Set up your columns in the first row exactly like this:

- Column A: Word
- Column B: Example Sentence
- Column C: Level

Pro Tip: Don’t fill anything in the Level column! Just name it. The bot is smart enough to fill it with "1" automatically for every new word you add.


 Step 2: The Face (Telegram Bot)
-----------------------------------

1. Get a Token: Chat with ``@BotFather`` on Telegram. Use the ``/newbot`` command and follow the instructions to get your API Token.
2. Get your ID: Chat with ``@userinfobot`` and hit Start. It’ll give you your User ID (a string of numbers).
3. Wake it up: Open your new bot's chat and hit Start. This is a crucial step—the bot can't talk to you if you don't talk to it first!


 Step 3: The Engine (Apps Script)
----------------------------------

1. Open the Editor: In your Google Sheet, go to ``Extensions > Apps Script``.
2. Clean Slate: Delete any code you see there.
3. The Code: Copy and paste the entire code from ``script.gs`` into the editor.
4. Configure: Look at the top of the script and put your Token and ID inside the single quotes.
5. Go Live:
   - Click ``Deploy > New Deployment``.
   - Select ``Web App``.
   - Set "Who has access" to ``Anyone``.
   - Hit ``Deploy`` and Copy the Web App URL.

Example (important line to configure)
::

    const TELEGRAM_TOKEN = 'YOUR_TOKEN_HERE';
    const TELEGRAM_CHAT_ID = 'YOUR_USER_ID_HERE';

If your script contains a translation line, it may look like this:

.. code-block:: javascript

    const translation = LanguageApp.translate(word, 'en', 'ar');

Change the token/ID and the language code as needed.



 Step 4: The Magic Link (Webhook)
----------------------------------

To link Telegram to your script, copy this link, replace the placeholders with your actual data, and paste it into your browser:

.. code-block:: bash

    https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=<YOUR_WEBAPP_URL>

If you receive a JSON response like ``{"ok":true,...}``, the webhook is set and your bot is live. 🦾



 How to Change the Translation Language?
------------------------------------------

Want the bot to translate to Chinese, Spanish, or Hindi? It’s a one-second fix. Look for this line in the code:

.. code-block:: javascript

    const translation = LanguageApp.translate(word, 'en', 'ar');

Just swap ``'ar'`` with your preferred ISO language code:

- Spanish: ``'es'``
- French: ``'fr'``
- Chinese: ``'zh'``
- Hindi: ``'hi'``
- German: ``'de'``

Google supports almost every language. Search for "ISO language codes" if you need another.


 Need Help?
-------------

If you get stuck at any step, don't sweat it. Reach out to me on WhatsApp.

Happy Learning! 
