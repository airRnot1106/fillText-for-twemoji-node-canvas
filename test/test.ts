import Canvas from 'canvas';
import fs from 'fs';

import { fillText } from '../src';

(async () => {
    const canvas = Canvas.createCanvas(400, 400);
    const ctx = canvas.getContext('2d');
    ctx.font = '20px "sans-serif"';
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgb(0, 0, 0)';
    console.time('testFillText');
    await fillText(
        ctx,
        'あいう\nえお😄かき👩‍👩‍👧‍👦くけこ\n竈門禰豆子\n¡™£¢∞§¶•ªº–≠œ∑´®†¨ø\n“‘¥åß∂ƒ©∆˚¬…æ≈ç√˜µ≤≥/\n⁄€‹›ﬁﬂ‡°·‚—±Œ„´Á’»Î˝ÔÒÚÆ\n◊˜Â¯˘¿',
        30,
        40
    );
    console.timeEnd('testFillText');
    fs.writeFileSync(__dirname + '/test.png', canvas.toBuffer());
})();
