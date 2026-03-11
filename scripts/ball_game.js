class BallGame
{
    static gravity = 180.0;
    static airResistance = 0.15;
    static groundResistance = 0.5;
    static bounceLoss = 0.05;

    constructor()
    {
        this.enabled = true;

        this.gameWindow = document.querySelector(".ball-game");
        this.ball = document.querySelector(".ball-game .ball");
        this.paddle =  document.querySelector(".ball-game .paddle");

        const gameWindowStyle = getComputedStyle(this.gameWindow);
        const ballStyle = getComputedStyle(this.ball);
        const paddleStyle = getComputedStyle(this.paddle);

        this.gameWindowSize = 
        {
            width: parseFloat(gameWindowStyle.width),
            height: parseFloat(gameWindowStyle.height),
        };

        this.ballSize =
        {
            width: parseFloat(ballStyle.width),
            height: parseFloat(ballStyle.height),
        };

        this.paddleSize = 
        {
            width: parseFloat(paddleStyle.width),
            height: parseFloat(paddleStyle.height),
        };

        this.paddlePos = 
        {
            x: parseFloat(paddleStyle.left),
            y: parseFloat(paddleStyle.bottom),
        };

        this.ballPos = 
        {
            x: 0,//parseFloat(ballStyle.left),
            y: 0,//parseFloat(ballStyle.bottom),
        };

        this.paddleVelocty = { x: 0, y: 0, };
        this.ballVelocty = { x: 400, y: 200, };

        this.mousePos = {x: 0, y: 0};

        this.gameWindow.addEventListener("pointermove", (e) => {
            const bb = this.gameWindow.getBoundingClientRect();
            this.mousePos.x = e.clientX - bb.left;
            this.mousePos.y = bb.height - (e.clientY - bb.top);
        });

        // this.gameWindow.addEventListener("pointerenter", () => {
        //     this.enable();
        // });

        // this.gameWindow.addEventListener("pointerleave", () => {
        //     this.disable();
        // });
    }

    getNextPaddlePos(dt){
        const paddleSpeed = 25;
        const adjMousePos = { 
            x: Math.min(this.mousePos.x - (this.paddleSize.width / 2), this.gameWindowSize.width / 2), 
            y: this.mousePos.y - (this.paddleSize.height / 2) 
        };

        this.paddleVelocty.x = (adjMousePos.x - this.paddlePos.x) * paddleSpeed;
        this.paddleVelocty.y = (adjMousePos.y - this.paddlePos.y) * paddleSpeed;

        const nextPaddlePos = {
            x: this.paddlePos.x + (this.paddleVelocty.x * dt),
            y: this.paddlePos.y + (this.paddleVelocty.y * dt)
        };

        // clamp position to left of screen
        nextPaddlePos.x = Math.max(0, Math.min(nextPaddlePos.x, (this.gameWindowSize.width / 2) - this.paddleSize.width));
        nextPaddlePos.y = Math.max(0, Math.min(nextPaddlePos.y, this.gameWindowSize.height - this.paddleSize.height));

        return nextPaddlePos;
    }

    ballCollisions(dt, nextBallPos, nextPaddlePos) {
        const colLeway = 5;
        const paddleYTransfer = 0.5;
        const paddleXTransfer = 0.5;

        const finalBallPos = 
        {
            x: nextBallPos.x,
            y: nextBallPos.y
        }

        if (this.ballPos.x > nextBallPos.x && 
            this.ballPos.x > this.paddlePos.x && 
            nextBallPos.x < nextPaddlePos.x) { // passes over x

            // estimate point of x passed between 0-1
            const passXTime = (this.ballPos.x - this.paddlePos.x) / ((this.ballPos.x - this.paddlePos.x) + (nextPaddlePos.x - nextBallPos.x));

            // estimate middle points of ball and paddle at point of collision
            const paddleMiddle = lerp(this.paddlePos.y, nextPaddlePos.y, passXTime) + (this.paddleSize.height / 2);
            const ballMiddle = lerp(this.ballPos.y, nextBallPos.y, passXTime) + (this.ballSize.height / 2);

            // if colided
            if (Math.abs(paddleMiddle - ballMiddle) <= (this.ballSize.height / 2) + (this.paddleSize.height / 2) + colLeway) {
                // dt * passXTime = time traveled at original velocity
                // dt - that one = time traveled at new velocity
                const dtOldVel = dt * passXTime;
                const dtNewVel = dt - dtOldVel;

                finalBallPos.x = this.ballPos.x + (dtOldVel * this.ballVelocty.x);
                finalBallPos.y = this.ballPos.y + (dtOldVel * this.ballVelocty.y);

                this.ballVelocty.x = -this.ballVelocty.x + (this.paddleVelocty.x * paddleXTransfer);
                //const normalizedYContact = (ballMiddle - paddleMiddle) / ((ballSize.height / 2) + (paddleSize.height / 2) + colLeway);
                this.ballVelocty.y += (this.paddleVelocty.y * paddleYTransfer);
                
                finalBallPos.x += dtNewVel * this.ballVelocty.x;
                finalBallPos.y += dtNewVel * this.ballVelocty.y;
            }
        }

        // if hit wall "bounce?"
        if (this.ballVelocty.x < 0 && nextBallPos.x < 0) {
            const percOld = (this.ballPos.x) / (this.ballPos.x - nextBallPos.x);
            const percNew = 1 - percOld;

            finalBallPos.x = this.ballPos.x + (this.ballVelocty.x * dt * percOld);
            
            this.ballVelocty.x = -this.ballVelocty.x;

            finalBallPos.x += this.ballVelocty.x * dt * percNew;
        } else if (this.ballVelocty.x > 0 && nextBallPos.x > this.gameWindowSize.width - this.ballSize.width) {
            const percOld = (this.gameWindowSize.width - this.ballSize.width - this.ballPos.x) / (nextBallPos.x - this.ballPos.x);
            const percNew = 1 - percOld;

            finalBallPos.x = this.ballPos.x + (this.ballVelocty.x * dt * percOld);
            this.ballVelocty.x = -this.ballVelocty.x;
            finalBallPos.x += this.ballVelocty.x * dt * percNew;
        }

        if (this.ballVelocty.y < 0 && nextBallPos.y < 0) {
            const percOld = this.ballPos.y / (this.ballPos.y - nextBallPos.y);
            const percNew = 1 - percOld;

            finalBallPos.y = this.ballPos.y + (this.ballVelocty.y * dt * percOld);
            
            this.ballVelocty.y = -this.ballVelocty.y;

            finalBallPos.y += this.ballVelocty.y * dt * percNew;
        } else if (this.ballVelocty.y > 0 && nextBallPos.y > this.gameWindowSize.height - this.ballSize.height) {
            const percOld = (this.gameWindowSize.height - this.ballSize.height - this.ballPos.y) / (nextBallPos.y - this.ballPos.y);
            const percNew = 1 - percOld;

            finalBallPos.y = this.ballPos.y + (this.ballVelocty.y * dt * percOld);
            this.ballVelocty.y = -this.ballVelocty.y;
            finalBallPos.y += this.ballVelocty.y * dt * percNew;
        }

        return finalBallPos;
    }

    update(dt)
    {   
        //if (this.enabled === false) { return; }

        const nextBallPos = { 
            x: this.ballPos.x + (this.ballVelocty.x * dt), 
            y: this.ballPos.y + (this.ballVelocty.y * dt) 
        };

        const nextPaddlePos = this.getNextPaddlePos(dt);
        const finalBallPos = this.ballCollisions(dt, nextBallPos, nextPaddlePos);

        this.paddlePos.x = nextPaddlePos.x;
        this.paddlePos.y = nextPaddlePos.y;
        this.ballPos.x = finalBallPos.x;
        this.ballPos.y = finalBallPos.y;

        // set ball position
        this.ball.style.bottom = `${this.ballPos.y}px`;
        this.ball.style.left = `${this.ballPos.x}px`;

        // set paddle position
        this.paddle.style.bottom = `${this.paddlePos.y}px`;
        this.paddle.style.left = `${this.paddlePos.x}px`;

        // apply gravity if above ground
        if (this.ballPos.y > 0.1) {
            this.ballVelocty.y -= BallGame.gravity * dt;
        }

        // apply resistance
        if (this.ballPos.y > 0.1) {
            this.ballVelocty.x -= (BallGame.airResistance * this.ballVelocty.x) * dt;
            this.ballVelocty.y -= (BallGame.airResistance * this.ballVelocty.y) * dt;
        } else {
            this.ballVelocty.x -= (BallGame.groundResistance * this.ballVelocty.x) * dt;
        }
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }
}

// util funciont
function lerp(a,b,t) {
    return a + ((a - b) * t);
}