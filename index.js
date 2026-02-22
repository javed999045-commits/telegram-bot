const { Telegraf } = require('telegraf'); 
const fetch = require('node-fetch'); 
const FormData = require('form-data'); 

// ⚠️ Note: Apne bot token ko hamesha safe rakhein, ise public forums par share na karein.
const bot = new Telegraf('7783281701:AAE2bAroE_NO0EFcbnuF6GbSjDuEulKXQoM'); 

bot.start((ctx) => {
  ctx.reply(`Welcome to telegram-bot 🎧\n\nAudio ya MP3 file bhejo (document ya audio ke roop mein). Main usko Catbox.moe pe upload kar dunga aur direct playable link dunga jo tere app mein sidha play ho jayega! Bas file bhej do! 🚀`); 
}); 

bot.help((ctx) => {
  ctx.reply('📁 Audio/MP3 file bhejo → Main direct link dunga jo app mein play hoga.'); 
}); 

bot.on(['audio', 'document'], async (ctx) => {
  try {
    const msg = ctx.message;
    const fileId = msg.audio ? msg.audio.file_id : msg.document.file_id;
    const fileName = msg.audio ? (msg.audio.title || 'audio.mp3') : (msg.document.file_name || 'audio.mp3');
    
    await ctx.reply(`⏳ Uploading "${fileName}" to Catbox.moe...`);
    
    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await fetch(fileLink);
    const buffer = await response.buffer();
    
    // Catbox.moe API setup
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, fileName);
    
    // Uploading to Catbox
    const uploadRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form
    });
    
    // Catbox returns plain text URL on success, not JSON
    if (!uploadRes.ok) {
        throw new Error('Catbox.moe abhi response nahi de raha hai.');
    }
    
    const directLink = await uploadRes.text();
    
    // Verify if it returned a valid URL
    if (!directLink.startsWith('http')) {
        throw new Error('Upload fail ho gaya ya invalid response mila.');
    }
    
    await ctx.reply(`✅ Upload Complete!\n📁 File: ${fileName}\n🔗 Direct Link: ${directLink}\n\nIs link ko apne app mein paste kar do → sidha play ho jayega! 🎵\nAur file bhej sakte ho.`);
    
  } catch (err) {
    console.error(err);
    await ctx.reply(`❌ Error: ${err.message}\nThodi der baad dubara file bhej ke try karo.`);
  } 
}); 

bot.launch(); 
console.log('✅ telegram-bot successfully chal raha hai...'); 

process.once('SIGINT', () => bot.stop('SIGINT')); 
process.once('SIGTERM', () => bot.stop('SIGTERM'));