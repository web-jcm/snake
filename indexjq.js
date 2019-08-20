$(function () {
    var sw = 20,
        sh = 20,
        tr = 30,
        td = 30,
        snake = null,
        food = null,
        game = null;

    function Square(x, y, classname) {
        this.x = x * sw;
        this.y = y * sh;
        this.class = classname;
        this.viewContent = document.createElement('div');
        this.viewContent.className = this.class;
        this.parent = document.getElementsByClassName('wrap')[0];
    }

    Square.prototype.create = function () {
        this.viewContent.style.position = 'absolute';
        this.viewContent.style.width = sw + 'px';
        this.viewContent.style.height = sh + 'px';
        this.viewContent.style.left = this.x + 'px';
        this.viewContent.style.top = this.y + 'px';
        this.parent.appendChild(this.viewContent);
    }

    Square.prototype.remove = function () {
        this.parent.removeChild(this.viewContent);
    }

    function Snake() {
        this.head = null;
        this.tail = null;
        this.pos = [];
        this.directionlist = {
            right: {
                x: 1,
                y: 0,
                r: 0
            },
            left: {
                x: -1,
                y: 0,
                r: 180
            },
            up: {
                x: 0,
                y: -1,
                r: -90
            },
            down: {
                x: 0,
                y: 1,
                r: 90
            }
        }
    }

    Snake.prototype.init = function () {
        var snakeH = new Square(2, 0, 'snakeH');
        snakeH.create();
        this.head = snakeH;
        this.pos.push([2, 0])
        var snakeB = new Square(1, 0, 'snakeB');
        snakeB.create();
        this.pos.push([1, 0]);
        var snakeT = new Square(0, 0, 'snakeB');
        snakeT.create();
        this.tail = snakeT;
        this.pos.push([0, 0]);
        snakeH.last = snakeB;
        snakeH.next = null;
        snakeB.last = snakeT;
        snakeB.next = snakeH;
        snakeT.last = null;
        snakeT.next = snakeB;
        this.direction = this.directionlist.right;
    }

    Snake.prototype.getNextPos = function () {
        var nextPos = [
            this.head.x / sw + this.direction.x,
            this.head.y / sh + this.direction.y
        ]
        var crash = false;
        this.pos.forEach(function (value) {
            if (nextPos[0] == value[0] && nextPos[1] == value[1]) {
                crash = true;
            }
        });
        if (crash) {
            this.nextev.end.call(this);
            return;
        }
        if (nextPos[0] < 0 || nextPos[0] > tr - 1 || nextPos[1] < 0 || nextPos[1] > td - 1) {
            this.nextev.end.call(this);
            return;
        }
        if (food && nextPos[0] == food.pos[0] && nextPos[1] == food.pos[1]) {
            this.nextev.eat.call(this);
            return;
        }
        this.nextev.move.call(this);
    }

    Snake.prototype.nextev = {
        move: function (key) {
            var newB = new Square(this.head.x / sw, this.head.y / sh, 'snakeB');
            newB.last = this.head.last;
            newB.last.next = newB;
            newB.next = null;
            this.head.remove();
            newB.create();
            var newH = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, 'snakeH');
            newH.last = newB;
            newH.next = null;
            newB.next = newH;
            newH.viewContent.style.transform = 'rotate(' + this.direction.r + 'deg)';
            newH.create();
            this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y])
            this.head = newH;
            if (!key) {
                this.tail.remove();
                this.tail = this.tail.next;
                this.pos.pop();
            }
        },
        eat: function () {
            this.nextev.move.call(this, true);
            createFood();
            game.score++;
            $('.score').text('得分：' + game.score);
        },
        end: function () {
            game.over();
        }
    }
    snake = new Snake();

    function createFood() {
        var x = null,
            y = null,
            include = true;
        while (include) {
            x = Math.round(Math.random() * (td - 1));
            y = Math.round(Math.random() * (tr - 1));
            snake.pos.forEach(function (value) {
                if (x != value[0] && y != value[1]) {
                    include = false;
                }
            });
        }
        food = new Square(x, y, 'snakeF');
        food.pos = [x, y];
        var snakeF = document.getElementsByClassName('snakeF')[0];
        if (snakeF) {
            snakeF.style.left = x * sw + 'px';
            snakeF.style.top = y * sh + 'px';
        } else {
            food.create();
        }
    }

    function Game() {
        this.timer = null;
        this.score = 0;
    }

    Game.prototype.init = function () {
        snake.init();
        createFood();
        
        document.onkeydown = function (e) {
            if (e.which == 37 && snake.direction != snake.directionlist.right) {
                snake.direction = snake.directionlist.left;
            } else if (e.which == 38 && snake.direction != snake.directionlist.down) {
                snake.direction = snake.directionlist.up;
            } else if (e.which == 39 && snake.direction != snake.directionlist.left) {
                snake.direction = snake.directionlist.right;
            } else if (e.which == 40 && snake.direction != snake.directionlist.up) {
                snake.direction = snake.directionlist.down;
            }
        };
        $('.topbt').on('click',function(){
            console.log('t');
            if (snake.direction != snake.directionlist.down) {
                snake.direction = snake.directionlist.up;
            }
        });
        $('.leftbt').on('click',function(){
            console.log('l');
            if (snake.direction != snake.directionlist.right) {
                snake.direction = snake.directionlist.left;
            }
        });
        $('.rightbt').on('click',function(){
            console.log('r');
            if (snake.direction != snake.directionlist.left) {
                snake.direction = snake.directionlist.right;
            }
        });
        $('.bottombt').on('click',function(){
            console.log('b');
            if (snake.direction != snake.directionlist.up) {
                snake.direction = snake.directionlist.down;
            }
        });
        this.start();
    }

    Game.prototype.start = function () {
        this.timer = setInterval(function () {
            snake.getNextPos();
        }, 200)
    }

    Game.prototype.over = function () {
        clearInterval(this.timer);
        $('.wrap').html('');
        snake = new Snake();
        game = new Game;
        $('.playB').css('display', 'inline-block');
    }

    Game.prototype.pause = function () {
        clearInterval(this.timer);
    }

    game = new Game;
    $('.playB').on('click', function () {
        $('.playB').css('display', 'none');
        game.init();
    })

    $('.wrap').on('click', function () {
        if ($('.wrap').html() != '') {
            $('.pauseB').css('display', 'inline-block');
            game.pause();
        }
    })
    $('.pauseB').on('click', function () {
        $('.pauseB').css('display', 'none');
        game.start();
    })
    
})
