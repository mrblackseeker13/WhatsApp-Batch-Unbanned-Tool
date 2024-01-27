function doGet () {
  return HtmlService.createTemplateFromFile('index').evaluate().setTitle('WhatsApp 解封提交工具').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

function include (filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent()
}

/**
* Set up a table to store data
 * TODO: Need to be put into the form ID
 */
const sheet = SpreadsheetApp.openById('Input Sheet ID')
// Store remaining times，The table is named by default Data
const getSheetData = sheet.getSheetByName('Data').getRange('A1')
// Store unblocking results，The table is named by default Result
const getResultSheet = sheet.getSheetByName('Result')

// Remaining usage
function getUsage () {
  return getSheetData.getValue()
}

// Number of unblocked
function unblockCount () {
  return getResultSheet.getRange('A:A').getValues().length
}

// Update usage
function resetData () {
  getSheetData.setValue(MailApp.getRemainingDailyQuota())
  successfulUnblock()
}

// Get successfully unblocked number
function successfulUnblock () {
  const thread = GmailApp.getInboxThreads()
  const result = []
  for (const mail of thread) {
    const content = mail.getMessages()[0].getBody()
    // The words successfully unblocked
    if (content.indexOf('removed the ban') > -1) {
      // Filter out numbers
      const phoneNumber = content.replace(/\n|request #.+|<.*?>|. days|[^0-9]/g, '')
      result.push([phoneNumber])
    } // End if
  }
  // Exclude duplicates
  const newArray = unique(result)
  getResultSheet.getRange(1, 1, newArray.length, 1).setValues(newArray)
}

/**
 * @description Check unblocking status
 * @param {Array} phoneNumArray - Query number
 * @returns {Array} search result
 */
function queryState (phoneNumArray) {
  const value = getResultSheet.getRange('A:A').getValues()
  // Set new array
  const newValue = []
  for (let i = 0; i < value.length; i++) {
    newValue.push(value[i].toString())
  }
  const result = []
  for (const phoneNumber of phoneNumArray) {
    if (newValue.indexOf(phoneNumber.replace(/[^0-9]/g, '')) > -1) {
      // unbaned
      result.push([phoneNumber, 'Unblocked'])
    } else {
      // still banned
      result.push([phoneNumber, 'Not unblocked'])
    } // End if
  } // End for of
  return result
}

/**
 * @description Array excludes duplicates and null values
 * @param {Array} arr - array
 * @returns {Array} new array
 */
function unique (arr) {
  const map = {}
  const newArray = []
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i]
    if (value[0]) {
      if (map[value]) continue
      else {
        map[value] = 1
        newArray.push(arr[i])
      } // End if
    } // End if
  }
  return newArray
}

/**
 * @description Randomly generate letter templates
 * @param {string} phone - letter writing template
 * @returns {string} Generated template
 */
function unBlockTemplate (phone) {
  // TODO: Need to set up a template for writing letters，and put in phone variable
  const template = [
  ]
  // Generate random numbers
  const index = Math.floor((Math.random() * template.length))
  return template[index]
}

/**
 * @description send email
 * @param {string} phoneNumber - phone number
 * @returns {string} Finish
 */
function sendEmail (phoneNumber) {
  // Get the remaining times
  let usage = getUsage()
  phoneNumber.forEach(function (phone) {
    usage--
    // Check whether the upper limit has been reached
    if (usage === 0) {
      return 'The remaining times have been used up'
    }
    /**
     * send email
     * TODO: Need to set the title of the sent email
     */
    MailApp.sendEmail('support@support.whatsapp.com', 'Input Email Title', unBlockTemplate(phone))
    // Record remaining times
    getSheetData.setValue(usage)
  })
  return 'Submission completed！Please wait，Please do not resubmit！'
}
