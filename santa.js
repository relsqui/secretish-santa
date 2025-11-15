function setBody(...s) {
  document.body.innerHTML = s.join("");
}

function isDigit(c) {
  return "1234567890".includes(c);
}

function decodePadded(santaCode) {
  var decoded = atob(santaCode);
  var length = "";
  // I could use a regex but I haven't manually parsed a string in a while
  // figured I was due
  do {
    length += decoded[0];
    decoded = decoded.slice(1);
  } while (isDigit(decoded[0]));
  // trim in case we needed to add a space while encoding
  return decoded.slice(0, length).trim();
}

function readCode(santaCode) {
  var pageParts = [
    "<p>Your assignee is:</p>",
    `<h1>${decodePadded(santaCode)}</h1>`,
    "<p>Get them something nice!</p>",
  ];
  setBody(...pageParts);
}

function shuffle(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function encodePadded(data, padTo) {
  var padding = "";
  if (data.length < padTo) {
    if (isDigit(data[0])) {
      // we need to be able to parse a number off the beginning later
      // so add a space if the real data starts with a number
      data = " " + data;
    }
    var padLength = Math.max(0, padTo - data.length);
    // usually overkill, but we COULD randomly get all 1-digit numbers
    var randomNumbers = new Uint32Array(padLength);
    window.crypto.getRandomValues(randomNumbers);
    padding = randomNumbers.join("").toString().slice(0, padLength);
  }
  data = data.length.toString() + data + padding;
  return btoa(data);
}

function makeLink(santaCode, text = "Link") {
  var url = document.location.pathname + "?s=" + santaCode;
  return `<a href="${url}">${text}</a>`;
}

function setupNew(newSanta) {
  var names = newSanta.split(/[\r\n]+/g).map((n) => n.trim());
  var maxNameLength = Math.max(...names.map((n) => n.length));
  var shuffledNames = shuffle(names.slice());
  var codesByName = shuffledNames.reduce((assignees, name, i) => {
    var assignee = shuffledNames[(i + 1) % shuffledNames.length];
    // pad the names before encoding so you can't guess from link length
    assignees[name] = encodePadded(assignee, maxNameLength);
    return assignees;
  }, {});
  // not to be confused with a linked list
  var linkList = names
    .map((n) => {
      return `<li>${makeLink(codesByName[n], `${n}'s secret link`)}</li>`;
    })
    .join("");
  var pageParts = [
    "<h1>Distribute these links</h1>",
    "<p>Without clicking on them yourself! (Except yours.)</p>",
    `<ul>${linkList}</ul>`,
    "<a href='index.html'>Start over</a>",
  ];
  setBody(...pageParts);
}

function santa() {
  var santaCode = new URLSearchParams(window.location.search).get("s");
  var newSanta = new URLSearchParams(window.location.search).get("new");
  if (santaCode) {
    readCode(santaCode);
  } else if (newSanta) {
    setupNew(newSanta);
  }
}
