const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

const scoreEl = document.querySelector("#scoreEl");
const modalEl = document.querySelector("#modalEl");
const startModalEl = document.querySelector("#startModalEl");
const modalScoreEl = document.querySelector("#modalScoreEl");
const buttonEl = document.querySelector("#buttonEl");
const startButtonEl = document.querySelector("#startButtonEl");

/**
 * * Define canvas width & height with innerWidth and innerHeight.
 * * innerWidth & innerHeight defines current window width & height even it gets resized.
 */
canvas.width = innerWidth;
canvas.height = innerHeight;

/**
 * * set the x & y position.
 * * it gets divided by 2 to make it in the center of the canvas.
 */
const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 15, "white");
let projectiles = [];
let enemies = [];
let particles = [];
let animationId;
let intervalId;
let score = 0;
let powerUp = new PowerUp({
  position: {
    x: 100,
    y: 100
  }
});

function init() {
  player = new Player(x, y, 15, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  animationId;
  score = 0;
  scoreEl.innerHTML = 0;
}

function spawnEnemies() {
  intervalId = setInterval(() => {
    const radius = Math.random() * (30 - 8) + 8;

    let x;
    let y;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}

function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "rgba(0,0,0, .1)";
  c.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = particles.length - 1; index >= 0; index--) {
    const particle = particles[index];
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  }

  for (let index = projectiles.length - 1; index >= 0; index--) {
    const projectile = projectiles[index];
    projectile.update();

    /**
     * * Removing projectile that already off from the screen
     */
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      projectiles.splice(index, 1);
    }
  }
  player.update();
  powerUp.draw();

  for (let index = enemies.length - 1; index >= 0; index--) {
    const enemy = enemies[index];

    enemy.update();

    /**
     * * Count the distance between player and enemy
     * * It'll be used to know the enemy hits the player
     */
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    /**
     * * Game Over when enemy hits the player
     */
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId);
      clearInterval(intervalId);
      modalEl.style.display = "block";
      gsap.fromTo(
        "#modalEl",
        {
          scale: 0.8,
          opacity: 0
        },
        {
          scale: 1,
          opacity: 1,
          ease: "expo"
        }
      );
      modalScoreEl.innerHTML = score;
    }

    for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
      const projectile = projectiles[projectileIndex];
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      /**
       * * Remove/ destory enemy when the projectile hit
       */
      if (dist - enemy.radius - projectile.radius < 1) {
        // Create explosion effect
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particles(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
              x: (Math.random() - 0.5) * (Math.random() * 4),
              y: (Math.random() - 0.5) * (Math.random() * 4)
            })
          );
        }

        /**
         * * Shrinking enemies that have radius more than 5
         */
        if (enemy.radius - 10 > 5) {
          /**
           * * When enemy got shrinked, player's score increase by 100
           */
          score += 100;
          scoreEl.innerHTML = score;
          gsap.to(enemy, {
            radius: enemy.radius - 10
          });
          projectiles.splice(projectileIndex, 1);
        } else {
          /**
           * * Remove enemy when its radius below 5
           * * When enemy's killed, player's score increase by 150
           */
          score += 150;
          scoreEl.innerHTML = score;
          enemies.splice(index, 1);
          projectiles.splice(projectileIndex, 1);
        }
      }
    }
  }
}

window.addEventListener("click", (e) => {
  /**
   * * Math.atan2() produces angle depends on the mouse click coordinates.
   * * Math.cos() always for the x-axis angle.
   * * Math.sin() always for the y-axis angle.
   * * both cosine and sine will return the value of -1 to 1.
   * * cosine and sine together going to procude two different results that have perfect ratio to start
   * * pushing the projectile wherever mouse clicked on the screen.
   */
  const angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);
  const velocity = {
    x: Math.cos(angle) * 4,
    y: Math.sin(angle) * 4
  };

  projectiles.push(new Projectile(player.x, player.y, 5, "white", velocity));
});

/**
 * * Restart the game
 */
buttonEl.addEventListener("click", () => {
  init();
  animate();
  spawnEnemies();
  // modalEl.style.display = "none";
  gsap.to("#modalEl", {
    opacity: 0,
    scale: 0.8,
    duration: 0.25,
    ease: "expo.in",
    onComplete: () => {
      modalEl.style.display = "none";
    }
  });
});

/**
 * * Start the game
 */
startButtonEl.addEventListener("click", () => {
  init();
  animate();
  spawnEnemies();
  // startModalEl.style.display = "none";
  gsap.to("#startModalEl", {
    opacity: 0,
    scale: 0.8,
    duration: 0.25,
    ease: "expo.in",
    onComplete: () => {
      startModalEl.style.display = "none";
    }
  });
});

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "d":
    case "ArrowRight":
      player.velocity.x += 1;
      break;
    case "w":
    case "ArrowUp":
      player.velocity.y -= 1;
      break;
    case "s":
    case "ArrowDown":
      player.velocity.y += 1;
      break;
    case "a":
    case "ArrowLeft":
      player.velocity.x -= 1;
      break;
  }
});
