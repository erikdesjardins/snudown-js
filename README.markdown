snudown-js
=======

[![Build Status](https://travis-ci.org/erikdesjardins/snudown-js.svg)](https://travis-ci.org/erikdesjardins/snudown-js)

`snudown-js` is a WebAssembly port of [Snudown](https://github.com/reddit/snudown/), the Markdown parser used by Reddit.


Usage
-----

Import from [npm](https://www.npmjs.com/package/snudown-js): `const Snudown = require('snudown-js')`.

Only runs on platforms with native WebAssembly support (Node 8+, modern browsers).

Basic usage:

`Snudown.markdown('some text'); // "<p>some text</p>\n"`

`Snudown.markdownWiki('<table scope="foo">'); // "<p><table scope="foo"></p>\n"`

For more in-depth documentation, see the comments in [`wrapper.js`](https://github.com/erikdesjardins/snudown-js/blob/master/wrapper.js#L82-L112).

Setup
-----

Run	`npm i`.

Install `g++-multilib` and `gperf` from your package manager.

Run `./install.sh` to build the toolchain from source. This will take a long time.


Building
--------

Run `./build.sh`.

Output is to `dist/`.


Testing
-------

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
