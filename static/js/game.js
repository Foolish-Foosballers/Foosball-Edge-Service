"use strict";

var yellow = { name: "Player One", score: 0 };
var black = { name: "Player Two", score: 0 };
var gameTime = { minutes: 0, seconds: 0 };
var gameIsPaused = false;
var gameIsOver = false;
var gameIsSaved = false;

/**
 * Document ready lifecycle method
 */
$(function() {

	// bind the updateGameState function to the pause / play button
	$('#pause-play').on('click', updateGameState);

	// Populate inputs in edit modal
	$("#button--edit-game").click(function() {
		// Pause the game
		gameIsPaused = true;
		$('#pause-play').html('<i class="fa fa-play fa-3x" aria-hidden="true"></i>');
		
		// Place the content in the modal
		$("[name='black-name--modal']").val(black.name);
		$("[name='yellow-name--modal']").val(yellow.name);	
		$("[name='black-score--modal']").val(black.score);        
		$("[name='yellow-score--modal']").val(yellow.score);
	});

	// Reset scores if game is restarted
	$("#button--restart-game").click(function() {
		editScore(0, 0);
		gameIsSaved = false;
		$("#button--save-game").prop("disabled", true);		
		restartGame();
	});

	// Update model and view with edited values
	$("#button--edit-confirm").click(function() {
		editNames($("[name='black-name--modal']").val(), $("[name='yellow-name--modal']").val());
		editScore($("[name='black-score--modal']").val(), $("[name='yellow-score--modal']").val());
	});

	// Save game to json file and alert user game saved
	$("#button--save-game").click(function() {
		var gameData = JSON.stringify({"bScore": black.score, "yScore": yellow.score, "bName": black.name, "yName": yellow.name});
		$.get("endgame",{"gameData":gameData}, 
			function(data) {
				gameIsSaved = true;
				var popUp = document.getElementById('alert--game-saved');
				popUp.classList.add("game-saved");
				popUp.classList.remove("hidden");
				$("#button--save-game").prop("disabled", true);
				popUp.addEventListener("webkitAnimationEnd", function() {
					popUp.classList.remove('game-saved');
					popUp.classList.add("hidden");
				});
			}
		);
	});

	// Pull up quit modal if trying to quit without saving
	$("#button--quit-game").click(function() {
		if (!gameIsSaved) {
			console.log("warning");
			$('#quit--modal').modal('show');
		} else {
			$("#quit--form").submit();
		}
	});
});

/**
 * Updates yellow/black player score based on received input (1 or 0)
 * @param {int} blackScored 1 if black scored, else 0
 * @param {int} yellowScored 1 if yellow scored, else 0
 */
function updateScore(blackScored, yellowScored) {
	if (!gameIsPaused && !gameIsOver) {
		if (blackScored) {
				black.score++;
		} else if (yellowScored) {
				yellow.score++;
		}
		setScores();
		
		if (yellow.score >= 5 && yellow.score - black.score >= 2) {
			console.log("yellow wins");
			endGame();
		} else if (black.score >= 5 && black.score - yellow.score >= 2) {
			console.log("black wins");
			endGame();
		}
	}
}

/**
 * Changes both player scores to match the input values
 * @param {Number} blackScore New black player score
 * @param {Number} yellowScore New yellow player score
 */
function editScore(blackScore, yellowScore) {
	black.score = blackScore;
	yellow.score = yellowScore;
	setScores();
}

/**
 * Updates score elements on game page with current stored scores
 */
function setScores() {
	$("#black--score").text(black.score);
	$("#yellow--score").text(yellow.score);
}

/**
 * Changes both player names to match the input values or defaults
 * @param {String} blackName New black player name
 * @param {String} yellowName New yellow player name
 */
function editNames(blackName="Player One", yellowName="Player Two") {
	black.name = (blackName === "") ? "Player One" : blackName;		
	yellow.name = (yellowName === "") ? "Player Two" : yellowName;		
	setNames();
}

/**
 * Updates elements on game page with current stored names
 */
function setNames() {
	$("#black--name").text(black.name);
	$("#yellow--name").text(yellow.name);
}

/**
 * Runs the game timer and updates the time every 1 second.
 */
function startTime() {
  if(!gameIsPaused && !gameIsOver) {
    gameTime.seconds++

    if(gameTime.seconds == 60){
      gameTime.minutes++;
      gameTime.seconds = 0;
    }
    // Format the time
    gameTime.minutes = formatTime(gameTime.minutes);
    gameTime.seconds = formatTime(gameTime.seconds);

		// Updated the view
		$('#minutes').text(gameTime.minutes);
		$('#seconds').text(gameTime.seconds);
    
    // If the game is not paused, update the time
    var t = setTimeout(startTime, 1000);
  }
}

/**
 * Update the pause play button depending on the game state
 */
function updateGameState() {
  if (gameIsPaused && !gameIsOver) {
		gameIsPaused = false;
    $('#pause-play').html('<i class="fa fa-pause fa-3x" aria-hidden="true"></i>');
    startTime();
  } else if (!gameIsPaused && !gameIsOver) {
		gameIsPaused = true;
    $('#pause-play').html('<i class="fa fa-play fa-3x" aria-hidden="true"></i>');
  }
}

/**
 * End the foosball game
 */
function endGame() {
	gameIsOver = true;
	$("#button--save-game").prop("disabled", false);
	$("#pause-play").html('');
}

/**
 * Restart a foosball game
 */
function restartGame() {
	$("#pause-play").html('<i class="fa fa-pause fa-3x" aria-hidden="true"></i>');

	// Update the game time
	gameTime.minutes = formatTime(0);
	gameTime.seconds = formatTime(0);

	// Updated the view
	$('#minutes').text(gameTime.minutes);
	$('#seconds').text(gameTime.seconds);

	if (gameIsPaused || gameIsOver) {
		gameIsPaused = false;
		gameIsOver = false;
		startTime();
	}
}

/**
 * Formats input unit of time with leading zero if less than 10
 * @param {int} unit 
 * Return String
 */
function formatTime(unit) {
  var stringUnit = "" + unit;
  if (unit < 10 && stringUnit.length < 2) {unit = "0" + unit};
  return unit;
}

