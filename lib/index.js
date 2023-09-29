#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import request from 'request'
import { program } from 'commander'
import chalk from 'chalk'

const error = chalk.red
const success = chalk.green
const warning = chalk.yellow

program
  .version('1.0.1')
  .name('imgsaver')
  .description('a tool that downloads remote images and replaces them with local versions')
  .option('-d, --directory <directory>', 'directory to search for files in')
  .option('-o, --output <output>', 'output directory for downloaded images')
  .option('-p, --prefix <prefix>', '(Optional) prefix for downloaded images, when specified, the prefix will be prepended to the image name and the output directory will be ignored. For example, if the prefix is "images/", the image will be replaced with "images/myimage.png"')
  .option('-i, --ignore [ignore]', "(Optional) ignore files with the specified extension. For example: '.md' will ignore all markdown files", val => val.trim().split(','), [])
  .option('-s, --silent', '(Optional) do not output any logs')
  .parse(process.argv)

const options = program.opts()

if (!options.directory) {
  console.error(error('Error: Please specify a directory to search for files in'))
  process.exit(1)
}

if (!options.output) {
  console.error(error('Please specify an output directory for downloaded images'))
  process.exit(1)
}

// The directory to search for files in
const directory = options.directory

// Function to search for remote images in files
const searchForRemoteImages = dir => {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file)
    if (fs.lstatSync(filePath).isDirectory()) {
      // Recursively search for files in subdirectories
      searchForRemoteImages(filePath)
    } else if (options.ignore.includes(path.extname(filePath))) {
      // ignore files with the specified extension
      return
    } else {
      // Read the contents of the file
      let fileData = fs.readFileSync(filePath, 'utf-8')
      // find all the urls
      // Regex from here: https://regexr.com/39nr7
      let urls = fileData.match(/\b(?:https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]/gi)

      if (urls) {
        urls.forEach(url => {
          // clean the url
          // sometimes, the url will have a '(' at the start
          url = url.replace('(', '')
          request.head(url, async (err, res) => {
            if (err) {
              //return console.error(err)
            }
            // Check if the Content-Type header indicates that the URL is an image
            if (
              res && res.headers && res.headers['content-type'] &&
              res.headers['content-type'].startsWith('image')) {
              // download the remote image
              let fileName = await downloadRemoteImage(url)

              // replace the remote image url with local
              // use prefix if exists
              if (options.prefix) {
                fileData = fileData.replace(url, `${options.prefix}${fileName}`)
              } else {
                fileData = fileData.replace(url, `${options.output}/${fileName}`)
              }

              const msg = warning(`[+] ${filePath}`) + ` Replaced ${success(url)} with ${success(`${options.output}/${fileName}`)}`
              !options.silent && console.log(msg)
              // write the contents of the file back to the file
              fs.writeFileSync(filePath, fileData)
            }
          })
        })
      }
    }
  })
}

const downloadRemoteImage = url => {
  return new Promise((resolve, reject) => {
    request.head(url, (err, res) => {
      if (err) {
        return reject(err)
      }
      // Determine the file extension from the Content-Type header
      let extension = '.' + res.headers['content-type'].split('/')[1]
      // Generate a random file name
      // let fileName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      // use timestamp for name
      let fileName = Date.now()

      request(url)
        .pipe(fs.createWriteStream(path.join(options.output, fileName + extension)))
        .on('close', () => {
          resolve(fileName + extension)
        })
    })
  })
}

// show starting message
options.silent && console.log(`${success('[*]')} Searching for remote images in ${directory}`)

// Create the output directory if it doesn't exist
if (!fs.existsSync(options.output)) {
  options.silent && console.log(`${success('[+]')} Creating output directory ${options.output}`)
  fs.mkdirSync(options.output)
}

// Start the search
try {
  searchForRemoteImages(directory)
} catch (error) {
  
}
