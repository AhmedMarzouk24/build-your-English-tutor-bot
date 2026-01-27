/**
 *  Smart English Vocab Bot - Fixed / Improved
 * Developed by: Ahmed Marzouk (reviewed & repaired)
 */

// --- ⚙️ CONFIGURATION ---
// IMPORTANT: Replace these with real values before deploying.
const TELEGRAM_TOKEN = 'YOUR_TOKEN';
const CHAT_ID = 'YOUR_CHAT_ID'; // only used for scheduled sends; callbacks should use dynamic chat id

/**
 * 1️ Main function to send the word
 * Selects a word based on a weighted system (harder words appear more often)
 */
function sendDailyWordWithButtons() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length < 2) {
    Logger.log("File is empty.");
    return;
  }

  // ---  Weighted system (Spaced Repetition Logic) ---
  let weightedPool = [];
  for (let i = 1; i < data.length; i++) {
    let rowIndex = i + 1;
    let level = data[i][2]; // column C (level)

    // normalize level to integer (default to 1 if missing/invalid)
    let lvl = parseInt(level);
    if (isNaN(lvl) || lvl < 1) lvl = 1;
    if (lvl > 5) lvl = 5;

    // weight mapping:
    // level 1 => 10, level 2 => 8, level 3 => 6, level 4 => 4, level 5 => 1
    let weight = (lvl >= 5) ? 1 : (6 - lvl) * 2;

    for (let j = 0; j < weight; j++) {
      weightedPool.push(rowIndex);
    }
  }

  if (weightedPool.length === 0) {
    Logger.log("No candidates found for selection.");
    return;
  }

  // pick a random row from the weighted pool
  const chosenRowIndex = weightedPool[Math.floor(Math.random() * weightedPool.length)];
  // validate chosenRowIndex exists in data
  if (chosenRowIndex < 2 || chosenRowIndex > data.length) {
    Logger.log("Selected row index out of range: " + chosenRowIndex);
    return;
  }

  const word = data[chosenRowIndex - 1][0];     // column A
  const example = data[chosenRowIndex - 1][1];  // column B

  // fetch English definition from the API
  const englishDef = getDefinitionFromAPI(word);

  // prepare Telegram control buttons with YouGlish button
  const youglishUrl = "https://youglish.com/pronounce/" + encodeURIComponent(word) + "/english";

  const keyboard = {
    inline_keyboard: [
      [
        { text: "Listen 🔊", callback_data: "listen_" + chosenRowIndex },
        { text: "meaning👁️", callback_data: "show_ar_" + chosenRowIndex }
      ],
      [
        { text: "YouGlish 🎥", url: youglishUrl }
      ],
      [
        { text: "done✅", callback_data: "done_" + chosenRowIndex },
        { text: "not yet⌛", callback_data: "later_" + chosenRowIndex },
        { text: "delete🗑️", callback_data: "delete_" + chosenRowIndex }
      ]
    ]
  };

  // Build message text. Keep simple Markdown (Telegram 'Markdown') — be aware of characters in example/def that may need escaping.
  const text =
    "📖 *Context:* \n" + "_" + (example || "") + "_\n\n" +
    "━━━━━━━━━━━━━\n" +
    "🔤 *Word:* `" + (word || "") + "`\n" +
    "📝 *Def:* \n" + (englishDef || "Definition N/A.") + "\n\n" +
    "💡 *Try to guess the meaning!*";

  // When sending scheduled messages, use configured CHAT_ID (or replace with the desired chat ID)
  sendToTelegram("sendMessage", {
    chat_id: CHAT_ID,
    text: text,
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

/**
 * 2️ Handle incoming commands (Webhook)
 * Deals with button presses (translation, pronunciation, level updates)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput('');
    }

    const contents = JSON.parse(e.postData.contents);
    if (!contents.callback_query) return ContentService.createTextOutput('');

    const callback = contents.callback_query;
    const callbackData = callback.data || "";
    const parts = callbackData.split('_');
    const action = parts[0];
    const rowIndex = parseInt(parts.pop(), 10);

    // get chat and message info from the callback payload (use dynamic chat id)
    const message = callback.message || {};
    const chat = (message.chat && message.chat.id) ? message.chat : null;
    const chatId = chat ? chat.id : CHAT_ID; // fallback to global CHAT_ID if unavailable
    const messageId = message.message_id;

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // quick answer to Telegram to hide loading spinner
    sendToTelegram("answerCallbackQuery", { callback_query_id: callback.id });

    if (action === 'show') {
      if (!rowIndex || rowIndex < 1) {
        sendToTelegram("sendMessage", { chat_id: chatId, text: "⚠️ Invalid item reference." });
        return ContentService.createTextOutput('');
      }

      const word = sheet.getRange(rowIndex, 1).getValue();

      //  On-demand automatic translation
      const arabicMeaning = LanguageApp.translate(word, 'en', 'ar');

      let currentText = message.text || "";
      // ensure translation isn't added multiple times if user presses repeatedly
      if (currentText.includes(" *Arabic Meaning:*")) return ContentService.createTextOutput('');

      const newText = currentText + "\n\n *Arabic Meaning:* " + arabicMeaning;

      sendToTelegram("editMessageText", {
        chat_id: chatId,
        message_id: messageId,
        text: newText,
        parse_mode: 'Markdown',
        reply_markup: message.reply_markup // keep original buttons
      });
    } 
    else if (action === 'listen') {
      if (!rowIndex || rowIndex < 1) {
        sendToTelegram("sendMessage", { chat_id: chatId, text: "⚠️ Invalid item reference." });
        return ContentService.createTextOutput('');
      }

      const word = sheet.getRange(rowIndex, 1).getValue();
      const audioUrl = getAudioFromAPI(word);

      if (audioUrl) {
        // choose sendAudio for mp3/wav/etc, sendVoice only for ogg/opus
        if (/\.(ogg|oga|opus)(\?|$)/i.test(audioUrl)) {
          sendToTelegram("sendVoice", {
            chat_id: chatId,
            voice: audioUrl
          });
        } else {
          // fallback to sendAudio for common formats
          sendToTelegram("sendAudio", {
            chat_id: chatId,
            audio: audioUrl,
            caption: "Pronunciation of " + word
          });
        }
      } else {
        // simple alert if no audio found
        sendToTelegram("sendMessage", {
          chat_id: chatId,
          text: "🔇 Sorry, no audio found for: " + word
        });
      }
    }
    else {
      // update word level or delete it
      let statusText = "";
      if (!rowIndex || rowIndex < 1) {
        sendToTelegram("sendMessage", { chat_id: chatId, text: "⚠️ Invalid item reference for update." });
        return ContentService.createTextOutput('');
      }

      if (action === 'done') {
        sheet.getRange(rowIndex, 3).setValue(5);
        statusText = "Mastered! ⭐ (I will show this less often)";
      } else if (action === 'later') {
        sheet.getRange(rowIndex, 3).setValue(1);
        statusText = "Noted! ⏳ I will keep reminding you.";
      } else if (action === 'delete') {
        // CAUTION: deleting rows referenced by other outstanding messages can break indices for other callbacks.
        sheet.deleteRow(rowIndex);
        statusText = "Deleted from your list 🗑️";
      } else {
        statusText = "Unknown action.";
      }

      sendToTelegram("editMessageText", {
        chat_id: chatId,
        message_id: messageId,
        text: "✅ " + statusText
      });
    }

    return ContentService.createTextOutput('');
  } catch (err) {
    Logger.log("Error in doPost: " + err);
    // Do not expose internal errors to end users, but provide a simple message if possible
    try {
      const contents = JSON.parse(e.postData.contents || "{}");
      const callback = contents.callback_query || {};
      const chat = (callback.message && callback.message.chat) ? callback.message.chat.id : CHAT_ID;
      sendToTelegram("sendMessage", { chat_id: chat, text: "⚠️ An internal error occurred." });
    } catch (e2) { /* ignore */ }
    return ContentService.createTextOutput('');
  }
}

// ---  Helper Functions ---

/**
 * Fetch audio pronunciation URL and fix protocol links
 */
function getAudioFromAPI(word) {
  try {
    const res = UrlFetchApp.fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word), {muteHttpExceptions: true});
    if (res.getResponseCode() !== 200) return null;
    const data = JSON.parse(res.getContentText());

    let audio = null;
    // deep search for the first available audio URL in the API
    for (let entry of data) {
      if (entry.phonetics && Array.isArray(entry.phonetics)) {
        for (let p of entry.phonetics) {
          if (p && p.audio && p.audio !== "") {
            audio = p.audio;
            break;
          }
        }
      }
      if (audio) break;
    }

    if (audio) {
      // fix link if it starts with // to ensure it works in Telegram
      if (audio.startsWith("//")) audio = "https:" + audio;
      // dictionary API sometimes returns relative or invalid links - basic validation
      if (!/^https?:\/\//i.test(audio)) return null;
      return audio;
    }
    return null;
  } catch (e) { return null; }
}

/**
 * Fetch word definition from dictionary API
 */
function getDefinitionFromAPI(word) {
  try {
    const res = UrlFetchApp.fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word), {muteHttpExceptions: true});
    if (res.getResponseCode() === 200) {
      const data = JSON.parse(res.getContentText());
      if (Array.isArray(data) && data[0] && data[0].meanings && data[0].meanings[0] && data[0].meanings[0].definitions && data[0].meanings[0].definitions[0]) {
        return data[0].meanings[0].definitions[0].definition;
      }
    }
    return "Definition N/A.";
  } catch (e) { return "Definition N/A."; }
}

/**
 * Send requests to the Telegram API
 */
function sendToTelegram(method, payload) {
  const url = "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/" + method;
  try {
    return UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    });
  } catch (e) {
    Logger.log("Telegram API error (" + method + "): " + e);
    return null;
  }
}

/**
 * Set up trigger to run every 5 hours
 * Run this function only once from the Editor
 */
function createFiveHourTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'sendDailyWordWithButtons') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('sendDailyWordWithButtons')
    .timeBased()
    .everyHours(5)
    .create();

  Logger.log("done, trigger created");
}
