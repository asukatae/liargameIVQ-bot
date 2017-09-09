const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
var LinkedList = require('singly-linked-list');

var list = new LinkedList(); 

var listID =  new LinkedList();
var listTag =  new LinkedList();

var listIdentity = new LinkedList();
var listStatus = new LinkedList();
var listCrosses = new LinkedList();
var listScythes = new LinkedList();
var listProposals = new LinkedList();
var listContacted = new LinkedList();

var listRumor= new LinkedList();
var listInv= new LinkedList();
var x;
var y;

var author;
var target;

var alreadyPressPlay=false;
var sTime;
var counter;

var countDown = 600;
var gameStart=false;
var gameRound2=false;
var gameRound3=false;

client.on('ready', () => {
  client.user.setGame('Let\'s play Liar Game IVQ!');
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  
  var content = msg.content //contains all the text Ex: !addrole Member
  var parts = content.split(" "); //splits everything up on spaces so you'll have an array of two strings
  

  if (msg.isMentioned(client.user)) {
    msg.channel.send('Welcome to a game of Liar Game Angels and Demons!\nCommands:\n`l!rules` `l!join` `l!play` `l!commands` `l!quit` `l!about`');
  }
  if (msg.content === config.prefix  + '!' + 'rules') {
	explainRules(msg);
  }
  if (msg.content === config.prefix  + '!' + 'join') {
	join(msg);
  }
  if (msg.content === config.prefix  + '!' + 'quit') {
      if (alreadyPressPlay==true){
           var index=0;
            
            for (index = 0; index< list.getSize(); index++){
                client.channels.get('348485259030953984').send( list.findAt(index).getData()+' is a ' +listIdentity.findAt(index).getData() +" whose status is "+listStatus.findAt(index).getData()+" with "+listCrosses.findAt(index).getData()+" crosses and "+listScythes.findAt(index).getData()+" scythes.");
            }
            
            index=0;
            var count=0;
            for (index = 0; index< list.getSize(); index++){
                if(listStatus.findAt(index).getData()==="angel"){
                    count++;
                }                
            }
            var n = list.getSize()-count;
            client.channels.get('348485259030953984').send("Angels: " +count+" Demons: "+n);
            
            if (count==list.getSize()/2){
                client.channels.get('348485259030953984').send("Result: angels and demons tie!");
            }else if (count < list.getSize()/2){
                client.channels.get('348485259030953984').send("Result: demons win!");
                
            }else{
                client.channels.get('348485259030953984').send("Result: angels win!");
            }
      }
	clear();
    msg.channel.send('Game restart. Press `l!join` and `l!play` to play the game.');
  }
  if (msg.content === config.prefix  + '!' + 'play') {
	if(checkEnoughPeople(msg)){
		play(msg);
	}
	else{
		msg.channel.send('We don\'t have enough people to play the game.');
	}
  }
  if (msg.content === config.prefix  + '!' + 'about') {
	msg.channel.send('This is a bot created by Asuka Tae (飛鳥 妙) in August 2017! Thank you for playing!');
  }
  if (msg.content === config.prefix  + '!' + 'commands') {
	msg.channel.send('`l!rules` `l!join` `l!play` `l!quit` `l!about`\n`l!propose @username` `l!accept @username` `l!ascend` `l!descend` `l!players`\n`l!rumor This_is_a_rumor` `l!investigate` `l!sendCross` `l!sendScythe`');
  }
  if (msg.content === config.prefix  + '!' + 'players') {
	msg.channel.send("Players: " + list.printList());
  }
  if (msg.content === config.prefix  + '!' + 'status') {
      if(alreadyPressPlay==false){
          msg.channel.send('The game has not started!');
      }else{
            var index = list.indexOf(msg.author.toString());
            var identity = listIdentity.findAt(index).getData();
            var stat= listStatus.findAt(index).getData();
            var numCross = listCrosses.findAt(index).getData();
            var numScythe = listScythes.findAt(index).getData();
          
            if(identity=="angel"){
                msg.author.send("You are on the angel team. Your status is a "+ stat +". You have "+numCross+" crosses and "+numScythe+" scythes.");
            }else{
                msg.author.send("You are on the demon team. Your status is a "+ stat +". You have "+numCross+" crosses and "+numScythe+" scythes.");
            }
      }
  }  
  if (msg.content === config.prefix  + '!' + 'ascend') {
      if(alreadyPressPlay==false){
          msg.channel.send('The game has not started!');
      }else{
          var self = msg.author.toString();
          var indexSelf=list.indexOf(self);
          var i= listCrosses.findAt(indexSelf).getData();
          
          if (i==0){
              msg.author.send("You have no crosses to purify youself with. Ascension failed!");
          }else{
              listCrosses.findAt(indexSelf).editData(+i- +1);
              listStatus.findAt(indexSelf).editData("angel");
              msg.author.send("You have "+ listCrosses.findAt(indexSelf).getData() +" crosses left. Ascension success!");
          }
      }
  }  
    
  if (msg.content === config.prefix  + '!' + 'descend') {
      if(alreadyPressPlay==false){
          msg.channel.send('The game has not started!');
      }else{
          var self = msg.author.toString();
          var indexSelf=list.indexOf(self);
          var i= listScythes.findAt(indexSelf).getData();
          
          if (i==0){
              msg.author.send("You have no scythes to demonize youself with. Descension failed!");
          }else{
              listScythes.findAt(indexSelf).editData(+i - +1);
              listStatus.findAt(indexSelf).editData("demon");
              msg.author.send("You have "+ listScythes.findAt(indexSelf).getData() +" scythes left. Descension success!");
          }
      }
  }  
    
  if (parts[0] === config.prefix  + '!' + 'propose'){
      if(alreadyPressPlay==false){
          msg.channel.send('The game has not started!');
      }else{
     
          author = msg.author.toString();
          target = parts[1];
          if(author===target){
              msg.channel.send("You cannot propose to yourself. Try someone else.");
          }
          else if(contactedAlready(author, target)){
                msg.channel.send("This combination has already been used. Try someone else.");
          }else{
              
               msg.channel.send(author+ " proposed to "+target+ " that they contact. Press l!accept @username to accept invitation.");
          }
            
      }
      
  }
 
  if(parts[0] === config.prefix  + '!' + 'accept'){
       
      console.log(msg.author.toString());
      console.log(target);
      console.log(author);
      console.log(parts[1]);
      
     if ((msg.author.toString()===target) && (author=== parts[1])){
        var indexAuthor=list.indexOf(author);
        var indexTarget=list.indexOf(target);
       
        if((listStatus.findAt(indexAuthor).getData()==="angel")&&(listStatus.findAt(indexTarget).getData()==="angel")){ //if both are angels
            
            var i= listCrosses.findAt(indexAuthor).getData();
            listCrosses.findAt(indexAuthor).editData(+i+ +1);
            var j= listCrosses.findAt(indexTarget).getData();
            listCrosses.findAt(indexTarget).editData(+j+ +1);
            
        }else if((listStatus.findAt(indexAuthor).getData()==="demon")&&(listStatus.findAt(indexTarget).getData()==="demon")){ //if both are demons
            var i= listScythes.findAt(indexAuthor).getData();
            listScythes.findAt(indexAuthor).editData(+i+ +1);
            var j= listScythes.findAt(indexTarget).getData();
            listScythes.findAt(indexTarget).editData(+j+ +1);
            
        }else if((listStatus.findAt(indexAuthor).getData()==="angel")&& (listStatus.findAt(indexTarget).getData()==="demon")){ //if author is angel
             var i= listCrosses.findAt(indexAuthor).getData();        
             var j= listCrosses.findAt(indexTarget).getData();
            
            if (i==0){
                listStatus.findAt(indexAuthor).editData("demon");
            }else if(i>=1){
                //listStatus.findAt(indexAuthor).editData("demon");
                listCrosses.findAt(indexAuthor).editData(+i - +1);
                listStatus.findAt(indexTarget).editData("angel");
            }
        }else if((listStatus.findAt(indexAuthor).getData()==="demon")&&(listStatus.findAt(indexTarget).getData()==="angel")){ //if author is demon
             var i= listCrosses.findAt(indexAuthor).getData();        
             var j= listCrosses.findAt(indexTarget).getData(); //is angel
            
            if (j==0){
                listStatus.findAt(indexTarget).editData("demon");
            }else if(j>=1){
                //listStatus.findAt(indexTarget).editData("demon");
                listCrosses.findAt(indexTarget).editData(+j- +1); //here
                listStatus.findAt(indexAuthor).editData("angel");
            }
        }
        
         addtoContacted(author,target);
         msg.channel.send("Connection verified.");
     }else{
         msg.channel.send("You do not have permission for this command.");
     }
  }
    
  if (parts[0] === config.prefix  + '!' + 'rumor'){
      if(alreadyPressPlay==false){
          msg.channel.send('The game has not started!');
      }else{
          if (parts[1]==null){
              msg.channel.send('Your message is empty! Try l!rumor again!');
          }else{
              //var self = msg.author.toString();
              //var indexSelf=list.indexOf(self);
          
              //if(listRumor.findAt(indexSelf).getData()==='0'){
                  msg.channel.send('You just spread a rumor! Go to channel to view your rumor.');
                  client.channels.get('348485259030953984').send("A rumor has spread! It says: "+parts[1]);
                 // listRumor.findAt(indexSelf).editData('1');
              //}else{
                //msg.channel.send('You already spread a rumor!');
              //}
          }     
      }
  }
  if (parts[0] === config.prefix  + '!' + 'investigate'){
      if(alreadyPressPlay==false){
          msg.channel.send('The game has not started!');
      }else{
          if (parts[1]==null){
              var self = msg.author.toString();
              var indexSelf=list.indexOf(self);
              var num = listInv.findAt(indexSelf).getData();
              if (num ==='0'){
                  msg.channel.send('You can investigate one time!');
                  msg.channel.send(listTag.printDMList()+'\nUse l!investigate number to investigate the status of person!');
              }else{
                  msg.channel.send('You already investigated once!');
              }
          }else{
              var self = msg.author.toString();
              var indexSelf=list.indexOf(self);
          
              if(listInv.findAt(indexSelf).getData()==='0'){
                  if (parts[1]<list.getSize()){
                      
                  var stat = listStatus.findAt(parts[1]).getData();
                  msg.author.send('You investigated '+listTag.findAt(parts[1]).getData()+'. His status is '+stat+'.');
                  listInv.findAt(indexSelf).editData('1');
                  }else{
                       msg.channel.send("Invalid number! Please l!investigate number again.");
                  }
              }else{
                msg.channel.send('You already investigated once!');
              }
          }     
      }
  }
  if (parts[0] === config.prefix  + '!' + 'sendCross'){
      if(alreadyPressPlay==false){
          msg.channel.send('The game has not started!');
      }else{
          var self = msg.author.toString();
          var indexSelf=list.indexOf(self);
          
          if (parts[1]==null){
              var num = listCrosses.findAt(indexSelf);
              if (num >=1){
                  msg.channel.send('You have '+ num +' crosses!');
                  msg.channel.send(listTag.printDMList()+'\nUse l!sendCross number to deliver a cross!');
              
              }else{
                  msg.channel.send('You have no crosses to give away!');
              }
              
          }else{
              if (parts[1]<list.getSize()){
                 var numSender = listCrosses.findAt(indexSelf);
                 var numReceiver = listCrosses.findAt(parts[1]);
                  listCrosses.findAt(indexSelf).editData(+numSender- +1);
                  listCrosses.findAt(parts[1]).editData(+numReceiver+ +1);
                  msg.channel.send('You have given '+ listTag.findAt(parts[1]).getData()+' a cross!');
              
              }else{
                msg.channel.send("Invalid number! Please l!sendCross number again.");
                  
              }
              
          }     
      }
  }
  if (parts[0] === config.prefix  + '!' + 'sendScythe'){
      if(alreadyPressPlay==false){
          msg.channel.send('The game has not started!');
      }else{
          var self = msg.author.toString();
          var indexSelf=list.indexOf(self);
          
          if (parts[1]==null){
              var num = listScythes.findAt(indexSelf);
              if (num >=1){
                  msg.channel.send('You have '+ num +' scythes!');
                  msg.channel.send(listTag.printDMList()+'\nUse l!sendScythe number to deliver a scythe!');
              
              }else{
                  msg.channel.send('You have no scythes to give away!');
              }
              
          }else{
              if (parts[1]<list.getSize()){
                 var numSender = listScythes.findAt(indexSelf);
                 var numReceiver = listScythes.findAt(parts[1]);
                  listScythes.findAt(indexSelf).editData(+numSender- +1);
                  listScythes.findAt(parts[1]).editData(+numReceiver+ +1);
                  msg.channel.send('You have given '+ listTag.findAt(parts[1]).getData()+' a scythe!');
              
              }else{
                msg.channel.send("Invalid number! Please w!sendScythe number again.");
                  
              }
              
          }     
      }
  }
    
});


function explainRules(msg){
    msg.channel.send('__**How to play the game:**__\nThe game has 3 rounds, each round 10 minutes. The players are divided into angels and demons by 2:1 ratio. Each player can examine their status by pressing `l!status` throughout the game. When two angels contact, they will each receive a cross. However, contacting the same person twice will not produce another cross. If two demons contact, a scythe is formed. If an angel contacts a demon, the angel will become a demon. If the demon contacts a cross holder, he will become an angel, while the other player loses one cross. A demon who owns a cross can activate it to become an angel, but he will lose a cross. An angel can activate a scythe to become a demon. You can spread rumors and investigate 1 person\'s status. You can send a cross or scythe to someone else. The objective of the game is to convert as many people as you can to your team. ');
}

function join(msg){
    
    if(alreadyPressPlay==true){
		client.channels.get('348485259030953984').send("The game already started. You cannot join.");
	}
	else if(list.contains(msg.author.toString())){
		msg.reply('You\'ve already joined');
	}
	//if it's Tensai
	else if('<@85614143951892480>'=== msg.author.toString()){
		console.log(`Tensai tried to join the game`);
	}
	else{
		list.insert(msg.author.toString());
		let strAuthor = msg.author.toString(); 
		idAuthor = strAuthor.replace(/[<@!>]/g, '');
		      
        listID.insert(idAuthor);
        listTag.insert(msg.author.tag);
        listIdentity.insert("angel");
        listStatus.insert("angel");
        listCrosses.insert('0');
		listScythes.insert('0');
        listRumor.insert('0');
        listInv.insert('0'); 
	}
	client.channels.get('348485259030953984').send('Players: ' + list.printList());
	
}

function checkEnoughPeople(msg){
	if (list.getSize()>=4){

		return true;
	}
	else{
		return false;
	} 
		
}	
function assignRoles(){
    var num = list.getSize();
    var players = new Array(num);
    var pickDemons = Math.ceil(list.getSize()/3);
        
    for (var i = 0; i < num; i++) {
        players[i] = "-1";
    }
    
    x = Math.floor(Math.random() * list.getSize()) ;
    
    players[x] = list.findAt(0).getData();
    
    for (var i = 1; i < num; i++) {
        x = Math.floor(Math.random() * list.getSize()) ;
        while(!(players[x]==="-1")){
            x = Math.floor(Math.random() * list.getSize()) ;
        }
        players[x] = list.findAt(i).getData();
    }
    
    for (var i = 0; i < num; i++) {
            var index = list.indexOf(players[i]);
        console.log("Players: " + listTag.findAt(index));

    }
    
    for (var i = 0; i < pickDemons; i++) {
            console.log('Enter here');
            var index = list.indexOf(players[i]);
            console.log(index);
       
            console.log("Demon: " + listTag.findAt(index));
            listIdentity.findAt(index).editData("demon");
            listStatus.findAt(index).editData("demon");
    }
    for (var i = 0; i < num; i++) {
            var index = list.indexOf(players[i]);
        console.log("Players: " + listTag.findAt(index)+ listIdentity.findAt(index)+ listStatus.findAt(index));

    }

}


function play(msg){
	if (alreadyPressPlay==false){
		alreadyPressPlay=true;
		client.channels.get('348485259030953984').send('The timer is counting down. Each round is 10 minutes. There are two teams, angels and demons. Check your status with `l!status`. In the meantime, pair up with someone to get crosses with `l!propose @username`. To ascend yourself from a demon to an angel, press `l!ascend`. To descend yourself from an angel to a demon, press `l!descend`.  Use `l!rumor This_is_a_rumor` to spread a rumor or `l!investigate` to investigate someone. Use `l!sendCross` or `l!sendScythe` to give away item. Use `l!players` to see who you can pair up with.');

		assignRoles();
		
		while (!gameStart){
			sTime = new Date().getTime();
		    counter = setInterval(function(){gameContRound1(msg)}, 500);
    		gameStart=true;
            
		}

	}else{
		client.channels.get('348485259030953984').send('Game already started');
	}
}	

async function gameContRound1(msg) {
 	var cTime = new Date().getTime();
    var diff = cTime - sTime;
    var seconds = countDown - Math.floor(diff / 1000);
    console.log(seconds);
    if(seconds<0||(gameStart==false)){
    	clearInterval(counter);
        if(seconds<0){
            round1(msg);
            sTime=0;
            counter=0;
            while (!gameRound2){
                sTime = new Date().getTime();
                counter = setInterval(function(){gameContRound2(msg)}, 500);
    		    gameRound2=true;
            
		    }
        }
        
        
    }
}
function gameContRound2(msg){
    var cTime = new Date().getTime();
    var diff = cTime - sTime;
    var seconds = countDown - Math.floor(diff / 1000);
    console.log(seconds);
    if(seconds<0||(gameRound2==false)){
    	clearInterval(counter);
        if (seconds<0){
            round2(msg);
            sTime=0;
            counter=0;
            
            while (!gameRound3){			
            sTime = new Date().getTime();
		    counter = setInterval(function(){gameContRound3(msg)}, 500);
    		gameRound3=true;
            }
        
    
		} 
        
    }
    
}
function gameContRound3(msg){
    var cTime = new Date().getTime();
    var diff = cTime - sTime;
    var seconds = countDown - Math.floor(diff / 1000);
    console.log(seconds);
    if(seconds<0||(gameRound2==false)){
    	clearInterval(counter);
        if (seconds <0){
            round3(msg);
        }
        
        clear();
    }
    
}

function round3(msg){
    
     var index=0;
            
            for (index = 0; index< list.getSize(); index++){
                client.channels.get('348485259030953984').send( list.findAt(index).getData()+' is on the ' +listIdentity.findAt(index).getData() +" team whose status is "+listStatus.findAt(index).getData()+" with "+listCrosses.findAt(index).getData()+" crosses and "+listScythes.findAt(index).getData()+" scythes.");
            }
            
            index=0;
            var count=0;
            for (index = 0; index< list.getSize(); index++){
                if(listStatus.findAt(index).getData()==="angel"){
                    count++;
                }                
            }
            var n = list.getSize()-count;
            client.channels.get('348485259030953984').send("Round 3\nAngels: " +count+" Demons: "+n);
            
            if (count==list.getSize()/2){
                client.channels.get('348485259030953984').send("Result: angels and demons tie!");
            }else if (count < list.getSize()/2){
                client.channels.get('348485259030953984').send("Result: demons win!");
                
            }else{
                client.channels.get('348485259030953984').send("Result: angels win!");
            }
    client.channels.get('348485259030953984').send("Please press `l!join` and `l!play` to play again.");
}
function round2(msg){
    
     var index=0;
            

            
            index=0;
            var count=0;
            for (index = 0; index< list.getSize(); index++){
                if(listStatus.findAt(index).getData()==="angel"){
                    count++;
                }                
            }
            var n = list.getSize()-count;
            client.channels.get('348485259030953984').send("Round 2\nAngels: " +count+" Demons: "+n);

}
function round1(msg){
    
     var index=0;
            
            index=0;
            var count=0;
            for (index = 0; index< list.getSize(); index++){
                if(listStatus.findAt(index).getData()==="angel"){
                    count++;
                }                
            }
            var n = list.getSize()-count;
            client.channels.get('348485259030953984').send("Round 1\nAngels: " +count+" Demons: "+n);

}

function  addtoContacted(author, target){
    listContacted.insert(author+target);
    listContacted.insert(target+author);
}

function contactedAlready(author, target){

    if (listContacted.contains(author+target)){
        return true;
    }
    else if (listContacted.contains(target+author)){
        return true;
    }
    else return false;
}
function clear(){
list.clear(); 
listID.clear();
listTag.clear();
listIdentity.clear();
listStatus.clear();
listCrosses.clear();
listProposals.clear();
listContacted.clear();
listRumor.clear();
listInv.clear();
    
x=-1;
y=-1;

author="";
target="";

alreadyPressPlay=false;

var sTime=0;
var counter=0;

gameStart=false;
gameRound2=false;
gameRound3=false;
}


client.login(config.token);
