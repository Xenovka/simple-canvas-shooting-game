const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

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

/**
 * * set the x & y position.
 * * it gets divided by 2 to make it in the center of the canvas.
 */
const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 30, "blue");
const projectiles = [];
const enemies = [];

function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 4) + 4;

    let x;
    let y;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color = "green";

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);
  projectiles.forEach((projectile) => {
    projectile.update();
  });
  player.draw();

  enemies.forEach((enemy) => {
    enemy.update();
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
    x: Math.cos(angle),
    y: Math.sin(angle)
  };

  projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, "red", velocity));
});

animate();
spawnEnemies();
