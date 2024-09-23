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
    let birdY = gameCanvas.clientHeight / 2; // Position initiale de l'oiseau
    let birdVelocity = 0; // Vitesse de l'oiseau
    let score = 0; // Score du joueur
    let bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0; // Meilleur score enregistré
    const gravity = 0.6; // Gravité qui attire l'oiseau vers le bas
    const jump = -10; // Vitesse de montée de l'oiseau
    let isGameOver = false; // Statut du jeu
    let gameStarted = false; // Statut de démarrage du jeu
    const pipeSpeed = 2; // Vitesse de déplacement des tuyaux
    const pipeGap = 200; // Espace entre le tuyau du haut et du bas
    const pipeSpacing = 250; // Espacement entre les tuyaux
    let lastBirdImageChange = 0; // Suivi du dernier changement d'image de l'oiseau

    // Création des objets Audio pour les sons
    const pointSound = new Audio('./soundsEffect/point.mp3');
    const dieSound = new Audio('./soundsEffect/die.wav');
    const musicGame = document.getElementById("musicGame");

    // Réglage des volumes
    musicGame.volume = 0.6;
    pointSound.volume = 1.0;
    dieSound.volume = 1.0;

    function handleKeyDown(event) {
        if (event.code === "ArrowUp" && !isGameOver && gameStarted) {
            birdVelocity = jump; // Fait monter l'oiseau
        }

        if (event.code === "Space") {
            handleGameControl();
        }
    }

    function handleTouch() {
        handleGameControl();
    }

    function handleGameControl() {
        if (isGameOver) {
            restartGame(); // Relance le jeu
        } else if (!gameStarted) {
            gameStarted = true; // Démarre le jeu
            instructions.style.display = 'none'; // Cache les instructions
            birdY = gameCanvas.clientHeight / 2; // Réinitialise la position de l'oiseau
            birdVelocity = 0; // Réinitialise la vitesse de l'oiseau
            isGameOver = false; // Indique que le jeu est en cours

            musicGame.play(); // Démarre la musique de fond

            resetPipes(); // Réinitialisation des tuyaux
        } else {
            birdVelocity = jump; // Fait monter l'oiseau si le jeu est en cours
        }
    }

    function generateRandomPipeHeight(lastHeight = null) {
        const minHeight = 50; // Hauteur minimum d'un tuyau
        const maxHeight = gameCanvas.clientHeight - pipeGap - minHeight; // Hauteur maximum d'un tuyau

        let height = Math.random() * (maxHeight - minHeight) + minHeight;

        // Si une dernière hauteur est fournie, assure que la nouvelle hauteur est suffisamment éloignée
        if (lastHeight !== null) {
            height = Math.max(minHeight, Math.min(height, lastHeight - pipeGap + minHeight));
        }

        return height;
    }

    function resetPipes() {
        let lastPipeHeight = null; // Variable pour stocker la hauteur du dernier tuyau

        pipes.forEach((pipe, index) => {
            let pipeX = gameCanvas.clientWidth + index * pipeSpacing;
            pipe.style.left = `${pipeX}px`;

            if (pipe.classList.contains("top")) {
                let pipeHeight = generateRandomPipeHeight(lastPipeHeight);
                pipe.style.height = `${pipeHeight}px`;
                pipe.style.top = "0"; // Positionne le tuyau supérieur
                lastPipeHeight = pipeHeight; // Met à jour la dernière hauteur
            } else {
                let pipeHeight = lastPipeHeight; // Utilise la hauteur du tuyau supérieur
                let pipeBottomHeight = gameCanvas.clientHeight - pipeHeight - pipeGap; // Hauteur du tuyau inférieur
                pipe.style.height = `${pipeBottomHeight}px`;
                pipe.style.top = `${pipeHeight + pipeGap}px`; // Positionne le tuyau inférieur
            }
            pipe.passed = false; // Réinitialise le statut de passage
        });
    }

    function updateScore() {
        scoreElement.innerText = `Score: ${score}`; // Met à jour l'affichage du score
    }

    function update() {
        if (isGameOver || !gameStarted) return;

        birdVelocity += gravity;
        birdY += birdVelocity;

        const now = Date.now();
        if (now - lastBirdImageChange > 100) {
            if (birdVelocity < 0) {
                bird.style.backgroundImage = 'url("./images/Bird-2.png")'; // Oiseau en montée
            } else {
                bird.style.backgroundImage = 'url("./images/Bird.png")'; // Oiseau en descente
            }
            lastBirdImageChange = now; // Met à jour le temps du dernier changement d'image
        }

        if (birdY > gameCanvas.clientHeight - bird.offsetHeight) {
            birdY = gameCanvas.clientHeight - bird.offsetHeight;
            birdVelocity = 0;
            gameOver();
        }

        if (birdY < 0) {
            birdY = 0;
            birdVelocity = 0;
            gameOver();
        }

        bird.style.top = `${birdY}px`;

        pipes.forEach((pipe) => {
            let pipeX = parseFloat(window.getComputedStyle(pipe).left) || 0;
            pipeX -= pipeSpeed;

            if (pipeX + pipe.offsetWidth < bird.offsetLeft && !pipe.passed) {
                score++;
                pipe.passed = true;
                updateScore();
                pointSound.play();
            }

            if (pipeX < -pipe.offsetWidth) {
                pipeX = gameCanvas.clientWidth + pipeSpacing;
                let pipeHeight = generateRandomPipeHeight();
                let pipeBottomHeight = gameCanvas.clientHeight - pipeHeight - pipeGap;

                if (pipe.classList.contains("top")) {
                    pipe.style.height = `${pipeHeight}px`;
                    pipe.style.top = "0";
                } else {
                    pipe.style.height = `${pipeBottomHeight}px`;
                    pipe.style.top = `${pipeHeight + pipeGap}px`;
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
        bird.style.backgroundImage = 'url("./images/Bird.png")'; // Réinitialise l'image de l'oiseau
        gameOverDiv.classList.remove('hidden'); // Affiche l'écran de game over
        bestScoreElement.innerText = `${Math.max(score, bestScore)}`; // Affiche le meilleur score

        dieSound.play();

        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore); // Enregistre le meilleur score
        }

        instructions.style.display = 'none'; 
    }

    function restartGame() {
        gameStarted = false;
        isGameOver = false;
        birdY = gameCanvas.clientHeight / 2;
        birdVelocity = 0;
        score = 0;
        updateScore();
        gameOverDiv.classList.add('hidden');
        resetPipes();

        setTimeout(() => {
            instructions.style.display = 'block'; // Affiche les instructions
        }, 500);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("touchstart", handleTouch);

    function gameLoop() {
        update();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();

    pipes.forEach((pipe, index) => {
        let pipeX = gameCanvas.clientWidth + index * pipeSpacing;
        pipe.style.left = `${pipeX}px`;

        let pipeHeight = generateRandomPipeHeight();
        if (pipe.classList.contains("top")) {
            pipe.style.height = `${pipeHeight}px`;
            pipe.style.top = "0";
        } else {
            let pipeBottomHeight = gameCanvas.clientHeight - pipeHeight - pipeGap;
            pipe.style.height = `${pipeBottomHeight}px`;
            pipe.style.top = `${pipeHeight + pipeGap}px`;
        }
    });
});