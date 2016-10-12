/* global require */
(function() {'use strict';
	var gulp = require('gulp');
	var replace = require('gulp-replace');
	var uglify = require('gulp-uglify');
	var concat = require('gulp-concat');

	gulp.task('build', ['norequire'], function() {
		return gulp.src(['header.js', 'build/snudowncore.js', 'snudown.js', 'footer.js'])
			.pipe(concat('snudown.js'))
			.pipe(uglify({ preserveComments: 'license' }))
			.pipe(gulp.dest('dist'));
	});

	// Remove `require()` calls from compiled code
	// (used for filesystem operations, but aren't removed by `-s NO_FILESYSTEM=1`)
	gulp.task('norequire', function() {
		return gulp.src('build/snudowncore.js')
			.pipe(replace(/require\((['"`])[^'"`]+\1\)/g, '{}/*removed `$&`*/'))
			.pipe(gulp.dest('build'));
	});
})();
