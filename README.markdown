snudown-js
=======

[![Build Status](https://travis-ci.org/erikdesjardins/snudown-js.svg)](https://travis-ci.org/erikdesjardins/snudown-js)

`snudown-js` is a 'native' (compiled with [Emscripten](https://kripken.github.io/emscripten-site/)) port of [Snudown](https://github.com/reddit/snudown/), the Markdown parser used by Reddit.


Usage
-----

Import from [npm](https://www.npmjs.com/package/snudown-js): `const Snudown = require('snudown-js')`.

Basic usage:

`Snudown.markdown('some text'); // "<p>some text</p>\n"`

`Snudown.markdownWiki('<table scope="foo">'); // "<p><table scope="foo"></p>\n"`

For more in-depth documentation, see the comments in [`footer.js`](https://github.com/erikdesjardins/snudown-js/blob/master/footer.js).

Building
--------

### You will need...

- to be able to run bash scripts
- `gperf`, [a command-line utility](https://www.gnu.org/software/gperf/) - through your package manager
- `npm`, [node package manager](https://www.npmjs.com/) - through your package manager
- `emcc`, the Emscripten compiler - [from the Emscripten SDK](https://kripken.github.io/emscripten-site/docs/getting_started/downloads.html) (or from [source](http://kripken.github.io/emscripten-site/docs/building_from_source/building_emscripten_from_source_using_the_sdk.html)) (at least version 1.36.0)

### Setup

Run	`npm i`.

Ensure that `gperf` and `emcc` can be invoked from the terminal.

### Build

Run `./build.sh`.

Output is to `dist/`.


Testing
-------

### You will need...

- `node`, the node.js runtime - probably installed during the build process
- a successful build of `snudown-js`

After building, run `node test_snudown.js`.


License
-------

Permission to use, copy, modify, and distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
