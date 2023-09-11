const fs = require('fs')
const path = require('path')

if (!process.argv.slice(2).length) {
  throw 'Please provide the name of the App script e.g. npm run read -- app.json.'
}
const fileName = process.argv.slice(2)[0]

try {
  const data = fs.readFileSync(fileName, 'utf8')
  const jsonData = JSON.parse(data)
  parseAppFiles(jsonData)
} catch (error) {
  console.error('Error reading/parsing JSON file:', error)
}

function parseAppFiles(data) {
  try {
    const { files } = data
    files.forEach(createFiles)
    createStructureMap(files)
  } catch (error) {
    console.error('Error parsing app files:', error)
  }
}

function createFiles(file) {
  const { name, type, source } = file

  fs.writeFile(getOutPath(name, type), source, (err) => {
    if (err) {
      console.error(`Error writing "${name}.${type}":`, err)
    } else {
      console.log(`"${name}.${type}" created successfully`)
    }
  })
}

function getOutPath(name, type) {
  const dirPath = getDirPath(name, type)
  createDir(dirPath)
  return path.join(dirPath, `${getFileName(name)}.${getFileType(type)}`)
}

function getDirPath(name, type) {
  switch (type) {
    case 'html':
      return `./src/templates/${getSubDir(name)}/`

    case 'server_js':
      return `./src/js/${getSubDir(name)}/`

    default:
      return './src/';
  }
}

function getSubDir(name) {
  const components = name.split('-')
  if (components.length === 1) {
    return ''
  }
  const type = components[0].split('_')
  return type.length > 1 && Number(type[0]) === NaN ? '' : type[1]
}

function getFileName(name) {
  const fileName = name.split('-')
  return fileName.length > 1 ? fileName[1] : name
}

function getFileType(type) {
  return type === 'server_js' ? 'js' : type
}

function createDir(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true })
  }
}

function createStructureMap(files) {
  const structureMap = {}
  for (const file of files) {
    const subDir = getSubDir(file.name)
    if (subDir) {
      structureMap[subDir] = file.name.split('_')[0]
    }
  }

  fs.writeFile(getOutPath('structureMap', 'json'),
    JSON.stringify(structureMap, null, 2), (err) => {
      if (err) {
        console.error('Error writing "structureMap.json":', err)
      } else {
        console.log('"structureMap.json" created successfully')
      }
    })
}
