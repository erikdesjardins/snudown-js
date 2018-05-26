/* @license
 *
 * Copyright (c) 2009, Natacha Porté
 * Copyright (c) 2011, Vicent Marti
 * Copyright (c) 2015, Erik Desjardins
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

// arguments to wasm2asm asmFunc
var global = {
	Math: Math,
	Int8Array: Int8Array,
	Int16Array: Int16Array,
	Int32Array: Int32Array,
	Uint8Array: Uint8Array,
	Uint16Array: Uint16Array,
	Uint32Array: Uint32Array,
	Float32Array: Float32Array,
	Float64Array: Float64Array,
};
// raw calls to a global abort() are also emitted...?
var abort = function abort(errno) {
	throw new Error('abort (error ' + errno + ')');
};
var env = {
	_abort: abort,
	_grow: function grow() {}
};
var buffer = new ArrayBuffer(65536);
