// Get canvas context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game variables
let playerShip;
let enemyShip;
let projectiles = [];
let enemyProjectiles = [];
let keys = {};
let gameOver = false;

// Player Ship Class
class Ship {
    constructor(x, y, color, controls) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.color = color;
        this.speed = 5;
        this.health = 100; // Initial health
        this.controls = controls;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move() {
        if (keys[this.controls.up]) this.y -= this.speed;
        if (keys[this.controls.down]) this.y += this.speed;
        if (keys[this.controls.left]) this.x -= this.speed;
        if (keys[this.controls.right]) this.x += this.speed;
    }

    drawHealthBar() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y - 10, this.width, 5);  // Health bar background
        ctx.fillStyle = "green";
        ctx.fillRect(this.x, this.y - 10, this.width * (this.health / 100), 5);  // Health bar foreground
    }
}

// Projectile Class
class Projectile {
    constructor(x, y, velocityX, velocityY, damage) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 5;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = damage; // Damage for each projectile
    }

    draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
    }
}

// Create player and enemy ships
function createShips() {
    playerShip = new Ship(100, canvas.height / 2, "blue", { up: "w", down: "s", left: "a", right: "d" });
    enemyShip = new Ship(canvas.width - 150, canvas.height / 2, "red", { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" });
    enemyShip.health = 500; // Extremely high health for the enemy
}

// Handle key inputs
document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// Shoot a projectile
function shootProjectile(x, y, velocityX, velocityY, damage) {
    projectiles.push(new Projectile(x, y, velocityX, velocityY, damage));
}

// Enemy ship AI - Move and shoot at player
function enemyAI() {
    const chaseSpeed = 3; // Moderate movement speed to avoid sticking to player
    const attackSpeed = 0.05; // Increase frequency of attacks
    const attackChance = Math.random(); // Random chance for enemy to shoot

    // Make the enemy move randomly
    if (Math.random() < 0.5) {
        // Random horizontal movement
        if (enemyShip.x < playerShip.x) enemyShip.x += chaseSpeed;
        if (enemyShip.x > playerShip.x) enemyShip.x -= chaseSpeed;
    } else {
        // Random vertical movement
        if (enemyShip.y < playerShip.y) enemyShip.y += chaseSpeed;
        if (enemyShip.y > playerShip.y) enemyShip.y -= chaseSpeed;
    }

    // Prevent enemy from moving off the canvas
    enemyShip.x = Math.max(0, Math.min(canvas.width - enemyShip.width, enemyShip.x));
    enemyShip.y = Math.max(0, Math.min(canvas.height - enemyShip.height, enemyShip.y));

    // Enemy shoots at the player with a chance based on attackSpeed
    if (attackChance < attackSpeed) {
        shootEnemyProjectile();
    }
}

// Shoot a projectile from the enemy ship
function shootEnemyProjectile() {
    const velocityX = -10; // Super fast projectiles
    const velocityY = 0;
    const damage = 20; // Extremely high damage for each projectile
    enemyProjectiles.push(new Projectile(enemyShip.x, enemyShip.y + enemyShip.height / 2, velocityX, velocityY, damage));
}

// Check for game over (health < 50)
function checkGameOver() {
    if (playerShip.health <= 0 || enemyShip.health <= 0) {
        gameOver = true;
        endGame();
    }
}

// End the game and display the winner
function endGame() {
    let message = "";
    if (playerShip.health <= 0) {
        message = "Game Over! You Lost!";
    } else if (enemyShip.health <= 0) {
        message = "You Win!";
    }

    // Display the result message on the canvas
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText(message, canvas.width / 2 - 100, canvas.height / 2);

    // Display Restart Button
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Press 'R' to Restart", canvas.width / 2 - 100, canvas.height / 2 + 40);
}

// Restart the game
function restartGame() {
    if (gameOver) {
        gameOver = false;
        projectiles = [];
        enemyProjectiles = [];
        createShips();
        updateGame();
    }
}

// Update game objects
function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas

    // Update and draw player ship
    playerShip.move();
    playerShip.draw();
    playerShip.drawHealthBar();

    // Update and draw enemy ship
    enemyAI(); // Update enemy AI (move and shoot)
    enemyShip.draw();
    enemyShip.drawHealthBar();

    // Update and draw projectiles
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].update();
        projectiles[i].draw();

        // Check for collisions with enemy ship
        if (projectiles[i].x < enemyShip.x + enemyShip.width &&
            projectiles[i].x + projectiles[i].width > enemyShip.x &&
            projectiles[i].y < enemyShip.y + enemyShip.height &&
            projectiles[i].y + projectiles[i].height > enemyShip.y) {
            enemyShip.health -= projectiles[i].damage; // Deal damage to enemy
            projectiles.splice(i, 1);  // Remove the projectile after it hits
            i--;
        }
    }

    // Update and draw enemy projectiles
    for (let i = 0; i < enemyProjectiles.length; i++) {
        enemyProjectiles[i].update();
        enemyProjectiles[i].draw();

        // Check for collisions with player ship
        if (enemyProjectiles[i].x < playerShip.x + playerShip.width &&
            enemyProjectiles[i].x + enemyProjectiles[i].width > playerShip.x &&
            enemyProjectiles[i].y < playerShip.y + playerShip.height &&
            enemyProjectiles[i].y + enemyProjectiles[i].height > playerShip.y) {
            playerShip.health -= enemyProjectiles[i].damage; // Deal damage to player
            enemyProjectiles.splice(i, 1);  // Remove the enemy projectile after it hits
            i--;
        }
    }

    // Check if the game is over
    checkGameOver();

    // Request next frame if game is not over
    if (!gameOver) {
        requestAnimationFrame(updateGame);
    }
}

// Start the game
function startGame() {
    createShips();
    updateGame();
}

// Fire projectiles (e.g., on space bar for player)
document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
        shootProjectile(playerShip.x + playerShip.width, playerShip.y + playerShip.height / 2, 7, 0, 10);
    }
    
    // Restart the game if 'R' is pressed after game over
    if (e.key === "r" || e.key === "R") {
        restartGame();
    }
});

startGame();




