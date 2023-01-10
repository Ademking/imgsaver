# ImgSaver

a tool that downloads remote images and replaces them with local versions. 

## Why

Sometimes, I use remote images in my markdown files. I wanted a tool that would download these images and replace them with local versions. This tool does exactly that. It searches for images in the specified directory and downloads them to the specified output directory. It then replaces the remote image with the local version.

## Usage

To use this tool, just run

```
npx imgsaver -d ./directory_to_search -o ./output_directory
```

## Options

| Option | Description |
| ------ | ----------- |
| -d, --directory <directory> | directory to search for files in |
| -o, --output <directory> | output directory for downloaded images |
| -p, --prefix <prefix> | (Optional) prefix for downloaded images. when specified, the prefix will be prepended to the image name and the output directory will be ignored. For example, if the prefix is "images/", the image will be replaced with "images/myimage.png" |
| -h, --help | display help for command |
| -i, --ignore [extensions] | (Optional) ignore files with the specified extension. For example: '.md,.html' will ignore all "markdown" and "html" files |
| -s, --silent | (Optional) do not output any logs |
| -V, --version | output the version number |

## Examples

```
$ npx imgsaver -d ./website -o ./website/images

$ npx imgsaver -d ./test -o ./test/img -p ./images/ -i .md,.html
```

## Contributing

If you find any bugs or have any suggestions, feel free to open an issue or submit a pull request.

## License

MIT

## Changelog

[1.0.0] Initial release.

## Author

[Adem Kouki](https://github.com/Ademking)