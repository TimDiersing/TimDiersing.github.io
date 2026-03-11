class ShootingGame {
    static hitScale = [440, 493.8833, 554.3653, 587.3295, 659.2551, 739.9888, 830.6094, 880.0000];

    constructor() {
        this.enabled = false;

        this.gameWindow = document.querySelector(".shooting-game .shooting-area");
        this.statsText = document.querySelector(".shooting-game .stats .stats-text");
        this.resetButton = document.querySelector(".shooting-game .reset-button");

        const gameWindowStyle = getComputedStyle(this.gameWindow);
        this.gameWindowSize = 
        {
            width: parseFloat(gameWindowStyle.width),
            height: parseFloat(gameWindowStyle.height),
        };

        this.targetSize = 
        {
            width: 35,
            height: 35,
        };

        this.targetInfoList = [];
        this.targetsHit = 0;
        this.misses = 0;
        this.hitInARow = 0;
        this.speedRange = { min: 50, max: 75 };

        this.setup();
    }

    update(dt)
    {
        if (!this.enabled) { return; }

        this.targetInfoList.forEach(targetInfo => {
            if (targetInfo.hit === true) {
                targetInfo.respawnTimer -= dt;

                if (targetInfo.respawnTimer <= 0) {
                    targetInfo.hit = false;
                    targetInfo.target.classList.remove("hit");
                }
            } else {
                
                targetInfo.posX += targetInfo.goingRight ? targetInfo.speed * dt : -targetInfo.speed * dt;
                targetInfo.target.style.left = `${targetInfo.posX}px`;

                // Reverse direction if hit end
                if (targetInfo.posX <= 0) {
                    targetInfo.goingRight = true;
                } else if (targetInfo.posX >= this.gameWindowSize.width - this.targetSize.width){
                    targetInfo.goingRight = false;
                }
            }
        });

        // refresh stats text every frame ig
        this.statsText.textContent = `targets hit - ${this.targetsHit}   |   accuracy - ${this.misses === 0 ? 100 : Math.trunc(this.targetsHit / (this.targetsHit + this.misses) * 100)}%`;
    }

    setup()
    {
        this.resetButton.addEventListener("click", () => {
            this.targetsHit = 0;
            this.misses = 0;
            this.hitInARow = 0;
            this.resetTargets();
        });

        this.gameWindow.addEventListener("mousedown", (e) => {
            if (e.target === e.currentTarget) {
                this.missed();
            }
        });

        this.statsText.textContent = "targets hit - 0   |   accuracy - 0%";

        // Spawn targets
        const targetAmount = 8;
        for (let i = 0; i < targetAmount; i++)
        {
            const target = document.createElement("div");
            this.gameWindow.appendChild(target);

            const targetIndex = i;
            target.addEventListener("mousedown", () => {this.targetHit(targetIndex);});
            target.classList.add("target");

            let targetInfo = {
                target: target,
                hit: false,
                respawnTimer: 0,
                goingRight: false,
                speed: 0,
                posX: 0,
                posY: 0,
            };

            this.targetInfoList.push(targetInfo);
        }

        this.resetTargets();

        // Setup audio
        this.sfxBus = audioCtx.createGain();
        this.sfxBus.connect(audioCtx.destination);
    }

    resetTargets()
    {
        this.targetInfoList.forEach(targetInfo => {
            targetInfo.hit = false;
            targetInfo.respawnTimer = 0;
            targetInfo.target.classList.remove("hit");
            targetInfo.goingRight = Math.random() > 0.5;
            targetInfo.speed = Math.random() * (this.speedRange.max - this.speedRange.min) + this.speedRange.min;
            targetInfo.posX = Math.floor(Math.random() * (this.gameWindowSize.width - this.targetSize.width));
            targetInfo.posY = Math.floor(Math.random() * (this.gameWindowSize.height - this.targetSize.height));
        
            targetInfo.target.style.left = `${targetInfo.posX}px`;
            targetInfo.target.style.bottom = `${targetInfo.posY}px`;
            targetInfo.target.style.zIndex = this.gameWindowSize.height - targetInfo.posY;

            targetInfo.target.style.width = `${this.targetSize.width}px`;
            targetInfo.target.style.height = `${this.targetSize.height}px`;
        });
    }

    targetHit(targetIndex) {
        const respawnTime = 5;
        const targetInfo = this.targetInfoList[targetIndex];

        if (targetInfo.hit === true) {
            this.missed();
            return;
        }

        this.targetsHit++;
        this.hitInARow++;

        const freq = ShootingGame.hitScale[Math.min(ShootingGame.hitScale.length - 1, this.hitInARow - 1)];
        playSound(this.sfxBus, freq, "triangle", 0.3, 0.02, 0.2);

        targetInfo.target.classList.add("hit");
        targetInfo.hit = true;
        targetInfo.respawnTimer = respawnTime;
    }

    missed() {
        this.misses++;
        this.hitInARow = 0;
        playSound(this.sfxBus, 320, "sawtooth", 0.2, 0.005, 0.1);
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }
}

function playSound(sfxBus, freq, type, peak, attack, decay)
{
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    const t0 = audioCtx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);

    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(peak, t0 + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);

    osc.connect(env);
    env.connect(sfxBus);

    osc.start(t0);
    osc.stop(t0 + attack + decay + 0.2);

    osc.onended = () => {
        osc.disconnect();
        env.disconnect();
    };
}