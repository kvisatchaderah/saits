//
// настройки проекта
//

// версия сайта
let location = 'kor'
// 'myt' // 'balnyishop'
// 'kor'
// 'pushka'
// 'shelk'
// 'him'
// 'dol'

// footer-line__contacts
// forma
// top-menu__fixed

// состояние разработки сайта
const production = true

// папка на хостинге
const project_folder = `sait-${location}`
// `sait-${location}`
// `simpla_1`
const template_folder = 'public_html/design/template'
const folder = `${project_folder}/${template_folder}`

//
// SRC правила
//

// хедер
const header_src = [
	`app/top-menu__fixed/${location}.html`,
	'app/banner-index/*.html',
]

// index.html
const index_html = [
	// index
	{
		type: 'page',
		id: 1,
		src: ['app/catalog__tab/*.html', 'app/faq/*.html'],
	},
	// разработка
	{
		type: 'category',
		id: 54,
		src: [
			'app/catalog__tab__calculate/*.html',
			'app/click-block/*.html',
			'app/gallery__pages/*.html',
		],
	},
	// продвижение
	{
		type: 'category',
		id: 67,
		src: ['app/pages/promotion.html'],
	},
	// сопровождение
	{
		type: 'category',
		id: 58,
		src: ['app/pages/soprovojdenie.html'],
	},
	// наши работы
	{
		type: 'category',
		id: 68,
		src: ['app/gallery-catalog/*.html'],
	},
]

// футер
const footer_src = [
	'app/forma/index.html',
	`app/forma/${location}.php`,
	'app/footer__pages-list/*.html',
	`app/footer-line__contacts/${location}.html`,
	// общие элементы
	'app/progress-bar/*.html',
	'app/go-top__quadr/*.html',
]

//images
const images_src = [
	'app/**/*.jpg',
	'app/__template/**/*.jpg',

	'app/**/*.svg',
	'app/__template/**/*.svg',

	'app/**/*.png',
	'app/__template/**/*.png',

	'app/**/*.webp',
	'app/__template/**/*.webp',

	'app/**/*.ico',
	'app/__template/**/*.ico',
]

// js
const js_src = ['app/__template/*.js', 'app/**/*.js']

// sass
const sass_src = [
	'app/__template/display-preset.sass',
	'app/__template/display-preset--day.sass',
	'app/__template/display-preset--night.sass',
	'app/**/display-preset.sass',
	'app/__template/*.sass',
	'app/**/*.sass',
]

const json_src = ['app/**/*.json'] // json
const files_src = ['app/**/*.doc'] // files

// доступы к хостингу
const odinpromptt = {
	host: '188.225.21.131',
	login: 'odinpromptt',
	pass: 'RRram73689977368997',
}
const balnyishop = {
	host: '92.53.96.71',
	login: 'balnyishop',
	pass: 'Rram73689977368997',
}
let base_ftp
if (location == 'myt') {
	base_ftp = balnyishop
} else {
	base_ftp = odinpromptt
}

//
// подключение модулей
//

const { src, dest, series, watch } = require('gulp') // галп
const sass = require('gulp-sass')(require('sass'))
const csso = require('gulp-csso')
const html_min = require('gulp-htmlmin')
const auto_prefixer = require('gulp-autoprefixer')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify-es').default
const image_min = require('gulp-imagemin')
const ftp = require('vinyl-ftp')
const del = require('del')
const set_header = require('gulp-header')
const set_footer = require('gulp-footer')
const gulp_if = require('gulp-if')

// неиспользуемые
const sync = require('browser-sync').create() // создание локал хоста

//
// основное тело галпа
//

// функция подключения к ФТП
const get_ftp_access = () => {
	return ftp.create({
		host: `${base_ftp.host}`,
		user: `${base_ftp.login}`,
		pass: `${base_ftp.pass}`,
	})
}
const access = get_ftp_access()

// создание header.tpl
const build_header = () => {
	return src(header_src)
		.pipe(concat('header.tpl'))
		.pipe(
			html_min({
				collapseWhitespace: true,
				removeComments: true,
				removeTagWhitespace: true,
				ignoreCustomFragments: [
					/<svg.*\/svg>/,
					/<\?php.*\?>/,
					/{php}.*{\/php}/,
				],
			})
		)
		.pipe(access.dest(`${folder}/html`))
}

// создание footer.tpl
const build_footer = () => {
	return src(footer_src)
		.pipe(concat('footer.tpl'))
		.pipe(
			html_min({
				collapseWhitespace: true,
				removeComments: true,
				removeTagWhitespace: true,
				ignoreCustomFragments: [
					/<svg.*\/svg>/,
					/<\?php.*\?>/,
					/{php}.*{\/php}/,
				],
			})
		)
		.pipe(access.dest(`${folder}/html`))
}

//
// создание index_content.tpl
//

// очистка папки local
const del_local = () => {
	return del('local/')
}

// создание локальных индексов
const build_local_file = (data) => {
	return src(data.src)
		.pipe(concat(`${data.type}_${data.id}.html`))
		.pipe(
			html_min({
				collapseWhitespace: true,
				removeComments: true,
				removeTagWhitespace: true,
				ignoreCustomFragments: [
					/<svg.*\/svg>/,
					/<\?php.*\?>/,
					/{php}.*{\/php}/,
				],
			})
		)
		.pipe(set_header(`{if $${data.type}->id == ${data.id}}`))
		.pipe(set_footer(`{/if}`))
		.pipe(dest('local/'))
}

// создание папки local
const build_local = async () => {
	for (let i = 0; i < index_html.length; i++) {
		await build_local_file(index_html[i])
	}
	return
}

// экспорт папки local
const build_index = () => {
	return src('local/*.html')
		.pipe(concat('index_content.tpl'))
		.pipe(access.dest(`${folder}/html`))
}

//
// сбор всех scss из папки src и перенос css в папку дист
//

const build_sass = () => {
	return src(sass_src)
		.pipe(concat('style.sass'))
		.pipe(
			sass({
				indentedSyntax: false,
			})
		)
		.pipe(
			auto_prefixer({
				overrideBrowserslist: 'last 2 versions',
			})
		)
		.pipe(concat('style.min.css'))
		.pipe(gulp_if(!production, csso()))
		.pipe(access.dest(`${folder}/css`))
}

//
// сбор всех js из папки src и перенос их в папку дист
//

const build_js = () => {
	return src(js_src)
		.pipe(concat('script.min.js'))
		.pipe(gulp_if(!production, uglify()))
		.pipe(access.dest(`${folder}/js`))
}

//
// сбор всех фаилов и перенос их в папку дист
//

const export_images = () => {
	return src(images_src).pipe(access.dest(`${folder}/images`))
}
const export_json = () => {
	return src(json_src).pipe(access.dest(`${folder}/json`))
}
const export_files = () => {
	return src(files_src).pipe(access.dest(`${folder}/files`))
}

//
// минимизация всех изображений в папке src/app и записывание их на то же место
//

const get_src_min_img = () => {
	return src('src/**/*')
		.pipe(
			image_min([
				image_min.gifsicle({ interlaced: true }),
				image_min.mozjpeg({
					quality: 75,
					progressive: true,
				}),
				image_min.optipng({
					optimizationLevel: 5,
				}),
				image_min.svgo({
					plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
				}),
			])
		)
		.pipe(dest('src/'))
}
const get_app_min_img = () => {
	return src('app/**/*')
		.pipe(
			image_min([
				image_min.gifsicle({ interlaced: true }),
				image_min.mozjpeg({
					quality: 75,
					progressive: true,
				}),
				image_min.optipng({
					optimizationLevel: 5,
				}),
				image_min.svgo({
					plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
				}),
			])
		)
		.pipe(dest('app/'))
}

//
// to watch
//

const toWatch = () => {
	for (let i = 0; i < index_html.length; i++) {
		watch(
			index_html[i].src,
			series(build_local, build_index, build_local, build_index)
		)
	}
	watch(header_src, series(build_header))
	watch(footer_src, series(build_footer))
	watch(sass_src, series(build_sass))
	watch(js_src, series(build_js))

	watch(images_src, series(export_images))
	watch(json_src, series(export_json))
	watch(files_src, series(export_files))
}

//
// объявление функции для консоли
//

exports.del = series(del_local) // очистка папки локал
exports.min = series(get_app_min_img, get_src_min_img) // минимизация всех изображений в папке src

// выполнение всех программ и ватчинг
exports.default = series(
	build_header,
	build_footer,
	build_local,
	build_index,
	build_sass,
	build_js,

	export_images,
	export_json,
	export_files,

	toWatch
)
