import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Client, NoAuth, Message } from 'whatsapp-web.js';
import fs from 'fs';



const qrcode = require('qrcode-terminal') as any;

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const client = new Client({
    authStrategy: new NoAuth()
});


const userStates: Record<string, boolean> = {};


client.on('qr', (qr: string) => {// gera QR code para autenticação
    qrcode.generate(qr, { small: true });
});


client.on('ready', () => { //depois que autentica pelo qrcode
    console.log('Client esta pronto!');
});


client.on('message', async (message: Message) => {
    const chatId = message.from;

    if (message.body === 'clonevoice1') {    // Ativa gravação
        userStates[chatId] = true;
        await message.reply('Gravação de voz ativada. Por favor, envie os áudios.');
        return;
    }
   
    if (message.body === 'stopclonevoice') { // Desativa gravacao
        userStates[chatId] = false;
        await message.reply('Gravação de voz desativada.');
        return;
    }

    
    if (userStates[chatId]) {// processa e salva audios se a gravação estiver ativadaa
        if (message.hasMedia) {
            try {
                const media = await message.downloadMedia();
                if (media.mimetype.startsWith('audio/')) {
                    const filename = `audio-${message.id.id}.mp3`;
                    const filePath = `./audios/${filename}`;
                    fs.writeFileSync(filePath, media.data, 'base64');
                    console.log(`Audio saved: ${filename}`);
                }
            } catch (err) {
                console.error('Error handling media message:', err);
            }
        }
    }
});


client.initialize();


app.listen(port, () => {
    console.log(`Server na porta: ${port}`);
});


const audiosDir = './audios';
if (!fs.existsSync(audiosDir)) {
    fs.mkdirSync(audiosDir);
}
