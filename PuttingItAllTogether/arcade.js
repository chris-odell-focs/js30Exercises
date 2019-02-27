/*


This was a small project I set myself after working through wesbos JavaScript 30 course at https://javascript30.com/
There are a few small bugettes and improvements in the code but getting the arcade game this far acheived what I wanted to do, by practising writing
the JS using some of the techniques used in the course.

There is probably an overuse of the 'const' keyword in the code even though semantically correct I feel that it is a confusing
signal as to the intention of the code. If I were to rewrite it I would use it less.

I give the owner of this code the right to use it in anyway they want, but it comes with no warranty or assurance
of working, and I cannot be held responsible for any use of it by the anyone copying the code.

Having written a number of applications using various JS frameworks in parts of them, it was interesting to write this using pure JS.

Chris O'Dell 2019-02-27

 */

const arcadeUiElements = function () {

    return {
        ARTrigger: { Selector: '.menu > li' },
        ARDropdownBackground: { Selector: '.dropdownBackground' },
        ARMainNavigation: { Selector: '#main-nav' },
        ARDropDown: { Selector: '.dropdown' },
        ARAction: {
            TriggerEnter: 'trigger-enter',
            TriggerActive: 'trigger-enter-active',
            IsOpen: 'open',
            IsDown: 'is-down'
        },
        ARBoard: { Selector: '#game-board', Id: 'game-board' },       
        ARTimer: { Selector: '#countdown-timer', Id: 'countdown-timer' },
        ARSpaceship: { Selector: '#spaceship', Id: 'spaceship' },
        ARBarrierTemplate: { Selector: '#barrier-template', Id: 'barrier-template' },
        ARBarrier: { Selector: '.barrier', Class: 'barrier' },
        ARAmmoTemplate: { Selector: '#ammo-template', Id: 'ammo-template' },
        ARAmmoItem: { Selector: '.ammo-item', Class: 'ammo-item' },
        ARAlienTemplate: { Selector: '#alien-template', Id: 'alien-template' },
        ARAlien: { Selector: '.alien', Class: 'alien' },
        ARScoreCard: { Selector: '#score-card span', Id: 'score-card' },
        ARGameOptionsL1: { Selector: '#ar-level1', Id: 'ar-level1' },
        ARGameOptionsL2: { Selector: '#ar-level2', Id: 'ar-level2' },
        ARGameOptionsL3: { Selector: '#ar-level3', Id: 'ar-level3' }
    };
};


const menuDisplayHandler = function (uictx) {

    const triggers = document.querySelectorAll(uictx.ARTrigger.Selector);
    const background = document.querySelector(uictx.ARDropdownBackground.Selector);
    const nav = document.querySelector(uictx.ARMainNavigation.Selector);
    const gameBoard = document.querySelector(uictx.ARBoard.Selector);

    function handleEnter() {

        this.classList.add(uictx.ARAction.TriggerEnter);
        setTimeout(() => this.classList.contains(uictx.ARAction.TriggerEnter) && this.classList.add(uictx.ARAction.TriggerActive), 150);
        background.classList.add(uictx.ARAction.IsOpen);

        const dropdown = this.querySelector(uictx.ARDropDown.Selector);
        const dropdownCoords = dropdown.getBoundingClientRect();
        const navCoords = nav.getBoundingClientRect();

        const coords = {
            height: dropdownCoords.height,
            width: dropdownCoords.width,
            top: dropdownCoords.top - navCoords.top,
            left: dropdownCoords.left - navCoords.left
        };

        background.style.setProperty('width', `${coords.width}px`);
        background.style.setProperty('height', `${coords.height}px`);
        background.style.setProperty('transform', `translate(${coords.left}px, ${coords.top}px)`);
        gameBoard.style.setProperty('z-index', -1);
    }

    function handleLeave() {
        this.classList.remove(uictx.ARAction.TriggerEnter, uictx.ARAction.TriggerActive);
        background.classList.remove(uictx.ARAction.IsOpen);
        gameBoard.style.removeProperty('z-index', -1);
    }

    var addHandlers = function () {

        triggers.forEach(trigger => trigger.addEventListener('mouseenter', handleEnter));
        triggers.forEach(trigger => trigger.addEventListener('mouseleave', handleLeave));
    };

    return {
        addHandlers: addHandlers
    };
};

const gamboardCommon = function (uictx) {

    const gameboard = document.querySelector(uictx.ARBoard.Selector);

    let barrierRefs = null;

    const outsideGameboard = function (item) {

        const gameboardArea = gameboard.getBoundingClientRect();
        const itemCoords = item.getBoundingClientRect();

        let outFlag = 0;
        if (itemCoords.x < gameboardArea.x) {
            outFlag = 1;
        }

        if (itemCoords.x + itemCoords.width > gameboardArea.x + gameboardArea.width) {
            outFlag = 2;
        }

        if (itemCoords.y < gameboardArea.y) {
            outFlag = 3;
        }

        if (itemCoords.y + itemCoords.height > gameboardArea.y + gameboardArea.height) {

            outFlag = 4;
        }

        return outFlag;
    };

    const getHitBarrier = function (item) {

        if (barrierRefs === null) {
            buildBarrierRefs();
        }

        let barrierHit = null;

        const itemCoords = item.getBoundingClientRect();
        const itemLeft = itemCoords.x;
        const itemRight = itemCoords.x + itemCoords.width;
        const itemTop = itemCoords.y;
        const itemBottom = itemCoords.y + itemCoords.height;

        barrierRefs.map(b => {

            const barrierCoords = b.getBoundingClientRect();

            let xHit = false;
            let yHit = false;
            let xEdge = 'none';
            let yEdge = 'none';

            if (barrierHit === null) {

                const barrierLeft = barrierCoords.x;
                const barrierRight = barrierCoords.x + barrierCoords.width;

                if (barrierLeft < itemLeft && barrierRight > itemLeft) {
                    //left edge of item is in barrier range
                    xHit = true;
                    xEdge = 'left';

                } else if (barrierLeft < itemRight && barrierRight > itemRight) {
                    //right edge of item is in barrier range
                    xHit = true;
                    xEdge = 'right';
                }

                const barrierTop = barrierCoords.y;
                const barrierBottom = barrierCoords.y + barrierCoords.height;

                if (barrierTop < itemTop && barrierBottom > itemTop) {
                    //top edge of item is in barrier range
                    yHit = true;
                    yEdge = 'top';

                } else if (barrierTop < itemBottom && barrierBottom > itemBottom) {
                    //bottom edge of item is in barrier range
                    yHit = true;
                    yEdge = 'bottom';
                }

                if (xHit && yHit) {
                    barrierHit = { barrier: b, xEdge: xEdge, yEdge: yEdge };
                }
            }

        });

        return barrierHit;
    };

    function buildBarrierRefs() {

        let barrierNodes = document.querySelectorAll(uictx.ARBarrier.Selector);
        barrierRefs = Array.from(barrierNodes);
    }

    return {
        outsideGameboard: outsideGameboard,
        getHitBarrier: getHitBarrier
    };

};

const spaceshipController = function (uictx, common) {

    const gameboardCoords = document.querySelector(uictx.ARBoard.Selector).getBoundingClientRect();
    const spaceShip = document.querySelector(uictx.ARSpaceship.Selector);
    const positionModifier = { 'ArrowLeft': -5, 'ArrowRight': 5 };
    const startPos = 500;

    const attachKeyListeners = function () {

        document.addEventListener('keydown', moveSpaceShip);

    };

    const init = function () {

        spaceShip.style.left = `${startPos}px`;
    };

    function moveSpaceShip(e) {

        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {

            let theLeft = parseInt(spaceShip.style.left.replace('px', ''));
            let newLeft = theLeft + positionModifier[e.code];

            const barrierHit = common.getHitBarrier(spaceShip);

            if (common.outsideGameboard(spaceShip) === 1) {

                newLeft = 0;
            } else if (common.outsideGameboard(spaceShip) === 2) {

                newLeft = (gameboardCoords.width - spaceShip.getBoundingClientRect().width) - 1;
            } else if (barrierHit !== null && barrierHit.xEdge === 'left' && e.code === 'ArrowLeft' || barrierHit !== null && barrierHit.xEdge === 'right' && e.code === 'ArrowRight') {

                newLeft = theLeft + positionModifier[e.code] * -1;

            }
            
            spaceShip.style.left = `${newLeft}px`;
        }
    }

    const detach = function () {

        document.removeEventListener('keydown', moveSpaceShip);

    };

    return {
        attachKeyListeners: attachKeyListeners,
        init: init,
        detach: detach
    };
};

const barrierController = function (uictx, common) {

    const barrierTemplate = document.querySelector(uictx.ARBarrierTemplate.Selector);
    const gameboard = document.querySelector(uictx.ARBoard.Selector);

    let lastX = 0;
    let lastY = 0;

    const init = function () {

        generateBarriers();

        let barrierNodes = document.querySelectorAll(uictx.ARBarrier.Selector);
        let barriers = Array.from(barrierNodes);

        barriers.forEach(b => b.addEventListener('mousedown', handleMouseDown));
        barriers.forEach(b => b.addEventListener('mouseup', handleMouseUp));
        barriers.forEach(b => b.addEventListener('mouseleave', handleMouseUp));
        barriers.forEach(b => b.addEventListener('mousemove', handleMouseMove));

    };

    function generateBarriers() {

        let startX = 10;
        let startY = 200;

        for (let idx = 0; idx < 3; idx++) {

            let barrier = barrierTemplate.cloneNode(true);
            barrier.id = `barrier${idx}`;
            barrier.style = '';

            gameboard.appendChild(barrier);
            barrier.style.left = `${startX}px`;
            barrier.style.top = `${startY}px`;
            barrier.classList.add(uictx.ARBarrier.Class);

            startY += 80;

        }
    }

    function handleMouseUp(e) {

        this.classList.remove(uictx.ARAction.IsDown);
        this.style.removeProperty('z-index');
        moveBarrier(e, this);
    }

    function handleMouseDown(e) {

        this.classList.add(uictx.ARAction.IsDown);
        lastX = e.pageX;
        lastY = e.pageY;
        this.style.setProperty('z-index', '99999');
    }

    function handleMouseMove(e) {

        moveBarrier(e, this);
    }

    function moveBarrier(e, barrier) {

        if (barrier.classList.contains(uictx.ARAction.IsDown)) {

            const deltaX = e.pageX - lastX;
            const deltaY = e.pageY - lastY;

            let theLeft = parseInt(barrier.style.left.replace('px', ''));
            let theTop = parseInt(barrier.style.top.replace('px', ''));

            let newLeft = theLeft + deltaX;
            let newTop = theTop + deltaY;

            if (common.outsideGameboard(barrier) === 1) {

                theLeft++;
                barrier.style.left = `${theLeft}px`;

            } else if (common.outsideGameboard(barrier) === 2) {

                theLeft--;
                barrier.style.left = `${theLeft}px`;
            } else {
                barrier.style.left = `${newLeft}px`;
            }


            if (common.outsideGameboard(barrier) === 3) {

                theTop++;
                barrier.style.top = `${theTop}px`;

            } else if (common.outsideGameboard(barrier) === 4) {

                theTop--;
                barrier.style.top = `${theTop}px`;
            } else {
                barrier.style.top = `${newTop}px`;
            }

            lastX = e.pageX;
            lastY = e.pageY;

            e.preventDefault();
        }
    }

    const detach = function () {

        let barrierNodes = document.querySelectorAll(uictx.ARBarrier.Selector);
        let barriers = Array.from(barrierNodes);

        barriers.forEach(b => b.removeEventListener('mousedown', handleMouseDown));
        barriers.forEach(b => b.removeEventListener('mouseup', handleMouseUp));
        barriers.forEach(b => b.removeEventListener('mouseleave', handleMouseUp));
        barriers.forEach(b => b.removeEventListener('mousemove', handleMouseMove));
    };

    return {
        init: init,
        detach: detach
    };

};

const ammoController = function (uictx, common) {

    let ammoFired = [];
    let ammoCount = 0;
    let ammoPump = null;

    const gameboard = document.querySelector(uictx.ARBoard.Selector);
    const ammoTemplate = document.querySelector(uictx.ARAmmoTemplate.Selector);
    const spaceShip = document.querySelector(uictx.ARSpaceship.Selector);
    const AMMO_HIEGHT = 12;
    const AMMO_PAD = 2;

    const init = function () {

        document.addEventListener('keydown', fireAmmo);
        startAmmoPump();

    };

    function fireAmmo(e) {

        if (e.code === 'KeyZ') {

            let ammoItem = ammoTemplate.cloneNode(true);
            ammoItem.style = '';
            ammoItem.id = '';

            gameboard.appendChild(ammoItem);

            const shipCoords = spaceShip.getBoundingClientRect();
            let startX = parseInt(spaceShip.style.left.replace('px', ''));
            startX += (shipCoords.width / 2) - AMMO_PAD;

            let startY = parseInt(spaceShip.style.top.replace('px', '')) - AMMO_HIEGHT; 


            ammoItem.style.left = `${startX}px`;
            ammoItem.style.top = `${startY}px`;
            ammoItem.classList.add(uictx.ARAmmoItem.Class);
            ammoItem.dataset.idx = ammoCount;
            ammoCount++;

            ammoFired.push(ammoItem);

        }

    }

    function startAmmoPump() {

        ammoPump = setInterval(function () {

            if (ammoFired.length > 0) {
                ammoFired.map(ammo => {

                    let y = parseInt(ammo.style.top.replace('px', ''));
                    y -= 5;
                    if (y < 10) {

                        let ammoIdx = ammoFired.findIndex(i => i.dataset.idx === ammo.dataset.idx);
                        ammoFired.splice(ammoIdx, 1);
                        ammo.remove();
                    }

                    ammo.style.top = `${y}px`;

                    const barrierHit = common.getHitBarrier(ammo);
                    if (barrierHit !== null) {
                        let ammoIdx = ammoFired.findIndex(i => i.dataset.idx === ammo.dataset.idx);
                        ammoFired.splice(ammoIdx, 1);
                        ammo.remove();
                    }

                });
            }

        }, 50);

    }

    const detach = function () {

        clearInterval(ammoPump);
        document.removeEventListener('keydown', fireAmmo);

    };

    return {
        init: init,
        detach: detach
    };

};

const alienController = function (uictx, common) {

    const gameboard = document.querySelector(uictx.ARBoard.Selector);
    const alienTemplate = document.querySelector(uictx.ARAlienTemplate.Selector);
    const alienList = [];
    const ALIEN_WIDTH = 45;

    const spaceShip = document.querySelector(uictx.ARSpaceship.Selector);

    let spawnMin = 0;
    let spawnMax = 0;
    
    let alientCount = 0;
    let spawnInterval = 300;

    let alienPump = null;
    let keepSpawning = true;

    let shipHitEvent = new Event('ship.hit');
    let alienHit = new Event('alien.hit');
    let alienReachBottom = new Event('alien.at.bottom');
    let dropSpeed = 5;

    const init = function (pSpawMin, pSpawnMax, pDropSpeed) {

        spawnMin = pSpawMin;
        spawnMax = pSpawnMax;
        dropSpeed = pDropSpeed;

        keepSpawning = true;
        startAlienPump();
        spawAliens();

    };

    const clearAliens = function () {

        const alienNodes = document.querySelectorAll(uictx.ARAlien.Selector);
        if (alienNodes !== null) {
            const aliens = Array.from(alienNodes);
            aliens.map(a => { a.remove(); });
        }
    };

    function startAlienPump() {

        alienPump = setInterval(function () {

            if (alienList.length > 0) {

                alienList.map(alien => {

                    const alienIdx = alienList.findIndex(i => i.dataset.idx === alien.dataset.idx);
                    let y = parseInt(alien.style.top.replace('px', ''));
                    y += dropSpeed;

                    alien.style.top = `${y}px`;
                    const gbCoords = gameboard.getBoundingClientRect();
                    
                    //if alien hits bottom remove it
                    const alienBottom = alien.getBoundingClientRect().top + alien.getBoundingClientRect().height;
                    if (alienBottom > (gbCoords.top + gbCoords.height)) {

                        alienList.splice(alienIdx, 1);
                        alien.remove();
                        gameboard.dispatchEvent(alienReachBottom);
                    }

                    //if alien hits a barrier remove it
                    const barrierHit = common.getHitBarrier(alien);
                    if (barrierHit !== null) {
 
                        alienList.splice(alienIdx, 1);
                        alien.remove();
                    }

                    //if alien hit by ammo remove it
                    let ammoNodes = document.querySelectorAll(uictx.ARAmmoItem.Selector);
                    let ammoList = Array.from(ammoNodes);

                    ammoList.map(a => {

                        if (alienIsHit(a, alien)) {
                            alienList.splice(alienIdx, 1);
                            alien.remove();
                            gameboard.dispatchEvent(alienHit);
                        }

                    });

                    //if alien hits ship let the gameboard know
                    if (shipIsHit(alien)) {

                        detach();
                        gameboard.dispatchEvent(shipHitEvent);
                    }

                });
            }

        }, 200);
    }

    const detach = function () {

        clearInterval(alienPump);
        keepSpawning = false;

    };

    function alienIsHit(ammo, alien) {

        let isHit = false;

        const alienCoords = alien.getBoundingClientRect();
        const ammoCoords = ammo.getBoundingClientRect();

        const alienBottom = alienCoords.top + alienCoords.height;
        const alienRight = alienCoords.left + alienCoords.width;

        const ammoRight = ammoCoords.left + ammoCoords.width;

        if (ammoCoords.top < alienBottom) {

            if (ammoCoords.left < alienCoords.left && ammoRight > alienCoords.left ||
                ammoCoords.left > alienCoords.left && ammoCoords.left < alienRight ||
                ammoCoords.left < alienRight && ammoRight > alienRight) {
                isHit = true;
            }
        }

        return isHit;
    }

    function shipIsHit(alien) {

        const shipCoords = spaceShip.getBoundingClientRect();
        const alienCoords = alien.getBoundingClientRect();

        let isHit = false;
        const alienBottom = alienCoords.top + alienCoords.height;
        const alienRight = alienCoords.left + alienCoords.width;

        const shipRight = shipCoords.left + shipCoords.width;

        if (alienBottom > shipCoords.top) {

            const alienMid = alienCoords.left + (alienCoords.width / 2);
            if ((alienCoords.left < shipCoords.left && alienRight > shipCoords.left) ||
                (alienCoords.left < shipRight && alienRight > shipRight) ||
                (alienMid > shipCoords.left && alienMid < shipRight)) {
                isHit = true;
            }            
        }

        return isHit;
    }

    function spawAliens() {

        setTimeout(() => {

            let alien = alienTemplate.cloneNode(true);
            alien.style = '';
            alien.id = '';

            gameboard.appendChild(alien);

            let startX = Math.round(Math.random() * (gameboard.getBoundingClientRect().width - ALIEN_WIDTH));

            alien.style.left = `${startX}px`;
            alien.style.top = '100px';
            alien.classList.add(uictx.ARAlien.Class);
            alien.dataset.idx = alientCount;
            alientCount++;

            alienList.push(alien);

            spawnInterval = Math.round(Math.random() * (spawnMax - spawnMin) + spawnMin);

            if (keepSpawning) {
                spawAliens();
            }

        },spawnInterval);

    }

    return {
        init: init,
        detach: detach,
        clearAliens: clearAliens
    };

};

const countDownController = function (uictx) {

    //lifted as is from wesbos javascript 30 Countdown timer

    let countDown = null;
    const timer = document.querySelector(uictx.ARTimer.Selector);
    const gameboard = document.querySelector(uictx.ARBoard.Selector);

    let timerDoneEvent = new Event('countdown.complete');

    const startTimer = function (seconds) {

        clearInterval(countDown);
        const now = Date.now();
        const then = now + seconds * 1000;
        displayTimeLeft(seconds);

        countDown = setInterval(() => {
            const secondsLeft = Math.round((then - Date.now()) / 1000);

            if (secondsLeft < 0) {
                clearInterval(countDown);
                //countDown = null;
                gameboard.dispatchEvent(timerDoneEvent);
                return;
            }

            displayTimeLeft(secondsLeft);
        }, 1000);
    };

    function displayTimeLeft(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainderSeconds = seconds % 60;
        const display = `${minutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;
        timer.textContent = display;
    }

    const stop = function () {
        clearInterval(countDown);
    };

    return {
        startTimer: startTimer,
        stop: stop
    };

};

const scoreCardContoller = function (uictx) {

    const scoreCard = document.querySelector(uictx.ARScoreCard.Selector);
    let gamePoints = 0;

    const updateScore = function (points) {

        gamePoints += points;
        if (gamePoints < 0) {
            gamePoints = 0;
        }

        scoreCard.textContent = gamePoints;
    };

    return {
        updateScore: updateScore
    };

};

const gameBoardController = function (uictx) {

    const barrierContext = ARResolver.resolve('barriers');
    const spaceShip = ARResolver.resolve('spaceship');
    const ammoContext = ARResolver.resolve('ammo');
    const alienContext = ARResolver.resolve('alien');
    const countdown = ARResolver.resolve('countDown');
    const scoreCard = ARResolver.resolve('scoreCard');
    const gameboard = document.querySelector(uictx.ARBoard.Selector);

    let gameLevel = 1;

    let notStarted = true;
    
    const init = function () {

        spaceShip.init();
        spaceShip.attachKeyListeners();
        barrierContext.init();
        ammoContext.init();
        
        gameboard.addEventListener('alien.hit', () => { scoreCard.updateScore(1); });
        gameboard.addEventListener('alien.at.bottom', () => { scoreCard.updateScore(-1); });

        gameboard.addEventListener('ship.hit', () => {

            gameOver();
        });

        addLevelListeners();
        restart();
    };

    function addLevelListeners() {

        const level1 = document.querySelector(uictx.ARGameOptionsL1.Selector);
        const level2 = document.querySelector(uictx.ARGameOptionsL2.Selector);
        const level3 = document.querySelector(uictx.ARGameOptionsL3.Selector);

        level1.addEventListener('click', () => {
            gameLevel = 1;
            notStarted = true;
            restart();
        });

        level2.addEventListener('click', () => {
            gameLevel = 2;
            notStarted = true;
            restart();
        });

        level3.addEventListener('click', () => {
            gameLevel = 3;
            notStarted = true;
            restart();
        });
    }

    function restart() {
        
        gameboard.removeEventListener('countdown.complete', countdownComplete);
        gameboard.addEventListener('countdown.complete', countdownComplete);
        countdown.startTimer(10);
        alienContext.clearAliens();
        alienContext.detach();

    }

    function countdownComplete() {

        //these control how fast the aliens are spawned
        let spawnMin = 2000;
        let spawnMax = 3500;
        let dropSpeed = 2; //this controls how fast the aliens drop

        if (gameLevel === 2) {
            spawnMin = 1200;
            spawnMax = 2300;
            dropSpeed = 5; //this controls how fast the aliens drop
        } else if (gameLevel === 3) {
            spawnMin = 600;
            spawnMax = 900;
            dropSpeed = 8; //this controls how fast the aliens drop
        }

        if (notStarted) {
            alienContext.init(spawnMin, spawnMax, dropSpeed);
            notStarted = false;
            countdown.startTimer(60);
        } else {
            gameOver();
        }
    }

    function gameOver() {

        spaceShip.detach();
        barrierContext.detach();
        ammoContext.detach();
        countdown.stop();
        alienContext.detach();
    }

    return {
        init: init
    };

};

const ARResolver = function (uictx) {

    let creationStrategy = null;

    function buildCreationStrategy() {

        creationStrategy = {
            'menuDisplay': function () { return new menuDisplayHandler(uictx); },
            'gameBoard': function () { return new gameBoardController(uictx); },
            'spaceship': function () { return new spaceshipController(uictx, ARResolver.resolve('common')); },
            'barriers': function () { return new barrierController(uictx, ARResolver.resolve('common')); },
            'common': function () { return new gamboardCommon(uictx); },
            'ammo': function () { return new ammoController(uictx, ARResolver.resolve('common')); },
            'alien': function () { return new alienController(uictx, ARResolver.resolve('common')); },
            'countDown': function () { return new countDownController(uictx); },
            'scoreCard': function () { return new scoreCardContoller(uictx); }
        };

    }

    return {

        get: function (name) {

            if (creationStrategy === null) {
                buildCreationStrategy();
            }

            return new creationStrategy[name]();
        }
    };
};

ARResolver.resolve = function (name) {

    if (this.resolver === undefined) {
        this.resolver = new ARResolver(new arcadeUiElements());
    }

    return this.resolver.get(name);

};


var app = null;

(function () {

    const menuDisplay = ARResolver.resolve('menuDisplay');
    const gameBoard = ARResolver.resolve('gameBoard');
    

    app = {
        init: function () {

            menuDisplay.addHandlers();
            gameBoard.init();

        }
    };

}());

app.init();

