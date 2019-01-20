/**
 * Render markdown `text` to an HTML string using the usertext renderer.
 * Equivalent to python: `markdown`.
 */
function markdown(
	text /*: string */,
	options /*: ?{
		nofollow,    // Whether to add `rel="nofollow"` to all links.
		target,      // The `target` property of all links.
		enableToc,   // Whether to create a table of contents (Reddit does not use this to generate their TOC).
		tocIdPrefix, // Added to the `id` of each TOC link, i.e. `#PREFIXtoc_0`.
	} */
) /*: string */ {
	return _markdown(_default_renderer, text, options);
}

/**
 * Render markdown `text` to an HTML string using the wiki renderer.
 * Equivalent to python: `markdown`.
 */
function markdownWiki(
	text /*: string */,
	options /*: ?{
		nofollow,    // Whether to add `rel="nofollow"` to all links.
		target,      // The `target` property of all links.
		enableToc,   // Whether to create a table of contents (Reddit does not use this to generate their TOC).
		tocIdPrefix, // Added to the `id` of each TOC link, i.e. `#PREFIXtoc_0`.
	} */
) /*: string */ {
	return _markdown(_wiki_renderer, text, options);
}

function _stackAllocString(str) {
	// https://github.com/kripken/emscripten/blob/3ebf0eed375120626ae5c2233b26bf236ea90046/src/preamble.js#L148
	// at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
	var len = (str.length << 2) + 1;
	var ptr = stackAlloc(len);
	stringToUTF8(str, ptr, len);
	return ptr;
}

function _markdown(renderer, text, options) {
	var stack = stackSave();

	if (typeof text !== 'string') text = '';
	var str = _stackAllocString(text);
	var size = lengthBytesUTF8(text); // excludes null terminator

	if (typeof options !== 'object' || options === null) options = {};
	var nofollow = options['nofollow'] ? 1 : 0;
	var target = typeof options['target'] === 'string' ? _stackAllocString(options['target']) : 0;
	var toc_id_prefix = typeof options['tocIdPrefix'] === 'string' ? _stackAllocString(options['tocIdPrefix']) : 0;
	var enable_toc = options['enableToc'] ? 1 : 0;

	var ptr = renderer(str, size, nofollow, target, toc_id_prefix, enable_toc);
	var string = UTF8ToString(ptr);

	_free(ptr);

	stackRestore(stack);

	return string;
}

window['markdown'] = markdown;
window['markdownWiki'] = markdownWiki;
})();
