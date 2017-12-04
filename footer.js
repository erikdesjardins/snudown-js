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
	return _markdown('default_renderer', text, options);
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
	return _markdown('wiki_renderer', text, options);
}

function _markdown(fn, text, options) {
	if (typeof text !== 'string') text = '';
	var size = lengthBytesUTF8(text); // excludes null terminator

	if (typeof options !== 'object' || options === null) options = {};
	var nofollow = options['nofollow'] ? 1 : 0;
	var target = typeof options['target'] === 'string' ? options['target'] : null;
	var toc_id_prefix = typeof options['tocIdPrefix'] === 'string' ? options['tocIdPrefix'] : null;
	var enable_toc = options['enableToc'] ? 1 : 0;

	var ptr = ccall(
		fn,
		'number',
		['string', 'number', 'number', 'string', 'string', 'number'],
		[text, size, nofollow, target, toc_id_prefix, enable_toc]
	);
	var string = UTF8ToString(ptr);

	asm['_free'](ptr);

	return string;
}

window['markdown'] = markdown;
window['markdownWiki'] = markdownWiki;
})();
