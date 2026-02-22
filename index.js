// GitHub par index.js mein ye code update karein
const { Telegraf } = require('telegraf'); 
const fetch = require('node-fetch'); 
const FormData = require('form-data'); 
const http = require('http');

// Render keep-alive server
http.createServer((req, res) => res.end('Bot is Online')).listen(process.env.PORT || 3000);

const bot = new Telegraf('7783281701:AAE2bAroE_NO0EFcbnuF6GbSjDuEulKXQoM'); 

bot.on(['audio', 'document'], async (ctx) => {
  try {
    const msg = ctx.message;
    const file = msg.audio || msg.document;
    const fileSizeMB = (file.file_size / (1024 * 1024)).toFixed(2);
    
    // Catbox limit 200MB check
    if (file.file_size > 200 * 1024 * 1024) {
        return ctx.reply(`❌ File bahut badi hai (${fileSizeMB} MB). Catbox sirf 200MB tak allow karta hai.`);
    }

    await ctx.reply(`⏳ Uploading "${file.file_name || 'audio'}" (${fileSizeMB} MB) to Catbox...`);
    
    const fileLink = await ctx.telegram.getFileLink(file.file_id);
    const response = await fetch(fileLink);
    const buffer = await response.buffer();
    
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, file.file_name || 'audio.mp3');
    
    const uploadRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form
    });
    
    const directLink = await uploadRes.text();
    await ctx.reply(`✅ Done!\n🔗 Link: ${directLink}`);
    
  } catch (err) {
    ctx.reply(`❌ Error: ${err.message}`);
  } 
});

bot.launch();
console.log('Bot restarted...');
