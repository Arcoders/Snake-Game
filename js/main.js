;(function(){

// -----------------------------------------------------

    class Random {

        static get(start, end) {
            return Math.floor(Math.random() * end) + start;
        }

        static color_food() {
            return `rgb(
                ${Random.get(200, 255)},
                ${Random.get(0, 110)},
                ${Random.get(0, 110)}
            )`;
        }

    }

// -----------------------------------------------------

    class Food {

        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 10;
        }

        static generate() {
            return new Food(Random.get(0, canvas.width), Random.get(0, canvas.height));
        }

        draw() {
            let color = Random.color_food();
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width / 2, 2 * Math.PI, false);
            ctx.shadowInset = true;
            ctx.shadowBlur = Random.get(5, 10);
            ctx.shadowColor = color;
            ctx.fillStyle = color;
            ctx.fill();
            ctx.restore();
        }

    }

// -----------------------------------------------------

    class Square {

        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 10;
            this.back = null;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width / 2, 2 * Math.PI, false);
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'Gold';
            ctx.stroke();
            if (this.hasBack()) this.back.draw();
        }

        hasBack() {
            return this.back !== null;
        }

        copy() {
            if (this.hasBack()) {
                this.back.copy();
                this.back.x = this.x;
                this.back.y = this.y;
            }
        }

        add() {
            if (this.hasBack()) return this.back.add();
            this.back = new Square(this.x, this.y);
            this.back.width *= 1.2;
            this.width *= 1.2;
        }

        right() {
            this.copy();
            this.x += this.width;
        }

        left() {
            this.copy();
            this.x -= this.width;
        }

        up() {
            this.copy();
            this.y -= this.height;
        }

        down() {
            this.copy();
            this.y += this.height;
        }

        hitBorder() {
            return this.x > canvas.width || this.x < 0 || this.y > canvas.height || this.y < 0;
        }

        squareHit(head, body) {
            return head.x == body.x && head.y == body.y;
        }

        hit_body(head, second = false) {

            if (this === head && !this.hasBack()) return false;
            if (this === head) return this.back.hit_body(head, true);

            if (second && !this.hasBack()) return false;
            if (second) return this.back.hit_body(head);

            if (this.hasBack()) return this.squareHit(head, this) || this.back.hit_body(head);

            return this.squareHit(this, head);

        }

        grid() {

            for (let x = 0; x <= canvas.width; x += this.width) {
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, canvas.height);
            }

            for (let y = 0; y <= canvas.height; y += this.width) {
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
            }

            ctx.strokeStyle = 'Peru';
            ctx.lineWidth = 0.2;
            ctx.stroke();

        }


    }

// -----------------------------------------------------

    class Snake {

        constructor() {
            this.head = new Square(200, 30);
            this.draw();
            this.direction = 'right';
            this.head.add();
            this.head.add();
            this.head.add();
        }

        draw() {
            this.head.draw();
        }

        right() {
            if (this.direction === 'left') return;
            this.direction = 'right';
        }

        left() {
            if (this.direction === 'right') return;
            this.direction = 'left';
        }

        up() {
            if (this.direction === 'down') return;
            this.direction = 'up';
        }

        down() {
            if (this.direction === 'up') return;
            this.direction = 'down';
        }

        move() {
            if (this.direction === 'up') return this.head.up();
            if (this.direction === 'down') return this.head.down();
            if (this.direction === 'left') return this.head.left();
            if (this.direction === 'right') return this.head.right();
        }

        eat() {
            this.head.add();
        }

        dead() {
            return this.head.hitBorder() || this.head.hit_body(this.head);
        }

    }

// -----------------------------------------------------

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const snake = new Snake();
    console.log(snake);

    let foods = [];

    window.addEventListener('keydown', event => {
        event.preventDefault();
        if (event.keyCode === 40) return snake.down();
        if (event.keyCode === 39) return snake.right();
        if (event.keyCode === 38) return snake.up();
        if (event.keyCode === 37) return snake.left();
        return false;
    });

    const loop_draw = setInterval(() => {

        snake.move();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        snake.draw();
        snake.head.grid();
        drawFood();

        if (snake.dead()) {
            console.log('Has muerto .................... :/');
            window.clearInterval(loop_food);
            window.clearInterval(loop_draw);
        }

    }, 1000 / 15);

    const loop_food = setInterval(() => {

        const food = Food.generate();
        foods.push(food);

        setTimeout(() => {
            removeFromFoods(food);
        }, 8000);

    }, 2000);

    function drawFood() {
        for (const i in foods) {
            const food = foods[i];
            if (typeof food !== 'undefined') {
                food.draw();
                if (hit(food, snake.head)) {
                    removeFromFoods(food);
                    console.log('Más 10 puntos ..... ^^');
                    snake.eat();
                }
            }
        }
    }

    function removeFromFoods(food) {
        foods = foods.filter(f => {
            return food !== f;
        });
    }

    function hit(food, snake_head) {
        let hit = false;

        let dx = food.x - snake_head.x;
        let dy = food.y - snake_head.y;
        let dis = Math.sqrt(dx * dx + dy * dy);

        if (dis < food.width / 2 + snake_head.width / 2) hit = true;

        return hit;
    }

// -----------------------------------------------------

})();
