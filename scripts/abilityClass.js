class ability{//base ability parent class
  constructor(name, cooldown = 0, duration = 0){
    this.name = name;
    this.cooldown = cooldown;
    this.cooldownCounter = cooldown;
    this.duration = duration;
  }
}

class buffAbility extends ability{//base buff ability
  constructor(name, cooldown = 0, duration = 0){
    super(name, cooldown, duration);
  }
  use(attacker, defender){
    this.cooldownCounter = 0;//set counter
    updateLog("<p>" + attacker.name + " used " + this.name + "</p>");
    if(!attacker.buff){//if not already buffed, take effect
      attacker.toggleBuff(this.duration);
    }else{
      updateLog("<p>" + attacker.name + " is already buffed. No Effect." + "</p>");
    }
  }
}

class debuffAbility extends ability{//base debuff ability
  constructor(name, cooldown = 0, duration = 0){
    super(name, cooldown, duration);
  }
  use(attacker, defender){
    this.cooldownCounter = 0;
    if(!defender.debuff){//of mpt already debuffed, take effect
      defender.toggleDebuff(this.duration);
    }else{
      updateLog("<p>" + defender.name + " is already debuffed. No Effect." + "</p>");
    }
  }
}

class diceAbility extends ability{//dice based ability class
  constructor(name, diceSides, numDice = 1, bonus = 0, cooldown = 0, duration = 0){
    super(name, cooldown, duration);
    this.diceSides = diceSides;//number of sides to the dice
    this.numDice = numDice;//number of dice to the ability
    this.bonus = bonus;//bonus for the ability
  }
  use(attacker, defender){
    this.cooldownCounter = 0;
    var diceResult = this.bonus;
    for(var i = 0; i < this.numDice; i++){
      diceResult += roll(this.diceSides);
    }
    return diceResult;
  }
}

class saveDebuffAbility extends debuffAbility{//save debuff ability
  constructor(name, cooldown = 0, duration = 0){
    super(name, cooldown, duration);
  }
  use(attacker, defender){
    this.cooldownCounter = 0;
    updateLog("<p>" + attacker.name + " used " + this.name + "</p>");
    var saveRoll = defender.d20Roll();
    var totalRoll = (saveRoll + defender.save);
    updateLog("<p>" + defender.name + " rolled a " + totalRoll + " to save." + "</p>");
    if (totalRoll >= attacker.saveDC){
      updateLog("<p>" + defender.name + " succeeds their saving throw!" + "</p>");
    }else{
      updateLog("<p>" + defender.name + " fails their saving throw!" + "</p>");
      super.use(attacker, defender);
    }
  }
}

class healAbility extends diceAbility{//heal dice ability
  constructor(name, diceSides, numDice = 1, bonus = 0, cooldown = 0, duration = 0){
    super(name, diceSides, numDice, bonus, cooldown, duration);
  }
  use(attacker, defender){//deal damage
    this.cooldownCounter = 0;
    var heal = super.use(attacker, defender);
    updateLog("<p>" + attacker.name + " healed " + heal + " points" + "</p>");
    attacker.hp += heal;
    if(attacker.hp > attacker.maxHP){
      attacker.hp = attacker.maxHP;
    }
  }
}

class damageAbility extends diceAbility{//damage dice ability
  constructor(name, diceSides, numDice = 1, bonus = 0, cooldown = 0, duration = 0){
    super(name, diceSides, numDice, bonus, cooldown, duration);
  }
  use(attacker, defender){//deal damage
    this.cooldownCounter = 0;
    return super.use(attacker, defender);
  }
}

class attackDamageAbility extends damageAbility{//attack damage dice ability
  constructor(name, diceSides, numDice = 1, bonus = 0, cooldown = 0, duration = 0){
    super(name, diceSides, numDice, bonus, cooldown, duration);
  }
  use(attacker, defender){
    this.cooldownCounter = 0;
    updateLog("<p>" + attacker.name + " uses " + this.name + " on " + defender.name + "</p>");

    var attackRoll = attacker.d20Roll();
    var totalRoll = (attackRoll + attacker.attack);

      updateLog(attacker.name + " rolled a " + totalRoll + " to hit.");

    if(attackRoll == 0 || totalRoll < defender.ac){//miss
      updateLog("It's a miss!");
    }else{//hit
      var damage = super.use(attacker,defender) + attacker.mainStat;
      if(attackRoll == 20){//critical hit
        updateLog(attacker.name + " rolled a critical hit!")
        damage += super.use(attacker,defender);//extra dice damage from crit
      }else{//normal hit
        updateLog("It's a hit!");
      }
      defender.takeDamage(damage);
    }
  }
}

class saveDamageAbility extends damageAbility{//save damage dice ability
  constructor(name, diceSides, numDice = 1, bonus = 0, cooldown = 0, duration = 0){
    super(name, diceSides, numDice, bonus, cooldown, duration);
  }
  use(attacker, defender){
    updateLog("<p>" + attacker.name + " uses " + this.name + " on " + defender.name + "</p>");
    this.cooldownCounter = 0;
    var damage = 0;
    var saveRoll = defender.d20Roll();
    var totalRoll = (saveRoll + defender.save);
    updateLog(defender.name + " rolled a " + totalRoll + " to save.");
    if (totalRoll >= attacker.saveDC){
      updateLog(defender.name + " succeeds their saving throw!");
    }else{
      updateLog(defender.name + " fails their saving throw!");
      damage = super.use(attacker,defender) + attacker.mainStat;
      defender.takeDamage(damage);
    }
  }
}
