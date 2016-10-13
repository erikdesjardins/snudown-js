/* global require */
(function() {'use strict';
	var gulp = require('gulp');
	var replace = require('gulp-replace');
	var uglify = require('gulp-uglify');

	gulp.task('build', function() {
		return gulp.src('build/snudown.js')
			// Remove `require()` calls from compiled code
			// (used for filesystem operations, but aren't removed by `-s NO_FILESYSTEM=1`)
			.pipe(replace(/require\((['"`])[^'"`]+\1\)/g, '{}/*removed `$&`*/'))
			.pipe(uglify({ preserveComments: 'license' }))
			.pipe(gulp.dest('dist'));
	});
})();
