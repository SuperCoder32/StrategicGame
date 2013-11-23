(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d");
	
    //Дефиниция на клас
	function Vector(x, y) {
        //Публична променлива - пипаме навсякъде
		this.x = x;
		this.y = y;
		
        //Публична функция - като променливата, 
        //ама функция.
		this.add = function (vec2) {
			//This значи "аз" или себе си за класа.
			//pesho.add() => в add this=pesho
			this.x += vec2.x;
			this.y += vec2.y;
		}
	}
	
	//За да пипаме неща по обекта, пишем:
	//object.property
	
	//Renderer - рисува неща по екрана.
	//Тук правим логиката за рисуване.
	function Renderer(canvas, context) {
		//Слагаме beginScene на две места,
		//защото при краш казва коя функция
		//е виновна
		this.beginScene = function beginScene() {
			context.fillStyle = RapidRow.Constants.mapColor;
			context.fillRect(0, 0, canvas.width, canvas.height);
		}
		
		//Рисува както player, така и platform.
		//Приема обект, който има location и size
		this.drawUnit = function drawUnit(unit) {
			context.fillStyle = unit.color;
			context.fillRect(unit.location.x, unit.location.y,
							 unit.size.x, unit.size.y);
		}
	}
	
	//Занимава се с колизии на единици и поведение
	//при тях.
	function PhysicsEngine(gravity) {
		//Движим произволна единица (player и платформа)
		this.moveUnit = function moveUnit(unit) {
			unit.velocity.add(gravity);
			unit.location.add(unit.velocity);
		}
        
		//Колизия на два обекта
        function unitsCollide(unit1, unit2) {
            var left1 = unit1.location.x, left2 = unit2.location.x,
                top1 = unit1.location.y, top2 = unit2.location.y,
                right1 = left1 + unit1.size.x, right2 = left2 + unit2.size.x,
                bot1 = top1 + unit1.size.y, bot2 = top2 + unit2.size.y;
            
            return !(right2 < left1 || right1 < left2 ||
                    bot1 < top2 || bot2 < top1);
        }
        
		//Колизия на един обект (player в нашия случай) с много
		//обекти
        this.collideUnit = function collideUnit(unit, platform) {
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
	}
	
	//Създаваме празен обект
	var RapidRow = {};
	
	//Обект с константи на играта, тук пазим всички
	//преди магически числа
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
	//Така създаваме обекта Renderer, преди само сме
	//дефинирали КЛАСА
	RapidRow.renderer = new Renderer(canvas, context);
	RapidRow.physicsEngine = new PhysicsEngine(RapidRow.Constants.gravity);
	RapidRow.keyboard = [];
	RapidRow.keys = {
		a: 65,
		d: 68
	};
	//Текущ кадър
	RapidRow.currentFrame = 0;

	//initialize
	//Играчът е обект без логика(функции), само
	//контейнер (само променливи)
	RapidRow.player = {
		location: new Vector(canvas.width / 2, 0),
		size: RapidRow.Constants.unitSize,
		velocity: new Vector(0, 0),
		color: RapidRow.Constants.playerColor
	};
	//Масив с платформи
	RapidRow.platforms = [];
	//Основна функция за генериране на платформи
	RapidRow.generatePlatform = function generatePlatform() {
		//Това го правим, за да е по-кратко после
		var constants = RapidRow.Constants;
		
		//Създаваме нова платформа като обект
		var platform = {
			location: new Vector(
						Math.random() *  (canvas.width - constants.platformSize.x),
						canvas.height + constants.platformSize.y),
			velocity: constants.platformVelocity, //Не нови вектори,
			size: constants.platformSize, //защото те не се променят.
			color: constants.platformColor
		};
		
		//Push я слага отзад на масива.
		RapidRow.platforms.push(platform);
	};
	
	//Тук викаме функциите за рисуване на класа.
	function renderScene() {
		//Clear
		RapidRow.renderer.beginScene();
		//Рисуваме играча
		RapidRow.renderer.drawUnit(RapidRow.player);
		
		//Рисуваме всички платформи, отново с функцията
		//за рисуване на единица.
		for(var i = 0; i < RapidRow.platforms.length; i++) {
			RapidRow.renderer.drawUnit(RapidRow.platforms[i]);
		}
	
		//И повтаряме.
		requestAnimationFrame(renderScene);
	}
	
	//Логика на играта.
	function update() {
		//През колко време генерираме платформи
		if (RapidRow.currentFrame % RapidRow.Constants.platformGenerationTime == 0)
			RapidRow.generatePlatform();
	
		//Мърдаме играчът
		RapidRow.physicsEngine.moveUnit(RapidRow.player);
		//Мърдаме всички платформи.
		for(var i = 0; i < RapidRow.platforms.length; i++) {
            RapidRow.platforms[i].location.add(RapidRow.platforms[i].velocity);
            if (RapidRow.platforms[i].location.y <
                -RapidRow.platforms[i].size.y)
				//Ако излязат извън екрана, ги трием.
				//Splice приема индекс и колко елементи да изтрие
                RapidRow.platforms.splice(i, 1);
        }
        
		//Викаме колизии за играча и всички платформи.
        RapidRow.physicsEngine.collideUnit(RapidRow.player,
                                           RapidRow.platforms);
        
		//Нулираме ускорението по x.
        RapidRow.player.velocity.x = 0;
		//И му слагаме стойност, ако сме задържали копче.
		if (RapidRow.keyboard[RapidRow.keys.a])
			RapidRow.player.velocity.x = -RapidRow.Constants.playerSpeed;
		if (RapidRow.keyboard[RapidRow.keys.d])
			RapidRow.player.velocity.x = RapidRow.Constants.playerSpeed;
	
		//Следващ кадър.
		RapidRow.currentFrame++;
		setTimeout(update, RapidRow.Constants.updateTime);
	}
	
	//При натиснато копче - true.
	window.onkeydown = function (keyInfo) {
		RapidRow.keyboard[keyInfo.keyCode] = true;
	}
	//При пуснато false.
	window.onkeyup = function (keyInfo) {
		RapidRow.keyboard[keyInfo.keyCode] = false;
	}
	
	//Начално викане
	renderScene();
	update();