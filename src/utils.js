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
        .map(file => file.shift())
        .filter(file => !file.startsWith('.'))
        .filter(uniq)
    : files
        .filter(file => file.includes(folder))
        .filter(file => !file.startsWith('.'))
        .map(file => file.at(1))
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