const { config: { dev, prod } } = require('./config');
const path = require('path');
const spriteOptions = {
	groupBy: image => {
		const group = /_(\w+@*[23]*x?)(?!=\.)/gm.exec(image.url)[1];
		return image.url.indexOf(group) > -1
			? Promise.resolve(group)
			: Promise.reject(new Error('File must have group name after "_".'));
	},
	filterBy: image => /sprite/.test(image.url)
		? Promise.resolve()
		: Promise.reject(new Error('Sprite images must in "sprite folder".')),
	spritesmith: {
		padding: 2
	},
	svgsprite: {
		shape: {
			spacing: {
				padding: 2
			}
		}
	}
};
const spriteHook = {
	hooks: {
		onUpdateRule: (rule, token, image) => {
			const extraUnit = path.parse(image.spriteUrl).ext.match(/\.svg/) ? -1 : 1;
			let backgroundSizeX = (image.spriteWidth / image.coords.width) * 100;
			let backgroundSizeY = (image.spriteHeight / image.coords.height) * 100;
			let backgroundPositionX = (image.coords.x / (image.spriteWidth - image.coords.width)) * 100 * extraUnit;
			let backgroundPositionY = (image.coords.y / (image.spriteHeight - image.coords.height)) * 100 * extraUnit;
			backgroundSizeX = isNaN(backgroundSizeX) ? 0 : backgroundSizeX;
			backgroundSizeY = isNaN(backgroundSizeY) ? 0 : backgroundSizeY;
			backgroundPositionX = isNaN(backgroundPositionX) ? 0 : backgroundPositionX;
			backgroundPositionY = isNaN(backgroundPositionY) ? 0 : backgroundPositionY;
			const backgroundSize = {
				type: 'decl',
				prop: 'background-size',
				value: `${Math.floor(backgroundSizeX * 10) / 10}% ${Math.floor(backgroundSizeY * 10) / 10}%`
			};
			const backgroundPosition = {
				type: 'decl',
				prop: 'background-position',
				value: `${Math.floor(backgroundPositionX * 10) / 10}% ${Math.floor(backgroundPositionY * 10) / 10}%`
			};
			const backgroundRepeat = {
				type: 'decl',
				prop: 'background-repeat',
				value: 'no-repeat'
			};
			const backgroundImage = {
				type: 'decl',
				prop: 'background-image',
				value: `url(${image.spriteUrl})`
			};
			token.cloneAfter(backgroundImage).cloneAfter(backgroundPosition)
				.cloneAfter(backgroundSize);
			if (backgroundPositionX === 0 || backgroundPositionY === 0) {
				token.cloneAfter(backgroundRepeat);
			}
		},
		onSaveSpritesheet: (opts, spritesheet) => path.join(
			opts.spritePath,
			`${spritesheet.groups[0]}.${spritesheet.extension}`
		)
	}
};

module.exports = ({ mode }) => {
	const spritePath = mode === 'production' ? prod.ImagesOutputPath : dev.ImagesOutputPath;
	return {
		plugins: [
			require('autoprefixer'),
			require('postcss-sprites')(Object.assign({ spritePath }, spriteOptions, spriteHook))
		]
	};
};
