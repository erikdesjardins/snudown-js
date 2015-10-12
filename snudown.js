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

const _markdown = Module.cwrap('snudown_md', 'string', ['string', 'number', 'string', 'string', 'number', 'number']);

/**
 * Render markdown <tt>text</tt> to an HTML string.
 * Arguments may be passed positionally: <tt>markdown('hi', true, '_top', RENDERER_WIKI, '', true)</tt>
 * or by name in a single object: <tt>markdown({ text: 'hi', renderer: RENDERER_WIKI })</tt>
 * Equivalent to python: <tt>markdown</tt>.
 * @param {string} text
 * @param {boolean} [nofollow=false] Whether to add <tt>rel="nofollow"</tt> to all links.
 * @param {string} [target=null] The <tt>target</tt> property of all links.
 * @param {number} [renderer=RENDERER_USERTEXT]
 * @param {string} [toc_id_prefix=null] Added to the <tt>id</tt> of each TOC link, i.e. <tt>#PREFIXtoc_0</tt>
 * @param {boolean} [enable_toc=false] Whether to create a table of contents (Reddit generates the TOC separately).
 * @returns {string} The rendered HTML.
 */
function markdown({ text = arguments[0], nofollow = arguments[1], target = arguments[2], renderer = arguments[3] === undefined ? RENDERER_USERTEXT : arguments[3], toc_id_prefix = arguments[4], enable_toc = arguments[5] } = {}) {
	return _markdown(text, nofollow, target, toc_id_prefix, renderer, enable_toc);
}

/**
 * Equivalent to {@link markdown} with <tt>renderer=RENDERER_WIKI</tt>.
 * @param {string} text
 * @param {boolean} [nofollow=false]
 * @param {string} [target=null]
 * @param {string} [toc_id_prefix=null]
 * @param {boolean} [enable_toc=false]
 * @returns {string} The rendered HTML.
 */
function markdownWiki({ text = arguments[0], nofollow = arguments[1], target = arguments[2], toc_id_prefix = arguments[3], enable_toc = arguments[4] } = {}) {
	return _markdown(text, nofollow, target, toc_id_prefix, RENDERER_WIKI, enable_toc);
}

exports.version = version;
exports.RENDERER_USERTEXT = RENDERER_USERTEXT;
exports.RENDERER_WIKI = RENDERER_WIKI;
exports.markdown = markdown;
exports.markdownWiki = markdownWiki;

