const gameStartRef = document.querySelector(".game-start");
const gameScoreRef = document.querySelector(".game-score");
const gameAreaRef = document.querySelector('.game-area');
const gameOverRef = document.querySelector('.game-over');
const pointsRef = gameScoreRef.querySelector('.points');
const restartGameButtonRef = document.querySelector('.restart');

gameStartRef.addEventListener('click', onGameStart);
document.addEventListener('keydown', onKeyDown); //when you press a key
document.addEventListener('keyup', onKeyUp); //when you release the key
restartGameButtonRef.addEventListener('click', resetGame);

let gameAreaWidth = 0;
let gameAreaHeight = 0;
const keys = {};
const player = { //initital position of the wizzard
    x: 50,
    y: 400,
    width: 0,
    height: 0,
    lastTimeFiredFireball: 0
};

const game = {
    //standard speed
    speed: 2, //will move the wizzard with 2px
    bugSpeed: 2,
    wizardSpeed: 4,
    fireBallSpeed: 5,
    fireInterval: 1000, //1000mileseonds = 1 second 
    cloudInterval: 3000, //3 seconds
    bugInterval: 1000,
    bugKilledBonus: 2000
};
const scene = {
    points: 0,
    lastCloud: 0,
    lastBug: 0,
    isActiveGame: true,
}

function onGameStart(event) {
    gameStartRef.classList.add('hide');
    gameOverRef.classList.add('hide'); //hide the "Game over"
    restartGameButtonRef.classList.add('hide'); //hide the "Play Again"

    const wizard = document.createElement('div');
    wizard.classList.add('wizard');
    //we set the initial posititon of the wizzard 
    wizard.style.top = player.y + 'px';
    wizard.style.left = player.x + 'px';

    gameAreaRef.appendChild(wizard);

    player.height = wizard.offsetHeight; //100
    player.width = wizard.offsetWidth; //82

    gameAreaWidth = gameAreaRef.offsetWidth;
    gameAreaHeight = gameAreaRef.offsetHeight;
    window.requestAnimationFrame(gameAction) //calls the function once
}
function resetGame() {
    player.x = 50;
    player.y = 400;
    player.lastTimeFiredFireball = 0;

    game.bugSpeed = 2;
    game.wizardSpeed = 4;

    scene.points = 0;
    scene.lastBug = 0;
    scene.lastCloud = 0;
    scene.isActiveGame = true;
    //remove all elements so we can create them again
    let existingElements = document.querySelectorAll('.wizard, .fire-ball, .cloud, .bug');
    existingElements.forEach(element => element.remove());
    onGameStart();
}

function gameAction(timeStamp) {
    const wizard = document.querySelector('.wizard');
    const fireBallsRef = document.querySelectorAll('.fire-ball');
    const allCloudsRef = document.querySelectorAll('.cloud');
    const allBugsRef = document.querySelectorAll('.bug');

    // calculating wizard's position on the screen
    let wizardWidth = player.width + player.x; //width of wizzard + current horizontal positition of the wizard.
    let wizardHeight = player.height + player.y; //height of wizard + current vertical position of the wizard.

    //applying gravity
    let isInAir = player.y + player.height <= gameAreaHeight;
    if (isInAir) {
        player.y += game.speed; //to fall down
        //we slow it down with 2 and move it up with 6
    }
    //incrementing the points
    countingPoints();

    addCloud(timeStamp);
    addBugg(timeStamp);

    //move the fireBalls
    fireBallsRef.forEach(curFireBall => {
        curFireBall.x += game.speed * game.fireBallSpeed;
        curFireBall.style.left = curFireBall.x + 'px';
        if (curFireBall.x + curFireBall.offsetWidth > gameAreaWidth) {
            //curFireBall.remove();
            curFireBall.parentElement.removeChild(curFireBall);
        }
    });

    //move the clouds
    allCloudsRef.forEach(cloud => {
        cloud.x -= game.speed;
        cloud.style.left = cloud.x + 'px';
        if (cloud.x < 0 - cloud.offsetWidth) {
            cloud.parentElement.removeChild(cloud);
        }
    });

    //move the bugs
    allBugsRef.forEach(bug => {
        bug.x -= game.bugSpeed;
        bug.style.left = bug.x + 'px';
        if (bug.x + bug.offsetWidth <= 0) {
            bug.parentElement.removeChild(bug);
        }
    });

    //checking for collision 
    allBugsRef.forEach(bug => {
        if (isCollision(wizard, bug)) { //true - collision
            gameOverAction();
        }
        fireBallsRef.forEach(fireBall => {
            if (isCollision(fireBall, bug)) {
                scene.points += game.bugKilledBonus;
                bug.parentElement.removeChild(bug);
                fireBall.parentElement.removeChild(fireBall)
            }
        })
    });

    //changing the wizzard - now it's shooting
    if (keys.Space && timeStamp - player.lastTimeFiredFireball > game.fireInterval) { //we count the seconds between the current time and the time last ball was shot , should be less than 1000
        wizard.classList.add("wizard-fire");
        addFireBall();
        player.lastTimeFiredFireball = timeStamp; //timeStamp is the current time in ms
    } else {
        wizard.classList.remove('wizard-fire');
    }
    //updating wizard's position
    if (keys.ArrowUp && player.y > 0) { //0px is the top 
        player.y -= game.speed * game.wizardSpeed;
    }
    if (keys.ArrowDown && wizardHeight < gameAreaHeight) { //or isInAir
        player.y += game.speed * game.wizardSpeed;
    }
    if (keys.ArrowLeft && player.x > 0) { //0 px is left-most
        player.x -= game.speed * game.wizardSpeed;
    }
    if (keys.ArrowRight && wizardWidth < gameAreaWidth) {
        player.x += game.speed * game.wizardSpeed;
    }
    wizard.style.top = player.y + 'px'; //we change the position of the wizard
    wizard.style.left = player.x + 'px';
    //updating the points 
    pointsRef.textContent = scene.points;

    if (scene.isActiveGame) {
        window.requestAnimationFrame(gameAction) //infinite loop
    }
}
//clouds
function addCloud(timeStamp) {
    if (timeStamp - scene.lastCloud > game.cloudInterval + 20000 * Math.random()) { //we slower the creation of the cloud by + 2000 
        let cloud = document.createElement('div');
        cloud.classList.add('cloud');
        //position the cloud
        cloud.x = gameAreaWidth - cloud.offsetWidth;
        cloud.style.left = cloud.x + "px";
        //we ensure that the clouds don't go below the bottom which is gameAreaHeight - 200
        cloud.style.top = (gameAreaHeight - 200) * Math.random() + 'px'; //make the height more unpredictable 

        gameAreaRef.appendChild(cloud);
        scene.lastCloud = timeStamp;
    }
}
//bugs
function addBugg(timeStamp) {
    if (timeStamp - scene.lastBug > game.bugInterval + 20000 * Math.random()) {
        let bug = document.createElement('div');
        bug.classList.add('bug');

        bug.x = gameAreaWidth - bug.offsetWidth;
        bug.style.left = bug.x + 'px';
        bug.style.top = (gameAreaHeight - bug.offsetHeight - 50) * Math.random() + 'px';
        gameAreaRef.appendChild(bug);
        scene.lastBug = timeStamp;
    }
}
//fireballs
function addFireBall() {
    let fireBall = document.createElement('div');
    fireBall.classList.add('fire-ball');

    fireBall.style.top = (player.y + player.height / 3 - 5) + 'px';
    fireBall.x = player.x + player.width;
    fireBall.style.left = fireBall.x + 'px';
    gameAreaRef.appendChild(fireBall);
}

function onKeyDown(event) {
    //key pressed
    keys[event.code] = true;
}
function onKeyUp(event) {
    //key released
    keys[event.code] = false;
}
function isCollision(wizard, bug) {
    //returns an object holding the top, right, bottom , left, width , height , x , y cordinates of the element
    let wizardCordi = wizard.getBoundingClientRect(); //accepts dom element
    let bugCordi = bug.getBoundingClientRect();
    return !(wizardCordi.top > bugCordi.bottom ||
        wizardCordi.bottom < bugCordi.top ||
        wizardCordi.right < bugCordi.left ||
        wizardCordi.left > bugCordi.right)
}
function gameOverAction() {
    scene.isActiveGame = false;
    gameOverRef.classList.remove('hide');
    restartGameButtonRef.classList.remove('hide');

}
function levelUp() {
    //increase the bug speed
    game.bugSpeed += 1;
    //increase the wizard speed
    game.wizardSpeed += 0.5;

}
function countingPoints() {
    scene.points++;
    if (scene.points + 10000 === 0) { //every 10000 points , increase the speed
        levelUp();
    }
}

