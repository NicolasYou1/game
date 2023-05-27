const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

// Assuming you have the player name and high score stored in variables
// var playerName = "John";
// var highScore = 1000;

// // Send AJAX request to Django server
// var xhr = new XMLHttpRequest();
// xhr.open("POST", "/save_highscore/", true);
// xhr.setRequestHeader("Content-Type", "application/json");

// xhr.onreadystatechange = function () {
//   if (xhr.readyState === 4 && xhr.status === 200) {
//     // Request completed successfully
//     console.log(xhr.responseText);
//   }
// };

// // Convert JavaScript data to JSON and send it
// var data = JSON.stringify({ playerName: playerName, highScore: highScore });
// xhr.send(data);

// canvas.width = innerWidth;
// canvas.height = innerHeight;

// make rick roll on console.log saying 'you better not be cheating!' after finishing the game
console.log('%c.', 'font-size: 16px; line-height: 140px; padding: 70px 125px; background: url("https://media.tenor.com/x8v1oNUOmg4AAAAd/rickroll-roll.gif");');

console.log('%c.', 'font-size: 1px; line-height: 140px; padding: 70px 125px; background: url("https://media.tenor.com/x8v1oNUOmg4AAAAd/rickroll-roll.gif");');

addEventListener('resize', _ => {
    // canvas.width = innerWidth;
    // canvas.height = innerHeight;
    healthBar.x = canvas.width / 2 - healthBar.width / 2;
    scoreText.x = canvas.width / 4;
    moneyText.x = canvas.width / 1.35;
    upgrades.forEach(upgrade => {
        switch(upgrade.name) {
            case 'regen':
                upgrade.x = canvas.width/8 - upgrade.width/2;
            break;
            case 'damage':
                upgrade.x = canvas.width/3.2 - upgrade.width/2;
            break;
            case 'multishot':
                upgrade.x = canvas.width/2 - upgrade.width/2;
            break;
            case 'rocket':
                upgrade.x = canvas.width/1.45 - upgrade.width/2;
            break;
            case 'cooldown':
                upgrade.x = canvas.width/1.25 - upgrade.width/2;
            break;
        }
    })
});

const defaultValues = {
    player: {
        projectile: {
            damage: 1,
            health: 1,
            radius: 5,
            speed: 3,
            color: 'gray',
            cooldown: 1
        },
        rocket: {
            damage: 10,
            health: 1,
            width: 60,
            height: 20,
            speed: 3,
            color: 'gray',
            damageRadius: 40,
            cooldown: 10
        },
        damage: 0,
        health: 200,
        radius: 30,
        speed: 3,
        color: 'pink',
        regen: 0
    },
    zombie: {
        damage: 1,
        health: 3,
        radius: 30,
        speed: 1,
        color: 'dodgerblue',
        points: 2
    },
    mini: {
        damage: 1,
        health: 1,
        radius: 15,
        speed: 3,
        color: 'lightgreen',
        points: 1
    },
    soldier: {
        projectile: {
            damage: 20,
            health: 1,
            radius: 5,
            speed: 5,
            color: 'blue',
            cooldown: 1
        },
        damage: 1,
        health: 5,
        radius: 40,
        speed: 1,
        color: 'darkgreen',
        points: 5
    },
    tank: {
        damage: 3,
        health: 50,
        radius: 90,
        speed: 0.5,
        color: 'purple',
        points: 25
    }
}

class GameObject {
    constructor(x, y, radius, color, speed, health, damage) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.health = health;
        this.damage = damage;
    }
    collidesWith(other) {
        const distance = Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
        return distance < this.radius + other.radius;
    }
    draw() {
        c.beginPath();
        c.fillStyle = this.color;
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fill();
        c.stroke();
    }
    update() {
        this.draw();
    }
}

class Player extends GameObject { 
    constructor(x, y, radius, color, speed, health, damage) {
        super(x, y, radius, color, speed, health, damage);
    }
    update() {
        super.update();
    }
    regen() {
        player.health += defaultValues.player.regen;
    }
};

class Projectile extends GameObject {
    constructor(x, y, radius, color, speed, health, damage, velocity) {
        super(x, y, radius, color, speed, health, damage);
        this.velocity = velocity;
    }
    update() {
        super.update();
        this.x += this.velocity.x * this.speed;
        this.y += this.velocity.y * this.speed;
    }
}

class Rocket {
    constructor(x, y, width, height, color, speed, health, damage, velocity, damageRadius, rotationAxis) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = speed;
        this.health = health;
        this.damage = damage;
        this.velocity = velocity;
        this.damageRadius = damageRadius;
        this.rotationAxis = rotationAxis;
        this.initialRotation = Math.atan2(this.rotationAxis.y - this.y, this.rotationAxis.x - this.x);
    }
    draw() {
        // EXPLOSION RADIUS
        c.beginPath();
        c.fillStyle = 'black';
        c.arc(this.x, this.y, this.damageRadius, 0, Math.PI * 2, false);
        c.fill();
        c.closePath();
        // ACTUAL ROCKET
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.initialRotation);
        c.fillStyle = this.color;
        c.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        c.restore();
    }
    collidesWith(circle) {
        const dx = Math.abs(this.x - circle.x);
        const dy = Math.abs(this.y - circle.y);
        const distance = Math.sqrt(dx**2 + dy**2);

        return distance <= this.width / 2 + circle.radius;
    }
    update() {
        this.draw();
        this.x += this.velocity.x * this.speed;
        this.y += this.velocity.y * this.speed;
    }
}

class Enemy extends GameObject {
    constructor(x, y, radius, color, speed, health, damage, points, velocity) {
        super(x, y, radius, color, speed, health, damage);
        this.velocity = velocity;
        this.points = points;
    }
    update() {
        super.update();
        this.x += this.velocity.x * this.speed;
        this.y += this.velocity.y * this.speed;
    }
}

class Zombie extends Enemy { };

class Mini extends Enemy { };

class Soldier extends Enemy { };

class Tank extends Enemy { };

class Healthbar {
    constructor(x, y, width, height, maxWidth, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.maxWidth = maxWidth;
        this.color = color;
    }
    draw() {
        c.save();
        c.beginPath();
        c.rect(this.x, this.y, this.maxWidth, this.height);
        c.lineWidth = 5; // specify the line width here
        c.strokeStyle = 'black'; // specify the line color here
        c.stroke(); // draw the rectangle outline
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, this.width, this.height);
        c.restore();
    }
    update() {
        this.draw(); 
        if(this.width <= 0) {
            this.width = 0;
            return;
        }
        this.width = player.health;
    }
}

class Text {
    constructor(x, y, text, fontSize, fontFamily, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.color = color;
    }
    draw() {
        c.font = `${this.fontSize} ${this.fontFamily}`;
        c.fillStyle = this.color;
        c.textAlign = "center";
        c.fillText(this.text, this.x, this.y); 
    }
    update() {
        this.draw();
    }
}

class Upgrade {
    constructor(x, y, width, height, name, level, price, color, fontSize, fontFamily) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.name = name;
        this.level = level;
        this.price = price;
        this.color = color;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
    }
    draw() {
        c.save();
        c.strokeStyle = this.color;
        c.lineWidth = 3
        c.rect(this.x, this.y, this.width, this.height);
        c.stroke();
        c.font = `${this.fontSize} ${this.fontFamily}`;
        c.fillText(this.name, this.x + this.width/2, this.y - this.height/2);
        c.fillText(this.level, this.x + this.width/2, this.y + + this.height / 2 + 10);
        c.fillText(this.price, this.x + this.width/2, this.y + this.height + this.height);
        c.restore();
    }
    update() {
        this.draw();
    }
}

// GLOBAL VARIABLES

const game = {
    isPlayerDead: false,
    score: 0,
    money: 0,
    spawnDelay: 3,
    spawnDelayRate: 60, // seconds
    isAutoShooting: false,
    projectile: {
        lastTimeShot: null
    },
    soldier: {
        projectile: {
            lastTimeShot: null
        },
    },
    rocket: {
        lastTimeShot: null
    },
    upgrade: {
        currentLevels: {
            regen: 1,
            damage: 1,
            multi: 1,
            rocket: 1,
            cooldown: 1,
        },
        maxLevel: 4,
        priceGain: 2,
    }
}
const keysPressed = {};
const mouse = {
    x: null,
    y: null,
    down: false,
    shootInterval: null
}
let player;
let enemies;
let soldiers;
let playerProjectiles;
let rockets;
let soldierProjectiles;
let healthBar;
let scoreText;
let moneyText;
let upgrades;
let delay;
let spawnEnemyInterval
let increaseSpawnRateInterval;

// INITIAL FUNCTION CALLS

init();
keyDownHandler();
keyUpHandler();
increaseSpawnDelay();

function init() {
    enemies = [];
    soldiers = [];
    playerProjectiles = [];
    rockets = [];
    soldierProjectiles = [];
    upgrades = [];
    spawnPlayer();
    spawnHealthBar();
    spawnTexts();
    spawnUpgrades();
    createEnemies();
}

function updates() {
    player.update();
    healthBar.update();
    scoreText.update();
    scoreText.text = `Score: ${game.score}`;
    moneyText.update();
    moneyText.text = `Money: ${game.money}`;
    updateUpgrades();
}

function spawnPlayer() {
    const x = canvas.width/2;
    const y = canvas.height/2;

    player = new Player(x, y, defaultValues.player.radius, defaultValues.player.color, defaultValues.player.speed, defaultValues.player.health);
}

function spawnHealthBar() {
    const x = canvas.width / 2 - player.health / 2;
    const y = canvas.height / 1.3;
    const health = player.health;
    const height = 20;
    const maxHealth = player.health;
    const color = 'green'
    healthBar = new Healthbar(x, y, health, height, maxHealth, color);
}

function spawnUpgrades() {
    const y = canvas.height/1.15
    const width = 60;
    const height = 60;
    const level = 1;
    const price = '$' + 50;
    const fontSize = '32px';
    const fontFamily = 'Comic Sans MS';
    const color = 'black';

// regen 
    upgrades.push(new Upgrade(canvas.width/8 - width/2, y, width, height, 'regen', level, price, color, fontSize, fontFamily));
// damage
    upgrades.push(new Upgrade(canvas.width/3.2 - width/2, y, width, height, 'damage', level, price, color, fontSize, fontFamily));
// multishot
    upgrades.push(new Upgrade(canvas.width/2 - width/2, y, width, height, 'multishot', level, price, color, fontSize, fontFamily));
// rocket
    upgrades.push(new Upgrade(canvas.width/2 - width/2 + canvas.width/5, y, width, height, 'rocket', level, price, color, fontSize, fontFamily));

// cooldown  
    upgrades.push(new Upgrade(canvas.width/2 + width/2 + canvas.width/3, y, width, height, 'cooldown', level, price, color, fontSize, fontFamily));
    //x, y, width, height, name, level, price, color, fontSize, fontFamily
}

// BUYING UPGRADE

function buyUpgrade() {
    upgrades.forEach(upgrade => {
        if((mouse.x > upgrade.x && mouse.x < upgrade.x + upgrade.width) && (mouse.y > upgrade.y && mouse.y < upgrade.y + upgrade.height)) {
            if(upgrade.level === 'max') return;
            if(game.money >= +upgrade.price.slice(1)) {
                
                // Discounting from money & changing price + quantity
                game.money -= +upgrade.price.slice(1);
                upgrade.level >= game.upgrade.maxLevel - 1 ? upgrade.level = 'max' : upgrade.level++;
                if(upgrade.level === 'max') {
                    upgrade.price = '';
                } else {
                    upgrade.price = `$${+upgrade.price.slice(1)*game.upgrade.priceGain}`;
                }

                switch(upgrade.name) {
                    case 'regen':
                        game.upgrade.currentLevels.regen++;
                    break;
                    case 'damage':
                        game.upgrade.currentLevels.damage++;
                        defaultValues.player.projectile.damage++;
                    break;
                    case 'multishot':
                        game.upgrade.currentLevels.multi++;
                    break;
                    case 'rocket':
                        game.upgrade.currentLevels.rocket++;
                    break;
                    case 'cooldown':
                        game.upgrade.currentLevels.cooldown++;
                    break;
                }
            }
        }
    })
}

addEventListener('click', buyUpgrade)

function spawnTexts() {
    scoreText = new Text(canvas.width / 4, 100,`Score: ${game.score}`, '64px', 'Comic Sans MS', 'black');

    moneyText = new Text(canvas.width / 1.35, 100,`Money: ${game.money}`, '64px', 'Comic Sans MS', 'black');
}

addEventListener('keydown', e => {
    if(keysPressed[' ']) {
        delayRocket();
        e.preventDefault();
    }
})

function delayRocket() {
    const cooldown = defaultValues.player.rocket.cooldown;
    if(!game.rocket.lastTimeShot) {
        game.rocket.lastTimeShot = Date.now();
        shootRocket();
        return;
    }
    let currentTime = Date.now();
    let elapsedTime = currentTime - game.rocket.lastTimeShot;
    if(elapsedTime > cooldown * 1000) {
        game.rocket.lastTimeShot = Date.now();
        shootRocket();
    }
}

function shootRocket() {
    const x = player.x;
    const y = player.y;
    const rocket = new Rocket(x, y, defaultValues.player.rocket.width, defaultValues.player.rocket.height,defaultValues.player.rocket.color, defaultValues.player.rocket.speed, defaultValues.player.rocket.health,defaultValues.player.rocket.damage, getAngle(player, mouse), defaultValues.player.rocket.damageRadius,
    mouse);
    rockets.push(rocket);
    // x, y, width, height, color, speed, health, damage, velocity, damageRadius
}

function spawnRocket() {
    rockets.forEach(rocket => rocket.update());
}

function explodeRocket() {
    let explosions = [];
    for(let i = 0; i < rockets.length; i++) {
        const rocket = rockets[i];
        const explosion = {
            x: rocket.x,
            y: rocket.y,
            radius: rocket.damageRadius,
            damage: rocket.damage
        }
        for(let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];

            if(rocket.collidesWith(enemy)) {
                enemy.health -= rocket.damage;
                explosions.push(explosion);
                rockets.splice(i, 1);
            } else if(isRectOutOfBounds(rocket)) {
                explosions.push(explosion);
                rockets.splice(i, 1);
            }
        }
    }
    for(let i = 0; i < explosions.length; i++) {
        const explosion = explosions[i];
        for(let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            if(isColliding(explosion, enemy)) {
                enemy.health -= explosion.damage;
            }
        }
    }
    explosions = [];
}

function upgradeRocket() {
    switch(game.upgrade.currentLevels.rocket) {
        case 1:
            defaultValues.player.rocket.damageRadius = 40;
        break;
        case 2:
            defaultValues.player.rocket.damageRadius = 80;
        break;
        case 3:
            defaultValues.player.rocket.damageRadius = 160;
        break;
        case 4:
            defaultValues.player.rocket.damageRadius = 340;
        break;
    }
}

function upgradeCooldown() {
    switch(game.upgrade.currentLevels.cooldown) {
        case 1:
            defaultValues.player.projectile.cooldown = 1;
        break;
        case 2:
            defaultValues.player.projectile.cooldown = 0.5;
        break;
        case 3:
            defaultValues.player.projectile.cooldown = 0.25;
        break;
        case 4:
            defaultValues.player.projectile.cooldown = 0.125;
        break;
    }
}

function keyDownHandler() {
    addEventListener('keydown', e => {
        if(e.key.toUpperCase() !== e.key.toLowerCase() && !e.key.includes('Arrow')) {
            keysPressed[e.key.toLowerCase()] = true;
            return;
        }
            keysPressed[e.key] = true;
    })
}

function keyUpHandler() {
    addEventListener('keyup', e => {
        if(e.key.toUpperCase() !== e.key.toLowerCase() && !e.key.includes('Arrow')) {
            keysPressed[e.key.toLowerCase()] = false;
            return;
        }
        keysPressed[e.key] = false;
    })
}

addEventListener('keypress', toggleAutoShoot);

function toggleAutoShoot(e) {
    if(e.key === 'g') {
        if(!game.isAutoShooting) {
            game.isAutoShooting = true;
            return;
        }
        game.isAutoShooting = false;
    }
}

function keyActions() {
    // SHOOT
    if(game.isAutoShooting) {
        delayProjectile();
    }
    else if(keysPressed["e"] === true) {
        delayProjectile();
    }

    // MOVE PLAYER

    if((keysPressed["w"] === true || keysPressed["ArrowUp"] === true) && !(player.y - player.radius + player.speed < 0))
        player.y -= player.speed;

    else if((keysPressed["s"] === true || keysPressed["ArrowDown"] === true) && !(player.y + player.radius + player.speed > canvas.height))
        player.y += player.speed;

    if((keysPressed["a"] === true || keysPressed["ArrowLeft"] === true) && !(player.x - player.radius + player.speed < 0))
        player.x -= player.speed;

    else if((keysPressed["d"] === true || keysPressed["ArrowRight"] === true) && !(player.x + player.radius + player.speed > canvas.width)) 
        player.x += player.speed;
}



function createEnemies() {
    delay = 3000;
    let elapsedTime = 0;
    function spawnEnemy() {
        const spawnRate = Math.random();
        let newEnemy;
        let x;
        let y;
        switch(true) {
            case spawnRate <= .15:
                newEnemy = new Mini(x, y, defaultValues.mini.radius, defaultValues.mini.color, defaultValues.mini.speed, defaultValues.mini.health, defaultValues.mini.damage,defaultValues.mini.points, {x: 0, y: 0});
            break;
            case spawnRate <= .20:
                newEnemy = new Soldier(x, y, defaultValues.soldier.radius, defaultValues.soldier.color, defaultValues.soldier.speed, defaultValues.soldier.health, defaultValues.soldier.damage,defaultValues.soldier.points, {x: 0, y: 0});
            break;
            case spawnRate <= 0.21:
                newEnemy = new Tank(x, y, defaultValues.tank.radius, defaultValues.tank.color, defaultValues.tank.speed, defaultValues.tank.health, defaultValues.tank.damage,defaultValues.tank.points, {x: 0, y: 0});
            break;
            default:
                newEnemy = new Zombie(x, y, defaultValues.zombie.radius, defaultValues.zombie.color, defaultValues.zombie.speed, defaultValues.zombie.health, defaultValues.zombie.damage,
                defaultValues.zombie.points, {x: 0, y: 0});
            break;
        }
    
        const sideSpawned = Math.ceil(Math.random() * 4);

        switch(true) {
            case sideSpawned < 1:
                // TOP

                x = Math.random() * canvas.width;
                y = 0 - newEnemy.radius;
            break;
            case sideSpawned < 2:
                // RIGHT

                x = canvas.width + newEnemy.radius;
                y = Math.random() * canvas.height;
            break;
            case sideSpawned < 3:
                // BOTTOM

                x = Math.random() * canvas.width;
                y = canvas.height + newEnemy.radius;
            break;
            default:
               // LEFT

               x = 0 - newEnemy.radius;
               y = Math.random() * canvas.height;
            break;
        }
    
        newEnemy.x = x;
        newEnemy.y = y;

    while (enemies.some(enemy => enemy.collidesWith(newEnemy)) && enemies.length < 20 && !newEnemy.collidesWith(player)) {
        // change the enemies.length conditional later
        newEnemy.x = Math.random() * canvas.width / 2;
        newEnemy.y = Math.random() * canvas.width / 2;
    }
    enemies.push(newEnemy);
}
    spawnEnemyInterval = setInterval(spawnEnemy, delay);
        
    increaseSpawnRateInterval = setInterval(_ => {
        elapsedTime += delay;

        if(elapsedTime >= 3000) {
            delay /= 2;

            elapsedTime = 0;
        }
        
        clearInterval(spawnEnemyInterval);
        spawnEnemyInterval = setInterval(spawnEnemy, delay)
    }, 60000);
}

function spawnEnemies() {
    enemies.forEach(enemy => {
        enemy.velocity = getAngle(enemy, player);
        enemy.update();
    })
}

function spawnProjectiles() {
    playerProjectiles.forEach(projectile => {
        projectile.update();
    })
    soldierProjectiles.forEach(projectile => {
        projectile.update();
    })
}

function isColliding(obj1, obj2) {
    const radii = obj2.radius + obj1.radius;
    const dx = obj2.x - obj1.x;
    const dy = obj2.y - obj1.y;
    return Math.sqrt(dx**2 + dy**2) < radii;
}

function preventEnemyOverlap() {
    for (let i = 0; i < enemies.length; i++) {
      for (let j = i + 1; j < enemies.length; j++) {
        const enemy1 = enemies[i];
        const enemy2 = enemies[j];
        if (isColliding(enemy1, enemy2)) {
          const dx = enemy2.x - enemy1.x;
          const dy = enemy2.y - enemy1.y;
          const angle = Math.atan2(dy, dx);
          const overlap = enemy1.radius + enemy2.radius - Math.sqrt(dx * dx + dy * dy);
          const halfOverlap = overlap / 2;
          enemy1.x -= halfOverlap * Math.cos(angle);
          enemy1.y -= halfOverlap * Math.sin(angle);
          enemy2.x += halfOverlap * Math.cos(angle);
          enemy2.y += halfOverlap * Math.sin(angle);
          const dotProd1 = enemy1.vx * Math.cos(angle) + enemy1.vy * Math.sin(angle);
          const dotProd2 = enemy2.vx * Math.cos(angle) + enemy2.vy * Math.sin(angle);
          if (dotProd1 > 0 || dotProd2 < 0) {
            // Enemies are moving away from each other or not moving towards each other, do nothing
          } else {
            // Enemies are moving towards each other, adjust their velocities
            const v1x = (dotProd1 * Math.cos(angle)) - (dotProd2 * Math.sin(angle));
            const v1y = (dotProd1 * Math.sin(angle)) + (dotProd2 * Math.cos(angle));
            const v2x = (dotProd2 * Math.cos(angle)) - (dotProd1 * Math.sin(angle));
            const v2y = (dotProd2 * Math.sin(angle)) + (dotProd1 * Math.cos(angle));
            enemy1.vx = v1x;
            enemy1.vy = v1y;
            enemy2.vx = v2x;
            enemy2.vy = v2y;
          }
        }
      }
    }
  }

  function delayProjectile() {
    const cooldown = defaultValues.player.projectile.cooldown;
    if(!game.projectile.lastTimeShot) {
        game.projectile.lastTimeShot = Date.now();
        playerShoot();
        return;
    }
    let currentTime = Date.now();
    let elapsedTime = currentTime - game.projectile.lastTimeShot;
    if(elapsedTime > cooldown * 1000) {
        game.projectile.lastTimeShot = Date.now();
        playerShoot();
    }
}

addEventListener('mousedown', mouseDownHandler);
addEventListener('mouseup', mouseUpHandler);
addEventListener('mousemove', mouseMovementHandler);
addEventListener('mousedown', shootProjectile);

function shootProjectile() {
    if(mouse.down) {
        delayProjectile();
    }
}

function mouseDownHandler(e) {
    mouse.down = true;
    let rect = canvas.getBoundingClientRect();
    mouse.x = e.offsetX || e.clientX - rect.left;
    mouse.y = e.offsetY || e.clientY - rect.top;
}

function mouseUpHandler() {
    mouse.down = false;
}

function mouseMovementHandler(e) {
    let rect = canvas.getBoundingClientRect();
    mouse.x = e.offsetX || e.clientX - rect.left;
    mouse.y = e.offsetY || e.clientY - rect.top;
}

function getAngle(obj1, obj2) {
    const angle = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);

    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }
    return velocity;
}

function createProjectile(x, y, angle) {
    const projectile = new Projectile(
        x, y,
        defaultValues.player.projectile.radius, defaultValues.player.projectile.color, defaultValues.player.projectile.speed, defaultValues.player.projectile.health,defaultValues.player.projectile.damage, angle);
    
    playerProjectiles.push(projectile);
}

function adjustVelocityAngle(velocity, angleAdjustment) {
    const { x, y } = velocity;
    const cosTheta = Math.cos(angleAdjustment);
    const sinTheta = Math.sin(angleAdjustment);

    const adjustedX = x * cosTheta - y * sinTheta;
    const adjustedY = x * sinTheta + y * cosTheta;

    return { x: adjustedX, y: adjustedY };
}

function playerShoot() {
    const { x, y } = velocity;
    const cosTheta = Math.cos(angleAdjustment);
    const sinTheta = Math.sin(angleAdjustment);

    const adjustedX = x * cosTheta - y * sinTheta;
    const adjustedY = x * sinTheta + y * cosTheta;

    return { x: adjustedX, y: adjustedY };
}

function playerShoot() {
    const x = player.x;
    const y = player.y;
    const velocity = getAngle(player, mouse);

    switch (game.upgrade.currentLevels.multi) {
        case 1:
            createProjectile(x, y, velocity);
            break;
        case 2:
            createProjectile(x, y, adjustVelocityAngle(velocity, Math.PI / 4));
            createProjectile(x, y, adjustVelocityAngle(velocity, -Math.PI / 4));
            break;
        case 3:
            createProjectile(x, y, velocity);
            createProjectile(x, y, adjustVelocityAngle(velocity, Math.PI / 4));
            createProjectile(x, y, adjustVelocityAngle(velocity, -Math.PI / 4));
            break;
        case 4:
            createProjectile(x, y, velocity);
            createProjectile(x, y, adjustVelocityAngle(velocity, Math.PI / 2));
            createProjectile(x, y, adjustVelocityAngle(velocity, -Math.PI / 2));
            createProjectile(x, y, adjustVelocityAngle(velocity, Math.PI));
            break;
    }
}

// function delaySoldierProjectiles() {
//     const cooldown = defaultValues.soldier.projectile.cooldown;
// if(!game.soldier.projectile.lastTimeShot) {
//     game.soldier.projectile.lastTimeShot = Date.now();
//     soldierShoot();
//     return;
// }
// let currentTime = Date.now();
// let elapsedTime = currentTime - game.soldier.projectile.lastTimeShot;
//     if(elapsedTime > cooldown * 1000) {
//         game.soldier.projectile.lastTimeShot = Date.now();
//         soldierShoot();
//     }
// }

function soldierShoot() {
    soldiers.forEach(soldier => {
        const x = soldier.x;
        const y = soldier.y;
        const projectile = new Projectile(x, y, defaultValues.soldier.projectile.radius, defaultValues.soldier.projectile.color, defaultValues.soldier.projectile.speed, defaultValues.soldier.projectile.health,defaultValues.soldier.projectile.damage, getAngle(soldier, player));
        soldierProjectiles.push(projectile)
    });
}

const soldierCooldown = 1000;

setInterval(soldierShoot, soldierCooldown);

// fix hold down to shoot later

function damageEnemies() {
    for(let i = 0; i < playerProjectiles.length; i++) {
        const projectile = playerProjectiles[i];
        for(let j = 0; j < enemies.length; j++) {

            const enemy = enemies[j];
            if(isColliding(projectile, enemy)) {
                
                enemy.health -= projectile.damage;
                projectile.health--;
                if(projectile.health <= 0) {
                    playerProjectiles.splice(i, 1);
                }
            }
        }
    }
}

function damagePlayer() {
    enemies.forEach(enemy => {
        if(isColliding(enemy, player)) {
            player.health -= enemy.damage;
        }
    });
}

function soldierProjectilesDamagePlayer() {
    for(let i = 0; i < soldierProjectiles.length; i++) {
        const projectile = soldierProjectiles[i];
        if(isColliding(projectile, player)) {
            player.health -= projectile.damage;
            projectile.health--;
            if(projectile.health <= 0) {
                soldierProjectiles.splice(i, 1);
            }
        }
    }
}

function isCircleOutOfBounds(circle) {
    return (circle.x + circle.radius > canvas.width) || (circle.x < 0) || (circle.y + circle.radius > canvas.height) || (circle.y < 0);
}
function isRectOutOfBounds(rect) {
    return (rect.x + rect.width > canvas.width) || (rect.x < 0) || (rect.y + rect.height > canvas.height) || (rect.y < 0);
}

function removeProjectilesOutOfBounds() {
    for(let i = 0; i < playerProjectiles.length; i++) {
        const projectile = playerProjectiles[i];
        if(isCircleOutOfBounds(projectile)) {
            playerProjectiles.splice(i, 1);
        }
    }
    for(let i = 0; i < soldierProjectiles.length; i++) {
        const projectile = soldierProjectiles[i];
        if(isCircleOutOfBounds(projectile)) {
            soldierProjectiles.splice(i, 1);
        }
    }
}
function extractEnemyClasses() {
    soldiers = enemies.filter(enemy => enemy.radius === defaultValues.soldier.radius);
    // change this if you change the radius
}

function killEnemy() {
    for(let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if(enemy.health <= 0) {
            game.score += enemy.points;
            game.money += enemy.points;
            enemies.splice(i, 1);
        }
    }
}

function killPlayer() {
    if(player.health <= 0) game.isPlayerDead = true;
}
let lastDamageTime = 0;
let previousHealth = player.health;

function playerDamaged() {
  const currentTime = Date.now();
  if (currentTime - lastDamageTime >= 1000) {
    // More than 1 second has passed since the last damage
    previousHealth = player.health;
  }
  lastDamageTime = currentTime;
  // Handle player damage logic here
}

function canStartHealing() {
  const currentTime = Date.now();
  return currentTime - lastDamageTime >= 1000 && player.health < previousHealth;
}

function upgradeRegen() {
      switch (game.upgrade.currentLevels.regen) {
        case 1:
          defaultValues.player.regen = 0.01;
          break;
        case 2:
          defaultValues.player.regen = 0.033;
          break;
        case 3:
          defaultValues.player.regen = 0.066;
          break;
        case 4:
          defaultValues.player.regen = 0.1;
          break;
      }
}

function regenPlayer() {
    enemies.forEach(enemy => {
        if(!player.collidesWith(enemy) && player.health + defaultValues.player.regen <= defaultValues.player.health) {
            player.regen();
        }
    })
}

function endGame() {
    game.score = 0;
    game.money = 0;
    clearTimeout(increaseSpawnRateInterval);
    clearTimeout(spawnEnemyInterval);
    init();
    console.clear();
    game.isAutoShooting = false;
    delay = 3000;
    for(let key in game.upgrade.currentLevels) {
        game.upgrade.currentLevels[key] = 1;
    }
    defaultValues.player.projectile.damage = 1;
}

function increaseSpawnDelay() {
    setInterval(_ => {
        game.spawnDelay *= 1/3;
    }, game.spawnDelayRate * 1000 );
}

function updateUpgrades() {
    upgrades.forEach(upgrade => upgrade.update());
}

function animate() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    // restart game;
    if(game.isPlayerDead) {
        game.isPlayerDead = false;
        endGame();
    }
    updates();
    keyActions();
    spawnEnemies();
    spawnProjectiles();
    spawnRocket();
    explodeRocket();
    preventEnemyOverlap();
    damageEnemies();
    damagePlayer();
    killEnemy();
    killPlayer();
    soldierProjectilesDamagePlayer();
    extractEnemyClasses();
    removeProjectilesOutOfBounds();
    upgradeRocket();
    upgradeCooldown();
    upgradeRegen();
    regenPlayer();
    requestAnimationFrame(animate);
}

animate();