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

            // Réinitialisation des tuyaux
            pipes.forEach((pipe, index) => {
                let pipeX = gameCanvas.clientWidth + index * pipeSpacing;
                pipe.style.left = `${pipeX}px`;

                let pipeHeight = generateRandomPipeHeight(); // Hauteur du tuyau supérieur
                if (pipe.classList.contains("top")) {
                    pipe.style.height = `${pipeHeight}px`;
                    pipe.style.top = "0";
                } else {
                    let pipeBottomHeight = gameCanvas.clientHeight - pipeHeight - pipeGap; // Hauteur du tuyau inférieur
                    pipe.style.height = `${pipeBottomHeight}px`;
                    pipe.style.top = `${pipeHeight + pipeGap}px`;
                }
                pipe.passed = false; // Réinitialise le statut de passage
            });
        } else {
            birdVelocity = jump; // Fait monter l'oiseau si le jeu est en cours
        }
    }

    function generateRandomPipeHeight() {
        const minHeight = 50; // Hauteur minimum d'un tuyau
        const maxHeight = gameCanvas.clientHeight - pipeGap - minHeight; // Hauteur maximum d'un tuyau
        return Math.random() * (maxHeight - minHeight) + minHeight; // Génère une hauteur aléatoire
    }

    function updateScore() {
        scoreElement.innerText = `Score: ${score}`; // Met à jour l'affichage du score
    }

    function update() {
        if (isGameOver || !gameStarted) return; // Sort de la fonction si le jeu est terminé ou pas commencé

        birdVelocity += gravity; // Applique la gravité
        birdY += birdVelocity; // Met à jour la position verticale de l'oiseau

        // Change l'image de l'oiseau en fonction de sa direction
        if (birdVelocity < 0) {
            bird.style.backgroundImage = 'url("./images/Bird-2.png")'; // Oiseau en montée
        } else {
            bird.style.backgroundImage = 'url("./images/Bird.png")'; // Oiseau en descente
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
        bird.style.top = `${birdY}px`; // Met à jour la position de l'oiseau

        // Parcourt chaque tuyau
        pipes.forEach((pipe) => {
            let pipeX = parseFloat(window.getComputedStyle(pipe).left) || 0; // Position actuelle du tuyau
            pipeX -= pipeSpeed; // Déplace le tuyau vers la gauche

            // Vérifie si l'oiseau a franchi un tuyau
            if (pipeX + pipe.offsetWidth < bird.offsetLeft && !pipe.passed) {
                score++; // Augmente le score
                pipe.passed = true; // Indique que le tuyau a été franchi
                updateScore(); // Met à jour le score affiché
                pointSound.play(); // Joue le son quand un tuyau est franchi
            }

            // Réinitialise les tuyaux lorsqu'ils sortent de l'écran
            if (pipeX < -pipe.offsetWidth) {
                pipeX = gameCanvas.clientWidth + pipeSpacing; // Replace le tuyau à droite
                let pipeHeight = generateRandomPipeHeight(); // Génère une nouvelle hauteur de tuyau
                let pipeBottomHeight = gameCanvas.clientHeight - pipeHeight - pipeGap;

                if (pipe.classList.contains("top")) {
                    pipe.style.height = `${pipeHeight}px`;
                    pipe.style.top = "0"; // Positionne le tuyau supérieur
                } else {
                    pipe.style.height = `${pipeBottomHeight}px`;
                    pipe.style.top = `${pipeHeight + pipeGap}px`; // Positionne le tuyau inférieur
                }
                pipe.passed = false; // Réinitialise le statut de passage
            }

            pipe.style.left = `${pipeX}px`; // Met à jour la position du tuyau
            checkCollision(bird, pipe); // Vérifie la collision
        });
    }

    function checkCollision(bird, pipe) {
        const birdRect = bird.getBoundingClientRect(); // Récupère les dimensions de l'oiseau
        const pipeRect = pipe.getBoundingClientRect(); // Récupère les dimensions du tuyau

        // Vérifie si l'oiseau touche un tuyau
        if (
            birdRect.left < pipeRect.right &&
            birdRect.right > pipeRect.left &&
            birdRect.top < pipeRect.bottom &&
            birdRect.bottom > pipeRect.top
        ) {
            gameOver(); // Si collision, termine le jeu
        }
    }

    function gameOver() {
        isGameOver = true; // Met à jour le statut du jeu
        bird.style.backgroundImage = 'url("./images/Bird.png")'; // Réinitialise l'image de l'oiseau
        gameOverDiv.classList.remove('hidden'); // Affiche l'écran de game over
        bestScoreElement.innerText = `${Math.max(score, bestScore)}`; // Affiche le meilleur score

        // Joue le son de la fin de jeu
        dieSound.play();

        // Met à jour le meilleur score dans le stockage local
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore); // Enregistre le meilleur score
        }

        // Cache les instructions initialement
        instructions.style.display = 'none'; 
    }

    function restartGame() {
        gameStarted = false; // Le jeu n'est plus lancé
        isGameOver = false; // Indique que le jeu n'est pas terminé
        birdY = gameCanvas.clientHeight / 2; // Réinitialise la position de l'oiseau
        birdVelocity = 0; // Réinitialise la vitesse de l'oiseau
        score = 0; // Réinitialise le score
        updateScore(); // Met à jour l'affichage du score
        gameOverDiv.classList.add('hidden'); // Cache l'écran de game over

        // Réinitialise les tuyaux
        pipes.forEach((pipe, index) => {
            let pipeX = gameCanvas.clientWidth + index * pipeSpacing;
            pipe.style.left = `${pipeX}px`;

            let pipeHeight = generateRandomPipeHeight(); // Hauteur du tuyau supérieur
            if (pipe.classList.contains("top")) {
                pipe.style.height = `${pipeHeight}px`;
                pipe.style.top = "0"; // Positionne le tuyau supérieur
            } else {
                let pipeBottomHeight = gameCanvas.clientHeight - pipeHeight - pipeGap; // Hauteur du tuyau inférieur
                pipe.style.height = `${pipeBottomHeight}px`;
                pipe.style.top = `${pipeHeight + pipeGap}px`; // Positionne le tuyau inférieur
            }
            pipe.passed = false; // Réinitialise le statut de passage
        });

        // Affiche les instructions après un délai
        setTimeout(() => {
            instructions.style.display = 'block'; // Affiche les instructions
        }, 500); // Attendre 500 ms après le game over
    }

    document.addEventListener("keydown", handleKeyDown); // Écouteur pour les touches clavier
    document.addEventListener("touchstart", handleTouch); // Écouteur pour le toucher sur écran

    // Boucle de jeu
    function gameLoop() {
        update(); // Met à jour le jeu
        requestAnimationFrame(gameLoop); // Demande une nouvelle animation
    }

    gameLoop(); // Lance la boucle de jeu

    // Initialisation des tuyaux
    pipes.forEach((pipe, index) => {
        let pipeX = gameCanvas.clientWidth + index * pipeSpacing;
        pipe.style.left = `${pipeX}px`;

        let pipeHeight = generateRandomPipeHeight(); // Hauteur du tuyau supérieur
        if (pipe.classList.contains("top")) {
            pipe.style.height = `${pipeHeight}px`;
            pipe.style.top = "0"; // Positionne le tuyau supérieur
        } else {
            let pipeBottomHeight = gameCanvas.clientHeight - pipeHeight - pipeGap; // Hauteur du tuyau inférieur
            pipe.style.height = `${pipeBottomHeight}px`;
            pipe.style.top = `${pipeHeight + pipeGap}px`; // Positionne le tuyau inférieur
        }
        pipe.passed = false; // Réinitialise le statut de passage
    });
});