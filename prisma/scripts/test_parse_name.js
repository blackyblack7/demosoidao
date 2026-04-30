function parseName(fullName) {
  if (!fullName) return null;
  // split by double space or tab
  const parts = fullName.split(/\s{2,}|\t/);
  let firstPart = parts[0] ? parts[0].trim() : '';
  let lastName = parts[1] ? parts[1].trim() : '';

  // If there's no double space, try single space
  if (!lastName) {
      const parts2 = fullName.split(/\s+/);
      firstPart = parts2[0] ? parts2[0].trim() : '';
      lastName = parts2.slice(1).join(' ').trim();
  }

  const prefixes = ['เด็กชาย', 'เด็กหญิง', 'นางสาว', 'นาย', 'นาง'];
  let prefix = '';
  let firstName = firstPart;

  for (const p of prefixes) {
    if (firstPart.startsWith(p)) {
      prefix = p;
      firstName = firstPart.substring(p.length).trim();
      break;
    }
  }

  return { prefix, firstName, lastName };
}

console.log(parseName('เด็กชายปฏิภาณ  ยินดี'));
console.log(parseName('นายสมชาย รักดี'));
