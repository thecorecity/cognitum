import {defineConfig} from "vite";
import {node} from "@liuli-util/vite-plugin-node";
import * as fs from "node:fs";
import * as path from "node:path";

const categoriesDir = "lib/categories";
const commandsDir = "lib/commands";

export default defineConfig({
	build: {
		rollupOptions: {
			input: {
				index: "./index.js",
				shard: "./shard.js",
				...(
					fs
						.readdirSync(`./${categoriesDir}`)
						.reduce((mapping: Record<string, string>, fileName) => {
							mapping[`${categoriesDir}/${path.basename(fileName, path.extname(fileName))}`] = `./${categoriesDir}/${fileName}`;
							return mapping;
						}, {})
				),
				...(
					fs
						.readdirSync(`./${commandsDir}`)
						.reduce((mapping: Record<string, string>, dirName) => {
							fs
								.readdirSync(`./${commandsDir}/${dirName}`)
								.forEach(fileName => {
									mapping[`${commandsDir}/${dirName}/${path.basename(fileName, path.extname(fileName))}`] = `./${commandsDir}/${dirName}/${fileName}`
								});

							return mapping;
						}, {})
				),
			},
			output: {
				dir: "dist",
				entryFileNames: '[name].js',
				chunkFileNames: 'lib/chunks/[name].[hash].js'
			},
		},
		emptyOutDir: true,
		commonjsOptions: {
			transformMixedEsModules: true
		}
	},
	plugins: [
		node(),
		{
			name: 'pass-config-defaults-and-translations',
			enforce: 'post',
			generateBundle() {
				fs.cpSync("./config", "./dist/config", {recursive: true});
				fs.cpSync("./lang", "./dist/lang", {recursive: true});
			}
		}
	]
});
