const c = document.getElementById("myCanvas").getContext("2d");

c.width = innerWidth;
c.height = innerHeight;
const X = c.width / 2;
const Y = c.height / 2;
console.log(c.width);
console.log(c.height);

const scoreEl = document.getElementById("scoreEl")
const startGameBtn = document.getElementById("gameBtn")
const modalEl = document.getElementById("modalEl")
const bigScore = document.getElementById("bigScore")

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        c.fillStyle = this.color;
        c.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.speed.x;
        this.y = this.y + this.speed.y;

    }
}

class Enemy {
    constructor(x, y, radius, color, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.speed.x;
        this.y = this.y + this.speed.y;

    }
}

const friction = 0.99;

class Particle {
    constructor(x, y, radius, color, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.alpha = 1;
    }

    draw() {
        c.save();
        c.globalAlpha = 0.1;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        c.fillStyle = this.color;
        c.fill();
        c.restore()
    }

    update() {
        this.draw();
        this.speed.x *= friction;
        this.speed.y *= friction;
        this.x = this.x + this.speed.x;
        this.y = this.y + this.speed.y;
        this.alpha -= 0.01;
    }
}

let player = new Player(X, Y, 10, 'white')
let projectiles = [];
let enemies = [];
let particles = [];

function init() {
    player = new Player(X, Y, 10, 'white')
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigScore.innerHTML = score;

}

function spawEnemiles() {
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4;
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : c.width + radius;
            y = Math.random() * c.height;
        } else {
            x = Math.random() * c.width
            y = Math.random() < 0.5 ? 0 - radius : c.height + radius;
        }
        const color = `hsl(${Math.random() * 360},50%,50%)`

        const angle = Math.atan2(c.height / 2 - y, c.width / 2 - x)
        const speed = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, speed))

    }, 1000)
}

let animationId;
let score = 0;

function animation() {
    animationId = requestAnimationFrame(animation);
    c.fillStyle = 'rgba(0,0,0,0.1)';
    c.fillRect(0, 0, c.width, c.height);
    player.draw();
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }
    })

    projectiles.forEach((projectile, index) => {
        projectile.update();
        // remove from edges of screen
        if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > c.width
            || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > c.height) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0)
        }
    })

    enemies.forEach((enemy, index) => {
        enemy.update();
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        // end game
        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId);
            modalEl.style.display = 'flex';
            bigScore.innerHTML = score;
        }
        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            // when projectiles touch enemy
            if (dist - enemy.radius - projectile.radius < 1) {
                // create explosions
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 6),
                        y: (Math.random() - 0.5) * (Math.random() * 6)
                    }))
                }
                if (enemy.radius - 10 > 5) {
                    // increase our score
                    score += 100;
                    scoreEl.innerHTML = score;
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(index, 1);
                    }, 0)
                } else {
                    // move form scene altogether
                    score += 250;
                    setTimeout(() => {
                        enemies.splice(index, 1);
                        projectiles.splice(index, 1);
                    }, 0)
                }
            }
        })
    })
}

addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - c.height / 2, event.clientX - c.width / 2)
    const speed = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6
    }
    projectiles.push(
        new Projectile(X, Y, 5, 'white', speed)
    )
})

startGameBtn.addEventListener("click", () => {
    init()
    animation()
    spawEnemiles()
    modalEl.style.display = 'none'
})

