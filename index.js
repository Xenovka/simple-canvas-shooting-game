const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

const scoreEl = document.querySelector("#scoreEl");

/**
 * * Define canvas width & height with innerWidth and innerHeight.
 * * innerWidth & innerHeight defines current window width & height even it gets resized.
 */
canvas.width = innerWidth;
canvas.height = innerHeight;

/**
 * * Creating Player instance.
 * @param x initialize x position for the Player
 * @param y initialize y position for the Player
 * @param radius initialize the Player's size
 * @param color initialize Player's color
 */
class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  /**
   * * function for start drawing/ displaying the Player in canvas.
   * * Math.PI * 2 will produce the angle of 360degree.
   */
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
}

/**
 * * Creating Projectile(bullet) instance.
 * @param x initialize x position for the Projectile
 * @param y initialize y position for the Projectile
 * @param radius initialize the Projectile's size
 * @param color initialize Projectile's color
 * @param velocity an object consists of x & y position to set angle
 */
class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  /**
   * * function for drawing/displaying the Projectile instance.
   */
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  /**
   * * used for updating the x & y position of the Projectile on every frame.
   */
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

const friction = 0.99;
class Particles {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

/**
 * * set the x & y position.
 * * it gets divided by 2 to make it in the center of the canvas.
 */
const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 15, "white");
const projectiles = [];
const enemies = [];
const particles = [];

function spawnEnemies() {
  setInterval(() => {
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

let animationId;
let score = 0;

function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "rgba(0,0,0, .1)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });
  projectiles.forEach((projectile, index) => {
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
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });
  player.draw();

  enemies.forEach((enemy, index) => {
    enemy.update();

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId);
    }

    projectiles.forEach((projectile, projectileIndex) => {
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
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          /**
           * * Remove enemy when its radius below 5
           * * When enemy's killed, player's score increase by 150
           */
          score += 150;
          scoreEl.innerHTML = score;
          setTimeout(() => {
            enemies.splice(index, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });
  });
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
  const angle = Math.atan2(e.clientY - canvas.height / 2, e.clientX - canvas.width / 2);
  const velocity = {
    x: Math.cos(angle) * 4,
    y: Math.sin(angle) * 4
  };

  projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity));
});

animate();
spawnEnemies();
