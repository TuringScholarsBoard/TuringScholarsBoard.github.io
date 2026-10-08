let selectedButton = null;
let selectedOperation = '+';
let targetNumber;
let used = 0;
let puzzlesSolved = parseInt(localStorage.getItem('puzzlesSolved')) || 0;
let seenTargetNumbers = JSON.parse(localStorage.getItem('seenTargetNumbers')) || [];
let solvedTargetNumbers = JSON.parse(localStorage.getItem('solvedTargetNumbers')) || [];
let perfectTargetNumbers = JSON.parse(localStorage.getItem('perfectTargetNumbers')) || [];



function selectButton(button) {
  if (selectedButton === button) {
    // Deselect the button
    button.classList.remove('selected');
    selectedButton = null;
  } else {
    if (selectedButton) {
      // Perform the selected operation
      let valueToAdd = parseInt(selectedButton.textContent);
      let currentValue = parseInt(button.textContent);
      button.textContent = operate(valueToAdd, currentValue);
      used += 1;
      // Remove the previously selected button
      selectedButton.style.visibility = 'hidden';
      checkForWin(button.textContent);
      selectedButton = null;
      //Animation
      button.style.transform = 'scale(1.1)'
      // button.style.backgroundColor = '#d0dfe4';
      setTimeout(() => {
        button.style.transform = 'scale(1)'
        // button.style.backgroundColor = '#add8e6';
      }, 50);
    }
    else{
    // Select the current button
      button.classList.add('selected');
      selectedButton = button;
    }
  }
}

function selectOperation(operation) {
  selectedOperation = operation;
  // Update selected class for operations buttons
  let operationButtons = document.querySelectorAll('.operations .operation');
  operationButtons.forEach(function(button) {
    if (button.textContent === operation) {
      button.classList.add('selected');
    } else {
      button.classList.remove('selected');
    }
  });
}

function operate(value1, value2) {
  switch(selectedOperation) {
    case '+':
      return value1 + value2;
    case '-':
      return value1 - value2;
    case '*':
      return value1 * value2;
    case '/':
      if (value2 !== 0) {
        return value1 / value2;
      } else {
        return 'Error';
      }
    default:
      return 'Error';
  }
}

function checkForWin(value) {
  if (parseInt(value) === targetNumber) {
    document.body.classList.add('green-screen');
    puzzlesSolved++;
    localStorage.setItem('puzzlesSolved', puzzlesSolved);
    document.getElementById('counter').textContent = puzzlesSolved;
    updateSolvedTargetNumbers(targetNumber);
    if(used == 5){
      updatePerfectTargetNumbers(targetNumber);
    }
    // Refresh the page
    setTimeout(() => {
      window.location.reload();
    }, 350);
  }
}

function resetPuzzle() {
  document.body.classList.add('red-screen');
  // Refresh the page
  setTimeout(() => {
    window.location.reload();
  }, 250);
}

function updateSeenTargetNumbers(targetNumber) {
  if (!seenTargetNumbers.includes(targetNumber)) {
    seenTargetNumbers.push(targetNumber);
    localStorage.setItem('seenTargetNumbers', JSON.stringify(seenTargetNumbers));
  }
}

function updateSolvedTargetNumbers(targetNumber) {
  if (!solvedTargetNumbers.includes(targetNumber)) {
    solvedTargetNumbers.push(targetNumber);
    localStorage.setItem('solvedTargetNumbers', JSON.stringify(solvedTargetNumbers));
  }
}

function updatePerfectTargetNumbers(targetNumber) {
  if (!perfectTargetNumbers.includes(targetNumber)) {
    perfectTargetNumbers.push(targetNumber);
    localStorage.setItem('perfectTargetNumbers', JSON.stringify(perfectTargetNumbers));
  }
}

// Update the target number display


let numbers = [];
for (let i = 0; i < 6; i++) {
  numbers.push(Math.floor(Math.random() * 10) + 1);
}

let tempResult = numbers[0];
for (let i = 1; i < numbers.length; i++) {
  let randomOperation = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];
  console.log(tempResult, randomOperation);
  switch (randomOperation) {
    case '+':
      tempResult += numbers[i];
      break;
    case '-':
      tempResult -= numbers[i];
      break;
    case '*':
      tempResult *= numbers[i];
      break;
    case '/':
      if (numbers[i] != 0 && tempResult % numbers[i] === 0) {
        tempResult /= numbers[i];
      }
      else{
        tempResult += numbers[i];
      }
      break;
  }
}

targetNumber = tempResult;
updateSeenTargetNumbers(targetNumber)

document.getElementById('targetNumber').textContent = targetNumber;
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('counter').textContent = puzzlesSolved;
});
console.log("puzzles ", puzzlesSolved);

numbers = numbers.slice().sort(() => Math.random() - 0.5);

// Assign the random numbers to the buttons
let buttons = document.querySelectorAll('.button.number');
buttons.forEach(function(button, index) {
  button.textContent = numbers[index];
});

function resetButtons() {
  let buttons = document.querySelectorAll('.button.number');
  buttons.forEach(function(button, index) {
    button.textContent = numbers[index];
    button.style.visibility = 'visible';
    button.classList.remove('selected');
  });
  selectedButton = null;
  used = 0;
}


document.addEventListener('DOMContentLoaded', function() {
  const gridContainer = document.getElementById('gridContainer');
  // const gridContainer2 = document.getElementById('gridContainer2');
  gridContainer2.style.gridTemplateColumns = 'repeat(20, 10px)';
  gridContainer2.style.gridTemplateRows = 'repeat(50, 10px)';


  // Generate 1000 dots
  for (let i = 1; i <= 1000; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    console.log("dots", gridContainer);
    if (seenTargetNumbers.includes(i)) {
      dot.style.backgroundColor = '#e4e77e'; // Change color to yellow
    }
    
    if (solvedTargetNumbers.includes(i)) {
      dot.style.backgroundColor = '#a3c08b'; // Change color to green
      dot.style.color = '#759858';
    }

    if (solvedTargetNumbers.includes(-i)) {
      dot.style.backgroundColor = '#add8e6'; // Change color to blue
      dot.style.color = '#76c4df';
    }

    if (perfectTargetNumbers.includes(i) || perfectTargetNumbers.includes(-i)) {
      dot.textContent = '✦';
    }

    if(i <= 100){
      dot.style.height = '18px';
      dot.style.width = '18px'; //
      gridContainer.appendChild(dot);
    }
    else {
      gridContainer2.appendChild(dot);
    }

    // if (i <= 100) {

    // }

    // if ((i + 1) % 100 === 0 && i < 999) {
    //   const spacer = document.createElement('div');
    //   spacer.classList.add('space');
    //   gridContainer.appendChild(spacer);
    // }

    
  }
});
