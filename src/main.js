import { updateFlags, displayOtherMeaningOptions } from './display.js';

let words;
let inputLang = "en", outputLang = "ja";

//The dictionnary file is dict/simplified_dictionnary.json
await fetch('../dict/simplified_dictionnary.json')
.then(response => response.json())
.then(data => {
    words = data.words;
})
.catch(error => console.error('Error loading JSON file:', error));

async function setLang(inputCharType){
  if (inputCharType == "roman"){
    inputLang = "en";
    outputLang = "ja";
  }
  else if (inputCharType == "kana"){
    inputLang = "ja";
    outputLang = "en";
  }
  else if (inputCharType == "kanji"){
    inputLang = "ja";
    outputLang = "en";
  }
  else throw "Invalid inputCharType";
}

function offerNextTranslation(){}

// Detects character type, handles it and calls dictionaryLookup
async function fetchAndTranslate(inputString) {
  inputString = inputString.toLowerCase();
  let inputCharType = "undefined";
  let firstChar = inputString.charAt(0);
  if (firstChar.match(/[a-zA-Z]/)){
    inputCharType = "roman";
  }
  else if (firstChar.match(/[\u3040-\u309F]/)){
    inputCharType = "kana";
  }
  else if (firstChar.match(/[\u4E00-\u9FAF]/)){
    inputCharType = "kanji";
  }
  else throw "Invalid inputCharType";

  await setLang(inputCharType);
  updateFlags(inputLang, outputLang);
  return dictionnaryLookup(inputString, inputCharType);
}

//finds inputString matches in the dictionnary 
async function dictionnaryLookup(inputString, inputCharType){
  let index, matches = [];
  let inputStrLen = inputString.length;
  switch (inputCharType){
    case "roman":
      index = "e";
      break;
    case "kanji":
      index = "kj";
      break;
    case "kana":
      index = "kn";
      break;
  }

  for (let element of words) {
    if (inputString == element[index]){
      if (index == "e") matches.push([element["kj"], element["kn"]]);
      else matches.push(element["e"]);
    }
  }
  console.log(matches)
  return matches;
}

let possibleTranslations = [];
let index = 0;

async function displayTranslation(currentIndex){
  //if undefined return, no words wecurrentIndexre found - display no translation.
  if (possibleTranslations[0] == undefined) {
    document.getElementById("output").innerText = "No translation found.";
    return;
  }
  //if there are multiple options, it's kanji and kana, so it's en to jp
  else if (possibleTranslations[currentIndex].length > 1
      && !possibleTranslations[currentIndex][1].match(/[a-zA-Z]/) ) {
    document.getElementById("output").innerText = 
      "Kanji: " + possibleTranslations[currentIndex][0] + 
      "\nKana: " + possibleTranslations[currentIndex][1];
  }
  else document.getElementById("output").innerText =
    "English: " + possibleTranslations[currentIndex];
  document.getElementById("translation-info").innerText =
    "Translation " + (1+index) + " of " + possibleTranslations.length;
}

//handle arrow presses and display the next translation
window.nextTranslation = function(direction){
  if (direction == "right"){
    if (index == possibleTranslations.length - 1) index = 0;
    else index++;
  }
  else if (direction == "left"){
    if (index == 0) index = possibleTranslations.length - 1;
    else index--;
  }
  else throw "Invalid direction";
  displayTranslation(index);
}

//call on form input event
async function handleInput(inputString) {
  possibleTranslations = await fetchAndTranslate(inputString);
  index = 0;
  displayOtherMeaningOptions(possibleTranslations.length);
  displayTranslation(index);
}

addEventListener("keydown", function(event) {
  if (event.key == "ArrowRight" || event.key == "ArrowDown")
    nextTranslation("right");
  else if (event.key == "ArrowLeft" || event.key == "ArrowUp")
    nextTranslation("left");
});

//Event listeners
document.getElementById('input').addEventListener('input', function(event) {
  //if the input is empty, clear the output
  if (event.target.value == "") {
    document.getElementById("output").innerText = "Start typing for a translation!";
    return;
  }
  handleInput(event.target.value);
});