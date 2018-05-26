function allocString(str) {
	var bytes = new TextEncoder().encode(str);
	var ptr = wasm.malloc(bytes.length + 1 /* null terminator */);
	for (var i = 0; i < bytes.length; ++i) {
		HEAP8[ptr + i] = bytes[i];
	}
	HEAP8[ptr + i] = 0;
	return ptr;
}

function pointerStringify(ptr) {
	var nullByte = ptr;
	while (HEAP8[nullByte++]);
	return new TextDecoder('utf-8').decode(HEAP8.subarray(ptr, nullByte - 1));
}

function markdown(renderer, text, options) {
	if (typeof text !== 'string') text = '';
	var bytes = new TextEncoder().encode(text);
	var buf = wasm.malloc(bytes.length /* no null terminator */);
	for (var i = 0; i < bytes.length; ++i) {
		HEAP8[buf + i] = bytes[i];
	}
	var size = bytes.length;

	if (typeof options !== 'object' || options === null) options = {};
	var nofollow = options.nofollow ? 1 : 0;
	var target = typeof options.target === 'string' ? allocString(options.target) : 0;
	var toc_id_prefix = typeof options.tocIdPrefix === 'string' ? allocString(options.tocIdPrefix) : 0;
	var enable_toc = options.enableToc ? 1 : 0;

	var ptr = renderer(buf, size, nofollow, target, toc_id_prefix, enable_toc);
	var string = pointerStringify(ptr);

	wasm.free(ptr);
	wasm.free(toc_id_prefix);
	wasm.free(target);
	wasm.free(buf);

	return string;
}

/**
 * Render markdown `text` to an HTML string using the usertext renderer.
 * Equivalent to python: `markdown`.
 */
function markdownDefault(
	text /*: string */,
	options /*: ?{
		nofollow,    // Whether to add `rel="nofollow"` to all links.
		target,      // The `target` property of all links.
		enableToc,   // Whether to create a table of contents (Reddit does not use this to generate their TOC).
		tocIdPrefix, // Added to the `id` of each TOC link, i.e. `#PREFIXtoc_0`.
	} */
) /*: string */ {
	return markdown(wasm.default_renderer, text, options);
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
	return markdown(wasm.wiki_renderer, text, options);
}

export {
	markdownDefault as markdown,
	markdownWiki
};
