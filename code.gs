/**
 * 🤖 Smart English Vocab Bot - Final Ultimate Version
 * Developed by: Ahmed Marzouk
 * Features: Auto-Translate, Spaced Repetition, Voice Pronunciation, Dictionary API, YouGlish
 */

// --- ⚙️ CONFIGURATION ---
const TELEGRAM_TOKEN = 'YOUR TOKKEN';
const CHAT_ID = 'YOUR ID ';

/**
 * 1️⃣ Main function to send the word
 * Selects a word based on a weighted system (harder words appear more often)
 */
function sendDailyWordWithButtons() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    Logger.log("اFile is empty.");
    return;
  }

  // --- 🧠 Weighted system (Spaced Repetition Logic) ---
  let weightedPool = [];
  for (let i = 1; i < data.length; i++) {
    let rowIndex = i + 1;
    let level = data[i][2]; // column C (level)
    
    // New words (Level 1) take weight 10, mastered (Level 5) take weight 1
    let weight = (level == 5 || level == "5") ? 1 : 10;
    for (let j = 0; j < weight; j++) {
      weightedPool.push(rowIndex);
    }
  }

  // pick a random row from the weighted pool
  const rowIndex = weightedPool[Math.floor(Math.random() * weightedPool.length)];
  const word = data[rowIndex-1][0];     // column A
  const example = data[rowIndex-1][1];  // column B
  
  // fetch English definition from the API
  const englishDef = getDefinitionFromAPI(word);

  // prepare Telegram control buttons with YouGlish button
  const youglishUrl = "https://youglish.com/pronounce/" + encodeURIComponent(word) + "/english";
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: "Listen 🔊", callback_data: "listen_" + rowIndex },
        { text: "meaning👁️", callback_data: "show_ar_" + rowIndex }
      ],
      [
        { text: "YouGlish 🎥", url: youglishUrl }
      ],
      [
        { text: "done✅", callback_data: "done_" + rowIndex },
        { text: "not yet⌛", callback_data: "later_" + rowIndex },
        { text: "delete🗑️", callback_data: "delete_" + rowIndex }
      ]
    ]
  };

  const text = 
    "📖 *Context:* \n" + "_" + example + "_\n\n" +
    "━━━━━━━━━━━━━\n" +
    "🔤 *Word:* `" + word + "`\n" +
    "📝 *Def:* \n" + englishDef + "\n\n" +
    "💡 *Try to guess the meaning!*";

  sendToTelegram("sendMessage", {
    chat_id: CHAT_ID,
    text: text,
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

/**
 * 2️⃣ Handle incoming commands (Webhook)
 * Deals with button presses (translation, pronunciation, level updates)
 */
function doPost(e) {
  const contents = JSON.parse(e.postData.contents);
  if (!contents.callback_query) return;

  const callbackData = contents.callback_query.data;
  const action = callbackData.split('_')[0];
  const rowIndex = parseInt(callbackData.split('_').pop());
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const messageId = contents.callback_query.message.message_id;

  // send quick answer to Telegram to hide loading state
  sendToTelegram("answerCallbackQuery", { callback_query_id: contents.callback_query.id });

  if (action === 'show') {
    const word = sheet.getRange(rowIndex, 1).getValue();
    
    // ✨ On-demand automatic translation
    const arabicMeaning = LanguageApp.translate(word, 'en', 'ar');
    
    let currentText = contents.callback_query.message.text;
    // ensure translation isn't added multiple times if user presses repeatedly
    if (currentText.includes("Arabic Meaning:")) return; 

    const newText = currentText + "\n\n🎯 *Arabic Meaning:* " + arabicMeaning;

    sendToTelegram("editMessageText", {
      chat_id: CHAT_ID,
      message_id: messageId,
      text: newText,
      parse_mode: 'Markdown',
      reply_markup: contents.callback_query.message.reply_markup
    });
  } 
  else if (action === 'listen') {
    const word = sheet.getRange(rowIndex, 1).getValue();
    const audioUrl = getAudioFromAPI(word);
    
    if (audioUrl) {
      // send pronunciation as a voice message
      sendToTelegram("sendVoice", {
        chat_id: CHAT_ID,
        voice: audioUrl
      });
    } else {
      // simple alert if no audio found
      sendToTelegram("sendMessage", {
        chat_id: CHAT_ID,
        text: "🔇 Sorry, no audio found for: " + word
      });
    }
  }
  else {
    // update word level or delete it
    let statusText = "";
    if (action === 'done') {
      sheet.getRange(rowIndex, 3).setValue(5);
      statusText = "Mastered! ⭐ (I will show this less often)";
    } else if (action === 'later') {
      sheet.getRange(rowIndex, 3).setValue(1);
      statusText = "Noted! ⏳ I will keep reminding you.";
    } else if (action === 'delete') {
      sheet.deleteRow(rowIndex);
      statusText = "Deleted from your list 🗑️";
    }

    sendToTelegram("editMessageText", {
      chat_id: CHAT_ID,
      message_id: messageId,
      text: "✅ " + statusText
    });
  }
}

// --- 🛠️ Helper Functions ---

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
      if (entry.phonetics) {
        for (let p of entry.phonetics) {
          if (p.audio && p.audio !== "") {
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
      return data[0].meanings[0].definitions[0].definition;
    }
    return "Definition N/A.";
  } catch (e) { return "Definition N/A."; }
}

/**
 * Send requests to the Telegram API
 */
function sendToTelegram(method, payload) {
  const url = "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/" + method;
  return UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  });
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
    
  Logger.log("done, my bro ");
}
