import Canvas from 'canvas';
import { parse } from 'twemoji-parser';

/**
 * Draws a text string at the specified coordinates.
 * The font property is applied, but the textAlign and textBaseline settings are ignored and 'start' and 'alphabetic' are applied respectively. No other settings are supported.
 *
 * @param {Canvas.CanvasRenderingContext2D} context
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} [maxWidth]
 */
export const fillText = async (
    context: Canvas.CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth?: number
) => {
    const originalSettings = {
        align: context.textAlign,
        baseLine: context.textBaseline,
    };
    context.textAlign = 'start';
    context.textBaseline = 'alphabetic';
    const blueprints = measureTextCharacter(context, text, x, y);
    for (const blueprint of blueprints) {
        context.fillText(
            blueprint.character,
            blueprint.width,
            blueprint.height,
            maxWidth
        );
    }
    const emojis = blueprints.filter((blueprint) => blueprint.isEmoji);
    await Promise.all(
        emojis.map(async (emoji) => replaceEmoji(context, emoji))
    );
    context.textAlign = originalSettings.align;
    context.textBaseline = originalSettings.baseLine;
};

const splitByGraphemeCluster = (text: string) => {
    const correspondenceTable: { [key: number]: number } = {
        194: 2,
        195: 2,
        197: 2,
        198: 2,
        203: 2,
        207: 2,
        224: 3,
        225: 3,
        226: 3,
        227: 3,
        228: 3,
        229: 3,
        230: 3,
        231: 3,
        232: 3,
        233: 3,
        239: 3,
        240: 4,
    } as const;
    const textBuffer = Buffer.from(text);
    const textBufferArray = [...textBuffer.values()];
    const splitBufferPerCharacter = (bufferArray: number[]) => {
        const copiedArray = [...bufferArray];
        const VARIATION_SELECTOR_01 = '239184';
        const VARIATION_SELECTOR_02 = '243160';
        const ZERO_WIDTH_JOINER = '226128141';
        const characters = [];
        while (copiedArray.length) {
            const head = copiedArray[0];
            if (!head) break;
            const character = copiedArray.splice(
                0,
                correspondenceTable[head] ?? 1
            );
            const next = copiedArray.join('');
            if (next.startsWith(VARIATION_SELECTOR_01)) {
                character.push(...copiedArray.splice(0, 3));
            } else if (next.startsWith(VARIATION_SELECTOR_02)) {
                character.push(...copiedArray.splice(0, 4));
            } else if (next.startsWith(ZERO_WIDTH_JOINER)) {
                while (1) {
                    character.push(...copiedArray.splice(0, 7));
                    const next = copiedArray.join('');
                    if (!next.startsWith(ZERO_WIDTH_JOINER)) break;
                }
            }
            characters.push(character);
        }
        return characters;
    };
    const characterBuffers = splitBufferPerCharacter(textBufferArray);
    const characters = characterBuffers.map((buffer) =>
        Buffer.from(buffer).toString()
    );
    return characters;
};

interface Blueprint {
    character: string;
    width: number;
    height: number;
    isEmoji: boolean;
}

interface TextMetrics {
    width: number;
    actualBoundingBoxLeft: number;
    actualBoundingBoxRight: number;
    actualBoundingBoxAscent: number;
    actualBoundingBoxDescent: number;
    emHeightAscent: number;
    emHeightDescent: number;
    alphabeticBaseline: number;
}

const measureTextCharacter = function (
    context: Canvas.CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number
) {
    const characters = splitByGraphemeCluster(text);
    const strings: string[][] = [[]];
    for (const character of characters) {
        const isEmoji = [...Buffer.from(character)][0] === 240;
        if (isEmoji) {
            strings.push([character], []);
            continue;
        }
        const last = strings.at(-1) ?? [];
        last.push(character);
        if (character === '\n') {
            strings.push([]);
        }
    }
    const blueprints: Blueprint[] = [];
    for (const string of strings) {
        const [width, height] = (() => {
            const last = blueprints.at(-1);
            const textMetrics = context.measureText(
                last?.character ?? ''
            ) as unknown as TextMetrics;
            if (!last) return [x, y];
            const lastWidth = last.width;
            const lastHeight = last.height;
            if (last.character.endsWith('\n')) {
                const currentWidth = x;
                const currentHeight =
                    lastHeight +
                    textMetrics.actualBoundingBoxDescent +
                    textMetrics.alphabeticBaseline;

                return [currentWidth, currentHeight];
            } else {
                const currentWidth = lastWidth + textMetrics.width;
                const currentHeight = lastHeight;
                return [currentWidth, currentHeight];
            }
        })();
        const isEmoji = [...Buffer.from(string.join(''))][0] === 240;
        blueprints.push({
            character: string.join(''),
            width: width,
            height: height,
            isEmoji: isEmoji,
        });
    }
    return blueprints;
};

const emojiCache: Map<string, Canvas.Image> = new Map();

const replaceEmoji = async (
    context: Canvas.CanvasRenderingContext2D,
    blueprint: Blueprint
) => {
    if (!blueprint.isEmoji) return;
    const [entries] = parse(blueprint.character);
    if (!entries) return;
    const emojiImage = await (async () => {
        const url = entries.url;
        const cache = emojiCache.get(url);
        if (cache) return cache;
        const image = await Canvas.loadImage(entries.url);
        emojiCache.set(url, image);
        return image;
    })();
    const fontSize = parseInt(
        context.font.match(/\d+px/)?.at(0)?.replace('px', '') ?? '10'
    );
    const magnification = fontSize / emojiImage.naturalWidth;
    const dw = emojiImage.naturalWidth * magnification;
    const dh = emojiImage.naturalHeight * magnification;
    const CORRECTIONS = {
        dx: dw * 0.1,
        dy: -(dh * 0.8),
        dw: dw * 0.8,
        dh: dh * 0.8,
    } as const;
    context.drawImage(
        emojiImage,
        blueprint.width + CORRECTIONS.dx,
        blueprint.height + CORRECTIONS.dy,
        CORRECTIONS.dw,
        CORRECTIONS.dh
    );
};
