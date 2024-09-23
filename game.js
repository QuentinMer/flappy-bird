document.addEventListener("DOMContentLoaded", () => {
    // Récupération des éléments du DOM
    const bird = document.getElementById("bird");
    const pipes = document.querySelectorAll(".pipe");
    const gameCanvas = document.getElementById("gameCanvas");
    const scoreElement = document.getElementById('score');
    const gameOverDiv = document.getElementById('gameOver');
    const bestScoreElement = document.getElementById('bestScore');
    const instructions = document.getElementById('instructions');

    // Initialisation des variables
    let birdY = gameCanvas.clientHeight / 2;
    let birdVelocity = 0;
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;
    const gravity = 0.5;
    const jump = -8;
    let isGameOver = false;
    let gameStarted = false;
    const pipeSpeed = 2;
    const pipeGap = 200;
    const pipeSpacing = 250;

    // Création des objets Audio pour les sons
    const pointSound = new Audio('./soundsEffect/point.mp3');
    const dieSound = new Audio('./soundsEffect/die.wav');
    const musicGame = document.getElementById('musicGame');

    // Réglage des volumes
    musicGame.volume = 0.3; // Volume de la musique de fond
    pointSound.volume = 1.0; 
    dieSound.volume = 1.0; 

    function handleKeyDown(event) {
        if (event.code === "ArrowUp" && !isGameOver && gameStarted) {
            birdVelocity = jump;
        }

        if (event.code === "Space") {
            if (isGameOver) {
                restartGame();
            } else if (!gameStarted) {
                gameStarted = true;
                instructions.style.display = 'none'; // Masque les instructions
                musicGame.play(); // Démarre la musique de fond
                birdY = gameCanvas.clientHeight / 2;
                birdVelocity = 0;
                isGameOver = false;

                // Réinitialisation des tuyaux
                pipes.forEach((pipe, index) => {
                    let pipeX = gameCanvas.clientWidth + index * pipeSpacing;
                    pipe.style.left = `${pipeX}px`;

                    let pipeHeight = generateRandomPipeHeight();
                    let pipeTopHeight = pipeHeight;
                    let pipeBottomHeight = gameCanvas.clientHeight - pipeTopHeight - pipeGap;

                    if (pipe.classList.contains("top")) {
                        pipe.style.height = `${pipeTopHeight}px`;
                        pipe.style.top = "0";
                    } else {
                        pipe.style.height = `${pipeBottomHeight}px`;
                        pipe.style.top = `${pipeTopHeight + pipeGap}px`;
                    }
                    pipe.passed = false;
                });
            }
        }
    }
    // Événements tactiles pour smartphones
document.addEventListener("touchstart", (event) => {
    if (isGameOver) {
        restartGame(); // Relance le jeu
    } else {
        if (!gameStarted) {
            gameStarted = true;
            instructions.style.display = 'none'; // Masque les instructions
            birdY = gameCanvas.clientHeight / 2;
            birdVelocity = 0;
            isGameOver = false;

            // Réinitialisation des tuyaux
            pipes.forEach((pipe, index) => {
                let pipeX = gameCanvas.clientWidth + index * pipeSpacing;
                pipe.style.left = `${pipeX}px`;

                let pipeHeight = generateRandomPipeHeight();
                let pipeTopHeight = pipeHeight;
                let pipeBottomHeight = gameCanvas.clientHeight - pipeTopHeight - pipeGap;

                if (pipe.classList.contains("top")) {
                    pipe.style.height = `${pipeTopHeight}px`;
                    pipe.style.top = "0";
                } else {
                    pipe.style.height = `${pipeBottomHeight}px`;
                    pipe.style.top = `${pipeTopHeight + pipeGap}px`;
                }
                pipe.passed = false;
            });
        } else {
            birdVelocity = jump; // Fait sauter l'oiseau
        }
    }
});

    function generateRandomPipeHeight() {
        const minHeight = 50;
        const maxHeight = gameCanvas.clientHeight - pipeGap - minHeight;
        return Math.random() * (maxHeight - minHeight) + minHeight;
    }

    function updateScore() {
        scoreElement.innerText = `Score: ${score}`;
    }

    function update() {
        if (isGameOver || !gameStarted) return;

        birdVelocity += gravity;
        birdY += birdVelocity;

        // Change l'image de l'oiseau en fonction de sa direction
        if (birdVelocity < 0) {
            bird.style.backgroundImage = 'url("./images/Bird-2.png")';
        } else {
            bird.style.backgroundImage = 'url("./images/Bird.png")';
        }

        // Empêche l'oiseau de sortir par le bas du canvas
        if (birdY > gameCanvas.clientHeight - bird.offsetHeight) {
            birdY = gameCanvas.clientHeight - bird.offsetHeight; // Place l'oiseau au sol
            birdVelocity = 0; // Arrête l'oiseau
            gameOver(); // Termine le jeu
        }

        // Empêche l'oiseau de sortir par le haut du canvas
        if (birdY < 0) {
            birdY = 0; // Place l'oiseau tout en haut
            birdVelocity = 0; // Arrête l'oiseau
            gameOver(); // Termine le jeu
        }

        bird.style.top = `${birdY}px`;

        // Parcourt chaque tuyau
        pipes.forEach((pipe) => {
            let pipeX = parseFloat(window.getComputedStyle(pipe).left) || 0;
            pipeX -= pipeSpeed;

            // Vérifie si l'oiseau a franchi un tuyau
            if (pipeX + pipe.offsetWidth < bird.offsetLeft && !pipe.passed) {
                score++;
                pipe.passed = true;
                updateScore();
                pointSound.play(); // Joue le son quand un tuyau est franchi
            }

            // Réinitialise les tuyaux lorsqu'ils sortent de l'écran
            if (pipeX < -pipe.offsetWidth) {
                pipeX = gameCanvas.clientWidth + pipeSpacing;
                let pipeHeight = generateRandomPipeHeight();
                let pipeTopHeight = pipeHeight;
                let pipeBottomHeight = gameCanvas.clientHeight - pipeTopHeight - pipeGap;

                if (pipe.classList.contains("top")) {
                    pipe.style.height = `${pipeTopHeight}px`;
                    pipe.style.top = "0";
                } else {
                    pipe.style.height = `${pipeBottomHeight}px`;
                    pipe.style.top = `${pipeTopHeight + pipeGap}px`;
                }
                pipe.passed = false;
            }

            pipe.style.left = `${pipeX}px`;
            checkCollision(bird, pipe);
        });
    }

    function checkCollision(bird, pipe) {
        const birdRect = bird.getBoundingClientRect();
        const pipeRect = pipe.getBoundingClientRect();

        // Vérifie si l'oiseau touche un tuyau
        if (
            birdRect.left < pipeRect.right &&
            birdRect.right > pipeRect.left &&
            birdRect.top < pipeRect.bottom &&
            birdRect.bottom > pipeRect.top
        ) {
            gameOver();
        }
    }

    function gameOver() {
        isGameOver = true;
        bird.style.backgroundImage = 'url("./images/Bird.png")';
        gameOverDiv.classList.remove('hidden');
        bestScoreElement.innerText = `${Math.max(score, bestScore)}`;

        // Joue le son de la fin de jeu
        dieSound.play();

        // Met à jour le meilleur score dans le stockage local
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore);
        }
    }

    function restartGame() {
        gameStarted = false;
        isGameOver = false;
        birdY = gameCanvas.clientHeight / 2;
        birdVelocity = 0;
        score = 0;
        updateScore();
        gameOverDiv.classList.add('hidden');
    
        // Réaffiche les instructions
        instructions.style.display = 'flex'; // Ou 'block' selon ton style
    
        pipes.forEach((pipe, index) => {
            let pipeX = gameCanvas.clientWidth + index * pipeSpacing;
            pipe.style.left = `${pipeX}px`;
    
            let pipeHeight = generateRandomPipeHeight();
            let pipeTopHeight = pipeHeight;
            let pipeBottomHeight = gameCanvas.clientHeight - pipeTopHeight - pipeGap;
    
            if (pipe.classList.contains("top")) {
                pipe.style.height = `${pipeTopHeight}px`;
                pipe.style.top = "0";
            } else {
                pipe.style.height = `${pipeBottomHeight}px`;
                pipe.style.top = `${pipeTopHeight + pipeGap}px`;
            }
            pipe.passed = false;
        });
    }

    document.addEventListener("keydown", handleKeyDown);

    function gameLoop() {
        update();
        requestAnimationFrame(gameLoop);
    }

    // Initialisation des tuyaux
    pipes.forEach((pipe, index) => {
        let pipeX = gameCanvas.clientWidth + index * pipeSpacing;
        pipe.style.left = `${pipeX}px`;

        let pipeHeight = generateRandomPipeHeight();
        let pipeTopHeight = pipeHeight;
        let pipeBottomHeight = gameCanvas.clientHeight - pipeTopHeight - pipeGap;

        if (pipe.classList.contains("top")) {
            pipe.style.height = `${pipeTopHeight}px`;
            pipe.style.top = "0";
        } else {
            pipe.style.height = `${pipeBottomHeight}px`;
            pipe.style.top = `${pipeTopHeight + pipeGap}px`;
        }
        pipe.passed = false;
    });

    gameLoop();
});