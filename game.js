(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d");

function Vector(x, y) {
    this.x = x;
    this.y = y;
    this.add = function (vec2) {
        this.x += vec2.x;
        this.y += vec2.y;
    }
}

var RapidRow = {};
RapidRow.Constants = {
    mapColor: "blue",
    platformSize: new Vector(140, 15), //Така създаваме обекти
    platformColor: "yellow",
    platformVelocity: new Vector(0, -1),
    playerSpeed: 5,
    playerColor: "#ebe",
    unitSize: new Vector(40, 40),
    gravity: new Vector(0, 0.05),
    updateTime: 10,
    platformGenerationTime: 105 //update frames
};

RapidRow.Unit = function (_location, _velocity, _size, _color) {
    this.location = _location;
    this.velocity = _velocity;
    this.size = _size;
    this.color = _color;
    
    this.draw = function draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.location.x, this.location.y,
                         this.size.x, this.size.y);
    }
    
    this.move = function move() {
        this.location.add(this.velocity);
    }
}
RapidRow.player = new RapidRow.Unit(new Vector(canvas.width / 2, 0),
                                    new Vector(0, 0),
                                    RapidRow.Constants.unitSize,
                                    RapidRow.Constants.playerColor);
RapidRow.platforms = [];
RapidRow.currentFrame = 0;
RapidRow.keyboard = [];
RapidRow.keys = {
    a: 65,
    d: 68
};
RapidRow.generatePlatform = function generatePlatform() {
    var constants = RapidRow.Constants;
    
    var platform = new RapidRow.Unit(
        new Vector( Math.random() *  (canvas.width - constants.platformSize.x),
                    canvas.height + constants.platformSize.y),
        constants.platformVelocity, //Не нови вектори,
        constants.platformSize, //защото те не се променят.
        constants.platformColor);

    RapidRow.platforms.push(platform);
};

function unitsCollide(unit1, unit2) {
    var left1 = unit1.location.x, left2 = unit2.location.x,
        top1 = unit1.location.y, top2 = unit2.location.y,
        right1 = left1 + unit1.size.x, right2 = left2 + unit2.size.x,
        bot1 = top1 + unit1.size.y, bot2 = top2 + unit2.size.y;
    
    return !(right2 < left1 || right1 < left2 ||
            bot1 < top2 || bot2 < top1);
}

function collideUnit(unit, platform) {
    for (var i = 0; i < platform.length; i++) {
        if(unitsCollide(unit, platform[i])) {
            //Ако се удрят, спираме да ги местим
            if (platform[i].location.y + platform[i].size.y > unit.location.y + unit.size.y) {
                //Ако платформата е отдолу, тя бута player-a
                unit.location.y = platform[i].location.y - unit.size.y;
                unit.velocity.y = 0;
                
                return true;
            } else {
                //Ако е до него, спира движение по X
                if (unit.location.x < platform[i].location.x)
                    unit.location.x = platform[i].location.x - unit.size.x;
                else unit.location.x = platform[i].location.x + platform[i].size.x;
                unit.velocity.x = 0;
                
                return true;
            }
        }
    }    
    return false;
}

function update() {
    if (RapidRow.currentFrame % RapidRow.Constants.platformGenerationTime == 0)
        RapidRow.generatePlatform();

    RapidRow.player.velocity.add(RapidRow.Constants.gravity);
    RapidRow.player.move();
    for (var i = 0; i < RapidRow.platforms.length; i++) {
        RapidRow.platforms[i].move();
    }
    
    collideUnit(RapidRow.player, RapidRow.platforms);
    
    RapidRow.player.velocity.x = 0;
    if (RapidRow.keyboard[RapidRow.keys.a])
        RapidRow.player.velocity.x = -RapidRow.Constants.playerSpeed;
    if (RapidRow.keyboard[RapidRow.keys.d])
        RapidRow.player.velocity.x = RapidRow.Constants.playerSpeed;

    RapidRow.currentFrame++;
    setTimeout(update, RapidRow.Constants.updateTime);
}

function draw() {
    context.fillStyle = RapidRow.Constants.mapColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    RapidRow.player.draw(context);
    for (var i = 0; i < RapidRow.platforms.length; i++) {
        RapidRow.platforms[i].draw(context);
    }
    
    requestAnimationFrame(draw);
}

window.onkeydown = function (keyInfo) {
    RapidRow.keyboard[keyInfo.keyCode] = true;
}
window.onkeyup = function (keyInfo) {
    RapidRow.keyboard[keyInfo.keyCode] = false;
}

draw();
update();