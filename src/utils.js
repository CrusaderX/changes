const uniq = (value, index, self) => {
  return self.indexOf(value) === index
}

const changedServices = (files, exclude, folder) => {
  const isExclude = true 
    ? exclude.length > 0 && exclude !== ''
    : false 

  const isDefaultFolder = true
    ? folder === '.'
    : false

  const result = isDefaultFolder
    ? files
      .map(file => file.split('/').at(0))
      .filter(file => !file.startsWith('.'))
      .filter(uniq)
    : files
      .filter(file => file.startsWith(folder))
      .map(file => file.substring(folder.length + 1))
      .map(file => file.split('/').at(0))
      .filter(file => !file.startsWith('.'))
      .filter(uniq)
    
  return isExclude
    ? result.filter(file => !exclude.includes(file))
    : result
}

const getInputList = (items) => {
  const isValue = [...items]

  if (isValue.length === 1) return isValue

  const isArray = items
    .split('\n')
    .join(',')
    .split(',')

  return isArray
    .filter((n) => n)
    .map((n) => n.trim())
}

module.exports = { changedServices, getInputList }