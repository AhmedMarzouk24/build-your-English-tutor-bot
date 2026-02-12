/**
 * 🤖 Smart English Vocab Bot - Enhanced Version
 * Developed by: Ahmed Marzouk
 * Improved by: Claude
 * Features: Auto-Translate, Spaced Repetition, Voice Pronunciation, Dictionary API, YouGlish
 */

// --- ⚙️ CONFIGURATION ---
const TELEGRAM_TOKEN = 'PASTE YPUR TOKEN HERE ';
const CHAT_ID = 'PASTE YOUR ID HERE';

/**
 * 1️⃣ Main function to send the word
 * Selects a word based on weighted spaced repetition
 */
function sendDailyWordWithButtons() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      Logger.log("File is empty.");
      return;
    }

    // --- 🧠 Weighted Spaced Repetition Logic ---
    let weightedPool = [];
    for (let i = 1; i < data.length; i++) {
      let rowIndex = i + 1;
      let level = data[i][2]; // Column C (level)
      
      // Level 1 (new/hard) = weight 10, Level 5 (mastered) = weight 1
      let weight = (level == 5 || level == "5") ? 1 : 10;
      
      for (let j = 0; j < weight; j++) {
        weightedPool.push(rowIndex);
      }
    }

    // Pick random row from weighted pool
    const rowIndex = weightedPool[Math.floor(Math.random() * weightedPool.length)];
    const word = data[rowIndex - 1][0]; // Column A
    const example = data[rowIndex - 1][1]; // Column B

    // Fetch English definition from API
    const englishDef = getDefinitionFromAPI(word);

    // Prepare Telegram buttons with YouGlish
    const youglishUrl = `https://youglish.com/pronounce/${encodeURIComponent(word)}/english`;
    const keyboard = {
      inline_keyboard: [
        [
          { text: "🔊 Listen", callback_data: `listen_${rowIndex}` },
          { text: "👁️ Meaning", callback_data: `show_ar_${rowIndex}` }
        ],
        [
          { text: "🎥 YouGlish", url: youglishUrl }
        ],
        [
          { text: "✅ Done", callback_data: `done_${rowIndex}` },
          { text: "⌛ Not Yet", callback_data: `later_${rowIndex}` },
          { text: "🗑️ Delete", callback_data: `delete_${rowIndex}` }
        ]
      ]
    };

    const text = `📖 *Context:*\n_${example}_\n\n━━━━━━━━━━━━━\n🔤 *Word:* \`${word}\`\n📝 *Definition:*\n${englishDef}\n\n💡 *Try to guess the meaning!*`;

    sendToTelegram("sendMessage", {
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });

    Logger.log(`✅ Sent word: ${word} (Row ${rowIndex})`);
    
  } catch (error) {
    Logger.log(`❌ Error in sendDailyWordWithButtons: ${error.message}`);
    sendToTelegram("sendMessage", {
      chat_id: CHAT_ID,
      text: `⚠️ Error sending word: ${error.message}`
    });
  }
}

/**
 * 2️⃣ Handle incoming webhook callbacks
 * Processes button presses (translation, pronunciation, level updates)
 */
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    
    if (!contents.callback_query) return;

    const callbackData = contents.callback_query.data;
    const parts = callbackData.split('_');
    const action = parts[0];
    const rowIndex = parseInt(parts[parts.length - 1]);
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const messageId = contents.callback_query.message.message_id;

    // Send quick acknowledgment to Telegram
    sendToTelegram("answerCallbackQuery", {
      callback_query_id: contents.callback_query.id
    });

    // Handle different actions
    if (action === 'show') {
      handleShowTranslation(sheet, rowIndex, messageId, contents);
      
    } else if (action === 'listen') {
      handleListenPronunciation(sheet, rowIndex);
      
    } else if (action === 'done') {
      handleDone(sheet, rowIndex, messageId);
      
    } else if (action === 'later') {
      handleLater(sheet, rowIndex, messageId);
      
    } else if (action === 'delete') {
      handleDelete(sheet, rowIndex, messageId);
    }
    
  } catch (error) {
    Logger.log(`❌ Error in doPost: ${error.message}`);
  }
}

/**
 * 🔧 Handler Functions
 */

function handleShowTranslation(sheet, rowIndex, messageId, contents) {
  const word = sheet.getRange(rowIndex, 1).getValue();
  
  // ✨ On-demand automatic translation
  const arabicMeaning = LanguageApp.translate(word, 'en', 'ar');
  
  let currentText = contents.callback_query.message.text;
  
  // Prevent duplicate translations
  if (currentText.includes("🎯 *Arabic Meaning:*")) {
    sendToTelegram("answerCallbackQuery", {
      callback_query_id: contents.callback_query.id,
      text: "Already showing translation!",
      show_alert: false
    });
    return;
  }

  const newText = `${currentText}\n\n🎯 *Arabic Meaning:* ${arabicMeaning}`;
  
  sendToTelegram("editMessageText", {
    chat_id: CHAT_ID,
    message_id: messageId,
    text: newText,
    parse_mode: 'Markdown',
    reply_markup: contents.callback_query.message.reply_markup
  });
}

function handleListenPronunciation(sheet, rowIndex) {
  const word = sheet.getRange(rowIndex, 1).getValue();
  const audioUrl = getAudioFromAPI(word);
  
  if (audioUrl) {
    sendToTelegram("sendVoice", {
      chat_id: CHAT_ID,
      voice: audioUrl
    });
  } else {
    sendToTelegram("sendMessage", {
      chat_id: CHAT_ID,
      text: `🔇 Sorry, no audio found for: *${word}*`,
      parse_mode: 'Markdown'
    });
  }
}

function handleDone(sheet, rowIndex, messageId) {
  sheet.getRange(rowIndex, 3).setValue(5);
  sendToTelegram("editMessageText", {
    chat_id: CHAT_ID,
    message_id: messageId,
    text: "✅ Mastered! ⭐\n\n_I'll show this word less often now._",
    parse_mode: 'Markdown'
  });
}

function handleLater(sheet, rowIndex, messageId) {
  sheet.getRange(rowIndex, 3).setValue(1);
  sendToTelegram("editMessageText", {
    chat_id: CHAT_ID,
    message_id: messageId,
    text: "⏳ Noted!\n\n_I'll keep reminding you about this word._",
    parse_mode: 'Markdown'
  });
}

function handleDelete(sheet, rowIndex, messageId) {
  const word = sheet.getRange(rowIndex, 1).getValue();
  sheet.deleteRow(rowIndex);
  sendToTelegram("editMessageText", {
    chat_id: CHAT_ID,
    message_id: messageId,
    text: `🗑️ Deleted: *${word}*\n\n_Removed from your vocabulary list._`,
    parse_mode: 'Markdown'
  });
}

// --- 🛠️ Helper Functions ---

/**
 * Fetch audio pronunciation URL from Dictionary API
 */
function getAudioFromAPI(word) {
  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    
    if (response.getResponseCode() !== 200) return null;
    
    const data = JSON.parse(response.getContentText());
    let audio = null;

    // Deep search for first available audio URL
    for (let entry of data) {
      if (entry.phonetics) {
        for (let phonetic of entry.phonetics) {
          if (phonetic.audio && phonetic.audio !== "") {
            audio = phonetic.audio;
            break;
          }
        }
      }
      if (audio) break;
    }

    // Fix protocol-relative URLs
    if (audio && audio.startsWith("//")) {
      audio = `https:${audio}`;
    }

    return audio;
    
  } catch (error) {
    Logger.log(`❌ Error fetching audio for "${word}": ${error.message}`);
    return null;
  }
}

/**
 * Fetch word definition from Dictionary API
 */
function getDefinitionFromAPI(word) {
  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      
      // Get first definition
      if (data[0]?.meanings?.[0]?.definitions?.[0]?.definition) {
        return data[0].meanings[0].definitions[0].definition;
      }
    }
    
    return "Definition not available.";
    
  } catch (error) {
    Logger.log(`❌ Error fetching definition for "${word}": ${error.message}`);
    return "Definition not available.";
  }
}

/**
 * Send requests to Telegram Bot API
 */
function sendToTelegram(method, payload) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/${method}`;
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const result = JSON.parse(response.getContentText());
    
    if (!result.ok) {
      Logger.log(`⚠️ Telegram API Error: ${result.description}`);
    }
    
    return response;
    
  } catch (error) {
    Logger.log(`❌ Error sending to Telegram: ${error.message}`);
    throw error;
  }
}

/**
 * Set up time-based trigger (run once from Script Editor)
 */
function createFiveHourTrigger() {
  // Remove existing triggers for this function
  const triggers = ScriptApp.getProjectTriggers();
  for (let trigger of triggers) {
    if (trigger.getHandlerFunction() === 'sendDailyWordWithButtons') {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  // Create new 5-hour trigger
  ScriptApp.newTrigger('sendDailyWordWithButtons')
    .timeBased()
    .everyHours(8)
    .create();

  Logger.log("✅ Trigger created successfully! Bot will send words every 5 hours.");
}

/**
 * 🧪 Test function - Send a word immediately
 */
function testSendWord() {
  Logger.log("🧪 Testing word sending...");
  sendDailyWordWithButtons();
}

/**
 * 🔧 Setup webhook (run once after deploying as Web App)
 */
function setWebhook() {
  const webAppUrl = 'YOUR_WEB_APP_URL_HERE'; // Get this after deploying
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${webAppUrl}`;
  
  const response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

/**

/**
 * 📊 View current trigger status
 */
function viewTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  Logger.log(`📋 Active Triggers (${triggers.length}):`);
  
  for (let trigger of triggers) {
    Logger.log(`  - ${trigger.getHandlerFunction()} (${trigger.getTriggerSource()})`);
  }
}
