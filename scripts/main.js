//global variables
    let player;
    let currentMonster;
    var roundCounter = 1;
    var gameCounter = 0;
    var target = 0;
    var actionTracker = 0;
    var score = 0;

    //set game
    function setGame(){
      //goblin abilities
      let shortSword = new attackDamageAbility("Shortsword", 6);
      let hide = new saveDebuffAbility("Hide", 3, 2);
      //beholder abilities
      let bite = new attackDamageAbility("Bite", 6, 4);
      let fearRay = new saveDebuffAbility("Fear Ray", 5, 3);
      let deathRay = new saveDamageAbility("Death Ray", 8, 10, 0, 5);
      let magicCone = new buffAbility("Magic Cone", 6, 3);
      //player abilities
      let longSwordL1 = new attackDamageAbility("Longsword", 8);
      let longSwordL2 = new attackDamageAbility("Longsword", 8, 1, 2);
      let dodge = new debuffAbility("Dodge", 3, 2);
      let secondWindL1 = new healAbility("Second Wind", 10, 1, 0, 3);
      let secondWindL2 = new healAbility("Second Wind", 10, 2, 10, 3);
      let actionSurge = new buffAbility("Action Surge", 3, 2);

      //name, hitPoints, armorClass, save, mainStat, abilities, image, proficiency = 2, actions = 1, statusIcons = ""
      let goblin = new fighter("Goblin", 21, 17, -1, 2, [shortSword, hide], "art/goblin.png");
      let beholder = new caster("Beholder", 180, 18, 3, 3, [bite, fearRay, deathRay, magicCone], "art/beholder.png", 5, 2);
      let playerL1 = new fighter("Player", 12, 18, 0, 3, [longSwordL1, dodge, secondWindL1], "art/fighter.png");
      let playerL2 = new fighter("Player", 120, 21, 1, 5, [longSwordL2, dodge, secondWindL2, actionSurge], "art/fighter.png", 4, 2);

      var monsters = [goblin, beholder];
      var players = [playerL1, playerL2];

      player = players[gameCounter];
      currentMonster = monsters[gameCounter];
      roundCounter = 1;

      //setup battle while there are monsters to fight
      if(gameCounter < 2){
        player.statusIcons = document.getElementsByClassName("statusIcons")[0];
        currentMonster.statusIcons = document.getElementsByClassName("statusIcons")[1];
        //player elements
        document.getElementById("playerName").innerHTML = player.name;
        document.getElementById("playerImage").src = player.image;
        //monster elements
        document.getElementById("monsterName").innerHTML = currentMonster.name;
        document.getElementById("monsterImage").src = currentMonster.image;
        switch(currentMonster.name){
          case "Goblin":
            document.getElementById("monsterImage").style.width = "50%";
            break;
          case "Beholder":
            document.getElementById("monsterImage").style.width = "80%";
            break;
        }
        document.getElementById("log").innerHTML = "";//clear battle log
        update(player);
        update(currentMonster);
        setIcons(player);
        setIcons(currentMonster);
        setHP();
        generatePlayerOptions();
      }else{//endgame reached
        document.getElementById("log").innerHTML = "<b>You Win!</b>";
        document.getElementById("playerOptions").style.display = "none";
        document.getElementById("monsterName").innerHTML = "";
        document.getElementById("monsterImage").src = "art/treasure.png";
      }

    }

    //add message to the battle log
    function updateLog(message){
      document.getElementById("log").innerHTML += ('<p id="target' + target + '">' + message + "</p>");
      document.getElementById("target"+target).scrollIntoView({behaviour: 'smooth'});//ensures the scroll shows the most up to date event
      target++;
    }

    //sets HP for both the player and current monster
    function setHP(){
      if(player.hp < 0){player.hp = 0;}
      if(currentMonster.hp < 0){currentMonster.hp = 0;}
      document.getElementById("playerHP").style.width = ((player.hp/player.maxHP*100)+"%");
      document.getElementById("monsterHP").style.width = ((currentMonster.hp/currentMonster.maxHP*100)+"%");
    }

    //update creature attributes
    function update(creature){
      //update cooldown counter
      for(var i = 0; i < creature.abilities.length; i++){
        if(creature.abilities[i].cooldown > creature.abilities[i].cooldownCounter){
          creature.abilities[i].cooldownCounter++;
        }
      }
      //check if debuff still in effect
      if(creature.debuffCounter > 0){
        creature.debuffCounter--;
      }else{
        if(creature.debuff){
          creature.toggleDebuff();
        }
      }
      //check if buff still in effect
      if(creature.buffCounter > 0){
        creature.buffCounter--;
      }else{
        if(creature.buff){
          creature.toggleBuff();
        }
      }
    }
    //sets status icons for the creature
    function setIcons(creature){
      creature.statusIcons.innerHTML =  '<div class="statusIcon">' +
                                          '<img src="satusIcons/ac.png"/>' +
                                          '<p>' + creature.ac + '</p>' +
                                        '</div>' +
                                        '<div class="statusIcon">' +
                                          '<img src="satusIcons/physical_attack.png"/>' +
                                          '<p>' + (creature.attack < 0 ? "":"+") + creature.attack + '</p>' +
                                        '</div>' +
                                        '<div class="statusIcon">' +
                                          '<img src="satusIcons/magic_attack.png"/>' +
                                          '<p>' + creature.saveDC + '</p>' +
                                        '</div>' +
                                        (creature.buff ? '<div class="statusIcon"><img src="satusIcons/advantage.png"/>':"") +
                                        (creature.debuff ? '<div class="statusIcon"><img src="satusIcons/disadvantage.png"/>':"");
    }

    //generate player options and determine whether any should be disabled during cooldown
    function generatePlayerOptions(){
      document.getElementById("playerOptions").innerHTML = "";
      for(var i = 0; i < player.abilities.length; i++){
        document.getElementById("playerOptions").innerHTML += ('<button '+ (player.abilities[i].cooldown != player.abilities[i].cooldownCounter ? " disabled ":"") + 'id="' + player.abilities[i].name + '" value=' + i + ' onclick="play(value)">' + player.abilities[i].name + '</button>');
      }
    }

    //main play game trigged by button click
    function play(option){
      if(actionTracker == 0){updateLog("<b>Round " + roundCounter + "</b>");}

      if(player.hp > 0 && player.actions > actionTracker){//player attack while alive and actions are left
        actionTracker++;
        player.abilities[option].use(player, currentMonster);
        if(actionTracker == player.actions){actionTracker = 0;}//reset actions and let monster act
      }if(currentMonster.hp > 0 && actionTracker == 0){//monster attack while alive
        roundCounter++;
        for(var i = 0; i < currentMonster.actions; i++){
          var selection;
          do{//keep randomnly selecting an action while the selection is no available
            selection = roll(currentMonster.abilities.length)-1;
          }while(currentMonster.abilities[selection].cooldown != currentMonster.abilities[selection].cooldownCounter);
          currentMonster.abilities[selection].use(currentMonster, player);
        }
      }

      if(actionTracker == 0){//only update tracker after a round is complete
        update(player);//update player parameters
        update(currentMonster);//update monster parameters
      }
      setHP();//update health bars
      setIcons(player);//update player icons
      setIcons(currentMonster);//update monster icons
      if(player.hp > 0 && currentMonster.hp > 0){//only show options if the battle is still going
        generatePlayerOptions();//show ability buttons for player
      }

      //check for death
      if(player.hp <= 0){//player dies
        updateLog("<p>" + player.name + " has been slain!" + "</p>");
        gameCounter = 0;//reset game counter
        document.getElementById("playerOptions").innerHTML = '<button onclick="setGame()">Play Again</button>';
      }else if(currentMonster.hp <= 0){//monster dies
        updateLog("<p>" + currentMonster.name + " has been slain!" + "</p>");
        gameCounter++;//increment game counter
        score += (10000/roundCounter) + (player.hp*100);//calculate score
        document.getElementById("score").innerHTML = "Score: "+Math.round(score);//update score
        if(gameCounter < 2){document.getElementById("playerOptions").innerHTML = '<button onclick="setGame()">Next Fight</button>';}//show button  for next fight
        else{setGame();}//for endgame
      }
    }