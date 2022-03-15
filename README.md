# fillText-for-twemoji-node-canvas

---

[![npm](https://img.shields.io/badge/-Npm-CB3837.svg?logo=npm&style=popout)](https://www.npmjs.com/package/filltext-for-twemoji) ![node.js](https://img.shields.io/badge/-Node.js-333333.svg?logo=node.js&style=popout) ![npm](https://img.shields.io/npm/dt/filltext-for-twemoji) [![GitHub issues](https://img.shields.io/github/issues/airRnot1106/fillText-for-twemoji-node-canvas)](https://github.com/airRnot1106/fillText-for-twemoji-node-canvas/issues) [![GitHub forks](https://img.shields.io/github/forks/airRnot1106/fillText-for-twemoji-node-canvas)](https://github.com/airRnot1106/fillText-for-twemoji-node-canvas/network) [![GitHub stars](https://img.shields.io/github/stars/airRnot1106/fillText-for-twemoji-node-canvas)](https://github.com/airRnot1106/fillText-for-twemoji-node-canvas/stargazers) [![GitHub license](https://img.shields.io/github/license/airRnot1106/fillText-for-twemoji-node-canvas)](https://github.com/airRnot1106/fillText-for-twemoji-node-canvas/blob/main/LICENSE)

**_This package adds twemoji to node-canvas._**

## Highlight

-   Layout that does not collapse

-   Support for newlines

## Install

```sh
npm install filltext-for-twemoji
```

## Usage

```js
const Canvas = require('canvas');
const { fillText } = require('filltext-for-twemoji');

(async () => {
    const canvas = Canvas.createCanvas(300, 200);
    const ctx = canvas.getContext('2d');
    ctx.font = '40px "sans-serif"';
    await fillText(ctx, 'Hello😁twemoji', 15, 110);
})();
```

![result](https://user-images.githubusercontent.com/62370527/158402279-401c4ea7-e43b-4316-959f-e6a8aaa07e7a.png)

**The font property is applied, but the textAlign and textBaseline settings are ignored and 'start' and 'alphabetic' are applied respectively. Note that no other settings are supported.**

## Issues

If you find a bug or problem, please open an issue!:bug:
In particular, let me know if there are any symbols you can't draw well.

## Author

-   Github: [airRnot1106](https://github.com/airRnot1106)
-   NPM: [airrnot1106](https://www.npmjs.com/~airrnot1106)
-   Twitter: [@airRnot1106](https://twitter.com/airRnot1106)

## LICENSE

This project is licensed under the MIT License - see the [LICENSE](https://github.com/airRnot1106/fillText-for-twemoji-node-canvas/blob/main/LICENSE) file for details.
