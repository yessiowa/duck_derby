pondLocation = [190, 200];
pondRadius = 100;
Duck = function(){
    this.x = game.world.randomX;
    this.y = game.world.randomY;
    this.minSpeed = -duckVelocity;
    this.maxSpeed = duckVelocity;
    this.vx = Math.random()*(this.maxSpeed - this.minSpeed+1)-this.minSpeed;
    this.vy = Math.random()*(this.maxSpeed - this.minSpeed+1)-this.minSpeed;

    this.duck = game.add.sprite(this.x,this.y,"duck");
    this.duck.anchor.setTo(0.5, 0.5);
    this.duck.inputEnabled = true;
    this.duck.input.enableDrag(false, true);
    game.physics.enable(this.duck, Phaser.Physics.ARCADE);
    this.duck.body.collideWorldBounds = true;
    this.duck.body.bounce.setTo(1, 1.05);
    this.duck.body.velocity.x = this.vx;
    this.duck.body.velocity.y = this.vy;
    this.duck.body.immovable = true;
    this.duck.scale.x=duckScale;
    this.duck.scale.y=duckScale;
    this.duck.score=0;
    var self=this;
    this.duck.touchDown = function(){
        quack.play();
        self.duck.body.velocity.x = 0;
        self.duck.body.velocity.y = 0;
        self.duck.scale.x = duckScalePickedUp;
        self.duck.scale.y = duckScalePickedUp;
    };
    this.duck.touchUp = function(){
        self.duck.body.velocity.x = self.vx;
        self.duck.body.velocity.y = self.vy;
        self.duck.scale.x = duckScale;
        self.duck.scale.y = duckScale;
    };
    this.duck.events.onInputDown.add(self.duck.touchDown, this);
    this.duck.events.onInputUp.add(self.duck.touchUp, this);
};

var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

var game = new Phaser.Game(w, h, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });
var numOfDucks = 1;
var pond;
var ducks;
var quack;
var newTotal;
var score = 0;
var roundScore = 0;
var time = 3;
var continueGame = true;
var duckVelocity = 45;
var duckScale = 0.4;
var duckScalePickedUp = duckScale * 1.5;
var objects = 0;
var scoreText = "Score: " + score;
var timeText = "Time: " + time;
var timer = new Phaser.Timer(game);

var level;
if (localStorage.getItem("gameLevel")) {
    level = parseInt(localStorage.getItem("gameLevel"))
} else {
    level = 1;
}
//{
//    1: {numOfDucks: 10, duckVelocity: 45, time: 30, objects: 0, duckScale: 0.4, pondRadius: 100},
//    2: {numOfDucks: 15, duckVelocity: 45, time: 30, objects: 0, duckScale: 0.4, pondRadius: 100}
//}; //levels aren't implemented yet

function preload() {
    game.load.image('duck', 'img/duck.png');
    game.load.audio('quack', 'audio/quack.wav');
    game.load.image('continueButton','img/continue.png');
    game.load.image('playAgainButton','img/playAgain.png');
}

function create() {
    setupTextBar();
    setupLevel();
    pond = game.add.graphics(0, 0);
    game.stage.backgroundColor = "#4C8F00";
    quack = game.add.audio('quack');
    pond.lineStyle(0);
    pond.beginFill(0x8CF2FF, 0.5);
    pond.drawCircle(pondLocation[0], pondLocation[1], pondRadius);

    ducks = [];
    for (var i=0; i<numOfDucks; i++) {
        ducks.push( new Duck() );
    }
}

function update() {
    game.input.onUp.addOnce(duckScore, this);
}

function render(){
    for(var i=0;i<numOfDucks;i++){
        var ducky = ducks[i];
        var x = ducky.duck.position.x;
        var y = ducky.duck.position.y;
        var center_x = pondLocation[0];
        var center_y = pondLocation[1];
        var radius = pondRadius + 20; //duck width added

        var duckWithinPond = (x - center_x)*(x - center_x) + (y - center_y) * (y - center_y);
        if(duckWithinPond < (radius + 3) * (radius + 3)){
            if (duckWithinPond < (radius - 5) * (radius - 5)){
                //keeps ducks in the pond when they are placed in there, increasing the score
                ducky.duck.body.velocity.x *= 0;
                ducky.duck.body.velocity.y *= 0;
                ducky.duck.score = 1;
            }
            //keeps ducks out of the pond while they waddle around
            ducky.duck.body.velocity.x *= -1;
            ducky.duck.body.velocity.y *= -1;
        } else {

        }
    }
}

function setupTextBar() {
    var style = { font: "45px Arial", fill: "yellow", align: "left" };
    scoreText = game.add.text(0, 0, scoreText, style);

    //  Create Countdown Timer
    timer = game.time.create(false);
    timer.loop(1000, updateTimeCounter, this);
    timer.start();
    timeText = game.add.text(w-200, 0, timeText, style); //sets the time 200px from the right of the edge of the screen
}

function setupLevel() {
    numOfDucks = level;
}

function updateTimeCounter() {
    time--;
    timeText.setText("Time: " + time);
    if (time <= 0) {
        timeText.setText("Time Up!");
        continueGame = false;
        gameEnd();
    }
}

function duckScore() {
    roundScore = 0;
    for(var i=0;i<numOfDucks;i++) {
        roundScore += ducks[i].duck.score;
    }
    roundScore *= 10;
    scoreText.setText("Score: " + roundScore);
    if (roundScore / 10 == numOfDucks) {
        scoreText.setText("You Win!");
        gameEnd();
    }
}
// This function updates the localstorage to the current best score
function updateBestScore() {
	if(typeof(Storage) !== "undefined") {
		var prevBestScore = parseInt(localStorage.getItem("duckDerbyBestScore"));
	
		//check if the bestScore variable is available in 	
		if(!prevBestScore) {
			prevBestScore = 0;
			localStorage.setItem("duckDerbyBestScore",0);
			
		}
		
		if(score > prevBestScore)
		{
			localStorage.setItem("duckDerbyBestScore", (score));
		}
	} else {
		// Sorry! No local Storage support..
		alert('this version of local web browser does not support local storage');
	}	
}

function gameEnd() {
    timer.stop(true);
    game.isRunning = false;
    for (var i=0; i<numOfDucks; i++) {
        ducks[i].duck.body.velocity.x *= 0;
        ducks[i].duck.body.velocity.y *= 0;
        ducks[i].duck.inputEnabled = false;
    }
    //adjusting the final scores
    score += roundScore;
	// This function updates the best score after each run of the game.
	updateBestScore();
    scoreText.setText("Total Score: " + score + " Best Score :" + parseInt(localStorage.getItem("duckDerbyBestScore")));
    newTotal = score + parseInt(localStorage.getItem("totalScore"));
    localStorage.setItem("totalScore", (newTotal));
    scoreText.setText("Total Score: " + newTotal);
    //game.add.button();
    roundScore = 0;
    var style = { font: "35px Arial", fill: "yellow", align: "center" };
    var text;
    if (continueGame) {
        text = "Congratulations! Your ducks are safe.";
        game.add.button(game.world.centerX - 95, 400, 'continueButton', reload, this, 2, 1, 0);
    } else {
        text = "You finished with a total score of " + newTotal;
        game.add.button(game.world.centerX - 95, 400, 'playAgainButton', finalView, this, 2, 1, 0);
    }
    game.add.text(0, game.world.centerY-300, text, style);

}

function reload() {
    localStorage.setItem("gameLevel", (level + 1));
    location.reload();
}

function finalView() {
    localStorage.removeItem("totalScore");
    localStorage.removeItem("gameLevel");
    reload();
}
