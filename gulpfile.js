/* global require */
(function() {'use strict';
	var gulp = require('gulp');
	var babel = require('gulp-babel');
	var replace = require('gulp-replace');
	var uglify = require('gulp-uglify');
	var concat = require('gulp-concat');
	var plumber = require('gulp-plumber');
	var eslint = require('gulp-eslint');

	gulp.task('build', ['norequire', 'babel'], function() {
		return gulp.src(['header.js', 'build/snudowncore.js', 'build/snudown.js', 'footer.js'])
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

	gulp.task('babel', function() {
		return gulp.src('snudown.js')
			.pipe(plumber())
			.pipe(babel({ nonStandard: false, blacklist: ['strict'] }))
			.pipe(plumber.stop())
			.pipe(gulp.dest('build'));
	});

	gulp.task('travis', function() {
		return gulp.src('snudown.js')
			.pipe(eslint())
			.pipe(eslint.formatEach())
			.pipe(eslint.failAfterError());
	});
})();

