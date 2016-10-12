/* global Module, exports */

/**
 * Snudown's version number, usually similar to: "3.2.1".
 * Equivalent to python: `__version__`.
 * @type {string}
 */
var version = Module.ccall('version', 'string');

/**
 * The index of the usertext renderer.
 * Can be passed to {@link markdown}.
 * Equivalent to python: `RENDERER_USERTEXT`.
 * @type {number}
 */
var RENDERER_USERTEXT = Module.ccall('default_renderer', 'number');

/**
 * The index of the wiki renderer.
 * Can be passed to {@link markdown}.
 * Equivalent to python: `RENDERER_WIKI`.
 * @type {number}
 */
var RENDERER_WIKI = Module.ccall('wiki_renderer', 'number');

/**
 * Render markdown `text` to an HTML string.
 * Arguments may be passed positionally: `markdown('#/u/hi', true, '_top', RENDERER_WIKI, true, 'prefix_')`,
 * or by name in a single object: `markdown({ text: '#/u/hi', nofollow: true, target: '_top', renderer: RENDERER_WIKI, enableToc: true, tocIdPrefix: 'prefix_' })`.
 * Equivalent to python: `markdown`.
 * @param {string} text
 * @param {boolean} [nofollow=false] Whether to add `rel="nofollow"` to all links.
 * @param {string} [target=null] The `target` property of all links.
 * @param {number} [renderer=RENDERER_USERTEXT]
 * @param {boolean} [enableToc=false] Whether to create a table of contents (Reddit generates the TOC separately).
 * @param {string} [tocIdPrefix=null] Added to the `id` of each TOC link, i.e. `#PREFIXtoc_0`.
 * @returns {string} The rendered HTML.
 */
function markdown(text, nofollow, target, renderer, enableToc, tocIdPrefix) {
	if (typeof text === 'object' && text !== null) {
		nofollow = text.nofollow;
		target = text.target;
		renderer = text.renderer;
		enableToc = text.enableToc;
		tocIdPrefix = text.tocIdPrefix;
		text = text.text;
	}
	if (typeof text !== 'string') {
		text = '';
	}
	if (typeof renderer !== 'number') {
		renderer = RENDERER_USERTEXT;
	}
	return _markdown(text, nofollow, target, tocIdPrefix, renderer, enableToc);
}

/**
 * Equivalent to {@link markdown}, but always uses {@link RENDERER_WIKI}.
 * @param {string} text
 * @param {boolean} [nofollow=false]
 * @param {string} [target=null]
 * @param {boolean} [enableToc=false]
 * @param {string} [tocIdPrefix=null]
 * @returns {string} The rendered HTML.
 */
function markdownWiki(text, nofollow, target, enableToc, tocIdPrefix) {
	if (typeof text === 'object' && text !== null) {
		nofollow = text.nofollow;
		target = text.target;
		enableToc = text.enableToc;
		tocIdPrefix = text.tocIdPrefix;
		text = text.text;
	}
	if (typeof text !== 'string') {
		text = '';
	}
	return _markdown(text, nofollow, target, tocIdPrefix, RENDERER_WIKI, enableToc);
}

/**
 * @private
 * @returns {number} A pointer to the rendered string.
 */
var __markdown = Module.cwrap('snudown_md', 'number', ['number', 'number', 'number', 'string', 'string', 'number', 'number']);

/**
 * @private
 * @param {string} text
 * @param {boolean} nofollow
 * @param {string} target
 * @param {string} toc_id_prefix
 * @param {number} renderer
 * @param {boolean} enable_toc
 * @returns {string} The rendered string.
 */
function _markdown(text, nofollow, target, toc_id_prefix, renderer, enable_toc) {
	// not using Emscripten's automatic string handling since 'text'.length is unreliable for UTF-8
	var size = Module.lengthBytesUTF8(text); // excludes null terminator
	var buf = Module.allocate(Module.intArrayFromString(text), 'i8', Module.ALLOC_NORMAL);
	var str = __markdown(buf, size, nofollow, target, toc_id_prefix, renderer, enable_toc);
	Module._free(buf);
	var string = Module.Pointer_stringify(str);
	Module._free(str);
	return string;
}

exports.version = version;
exports.RENDERER_USERTEXT = RENDERER_USERTEXT;
exports.RENDERER_WIKI = RENDERER_WIKI;
exports.markdown = markdown;
exports.markdownWiki = markdownWiki;
