class creature{//parent creature class
  constructor(name, hitPoints, armorClass, save, mainStat, abilities, image, proficiency = 2, actions = 1, statusIcons = ""){
    //attributes
    this.name = name;//name of creature
    this.maxHP = hitPoints;//max amount of health
    this.hp = hitPoints;//current amount of health
    this.ac = armorClass;//armor (meet or beat to land a hit)
    this.save = save;//saving throw bonus against abilities
    this.mainStat = mainStat;//main stat used for attack and damage
    this.abilities = abilities;//array of abilities the creature has
    this.image = image;//image of creature
    this.proficiency = proficiency;//bonus to attacks, but not damage
    this.actions = actions;//number of actions a creature has
    this.statusIcons = statusIcons;//store element container for status icons

    //overwritten by child class
    this.saveDC = 10 + mainStat;//target save for opponents against your abilities
    this.attack = mainStat;//attack bonus for physical attack

    //status effects
    this.debuff = false;
    this.debuffCounter = 0;
    this.buff = false;
    this.buffCounter = 0;
  }
  takeDamage(damage){//take damage and display message to log
    updateLog(this.name + " took " + damage + " points of damage");
    this.hp -= damage;
  }
  toggleDebuff(duration){//toggle debuff on and off
    if(this.debuff){
      this.debuff = false;
    }else{
      updateLog(this.name + " has been debuffed!");
      this.debuffCounter = duration;
      this.debuff = true;
    }
  }
  toggleBuff(duration){//toggle buff on and off
    if(this.buff){
      this.buff = false
    }else{
      updateLog(this.name + " has been buffed!");
      this.buffCounter = duration;
      this.buff = true;
    }
  }
  d20Roll(){//roll a d20
    var rollResult = roll(20);
    if((this.debuff || this.buff) && !(this.debuff && this.buff)){//check for advantage or disadvantage
      var num = roll(20);//roll second dice for either adv or disadv
      if (this.debuff){
        updateLog("Rolling with disadvantage.");
        rollResult = (rollResult > num) ? num : rollResult;//check for lowest number
      }else if (this.buff){
        updateLog("Rolling with advantage");
        rollResult = (rollResult < num) ? num : rollResult;//check for highest number
      }
    }
    return rollResult;
  }
}

class caster extends creature{//caster class
  constructor(name, hitPoints, armorClass, save, mainStat, abilities, image, proficiency = 2, actions = 1, statusIcons = ""){
    super(name, hitPoints, armorClass, save, mainStat, abilities, image, proficiency, actions, statusIcons);
    //add proficiency to saveDC and save bonus for caster
    this.saveDC += proficiency;
    this.save += proficiency;
  }
}

class fighter extends creature{
  constructor(name, hitPoints, armorClass, save, mainStat, abilities, image, proficiency = 2, actions = 1, statusIcons = ""){
    super(name, hitPoints, armorClass, save, mainStat, abilities, image, proficiency, actions, statusIcons);
    //add proficiency to attack bonus for fighter
    this.attack += proficiency;
  }
}

//roll dice function
function roll(dice){
  var roll = Math.floor(Math.random()*dice)+1;
  return roll;
}
