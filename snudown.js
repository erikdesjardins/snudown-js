/* global Module, exports */

/**
 * Snudown's version number, usually similar to: "3.2.1".
 * Equivalent to python: <tt>__version__</tt>.
 * @type {string}
 */
const version = Module.ccall('version', 'string');

/**
 * The index of the usertext renderer.
 * Can be passed to {@link markdown}.
 * Equivalent to python: <tt>RENDERER_USERTEXT<tt>.
 * @type {number}
 */
const RENDERER_USERTEXT = Module.ccall('default_renderer', 'number');

/**
 * The index of the wiki renderer.
 * Can be passed to {@link markdown}.
 * Equivalent to python: <tt>RENDERER_WIKI<tt>.
 * @type {number}
 */
const RENDERER_WIKI = Module.ccall('wiki_renderer', 'number');

const __markdown = Module.cwrap('snudown_md', 'string', ['number', 'number', 'number', 'string', 'string', 'number', 'number']);

function _markdown(text, nofollow, target, toc_id_prefix, renderer, enable_toc) {
	// not using Emscripten's automatic string handling since 'text'.length is unreliable for UTF-8
	const size = Module.lengthBytesUTF8(text); // excludes null terminator
	const buf = Module.allocate(Module.intArrayFromString(text), 'i8', Module.ALLOC_STACK);
	return __markdown(buf, size, nofollow, target, toc_id_prefix, renderer, enable_toc);
}

/**
 * Render markdown <tt>text</tt> to an HTML string.
 * Arguments may be passed positionally: <tt>markdown('#/u/hi', true, '_top', RENDERER_WIKI, true, 'prefix_')</tt>,
 * or by name in a single object: <tt>markdown({ text: '#/u/hi', nofollow: true, target: '_top', renderer: RENDERER_WIKI, enableToc: true, tocIdPrefix: 'prefix_' })</tt>.
 * Equivalent to python: <tt>markdown</tt>.
 * @param {string} text
 * @param {boolean} [nofollow=false] Whether to add <tt>rel="nofollow"</tt> to all links.
 * @param {string} [target=null] The <tt>target</tt> property of all links.
 * @param {number} [renderer=RENDERER_USERTEXT]
 * @param {boolean} [enableToc=false] Whether to create a table of contents (Reddit generates the TOC separately).
 * @param {string} [tocIdPrefix=null] Added to the <tt>id</tt> of each TOC link, i.e. <tt>#PREFIXtoc_0</tt>.
 * @returns {string} The rendered HTML.
 */
function markdown({ text = arguments[0], nofollow = arguments[1], target = arguments[2], renderer = arguments[3] === undefined ? RENDERER_USERTEXT : arguments[3], enableToc = arguments[4], tocIdPrefix = arguments[5] } = {}) {
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
function markdownWiki({ text = arguments[0], nofollow = arguments[1], target = arguments[2], enableToc = arguments[3], tocIdPrefix = arguments[4] } = {}) {
	return _markdown(text, nofollow, target, tocIdPrefix, RENDERER_WIKI, enableToc);
}

exports.version = version;
exports.RENDERER_USERTEXT = RENDERER_USERTEXT;
exports.RENDERER_WIKI = RENDERER_WIKI;
exports.markdown = markdown;
exports.markdownWiki = markdownWiki;

