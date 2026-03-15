let lastTime = performance.now();
let ballGame = null;
let shootingGame = null;
const audioCtx = new (window.AudioContext)();

function initialize()
{
    ballGame = new BallGame();
    shootingGame = new ShootingGame();
    
    //ballGame.enable();
    shootingGame.enable();

    setupPiano();

    requestAnimationFrame(tick);
}

function tick(now)
{
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    ballGame.update(dt);
    shootingGame.update(dt);

    requestAnimationFrame(tick);
}

initialize();