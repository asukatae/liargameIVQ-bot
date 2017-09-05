const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
var LinkedList = require('singly-linked-list');

var list = new LinkedList(); 

var listID =  new LinkedList();
var listIdentity = new LinkedList();
var listStatus = new LinkedList();
var listCrosses = new LinkedList();
var listScythes = new LinkedList();
var listProposals = new LinkedList();
var listContacted = new LinkedList();
var x;
var y;

var author;
var target;

var alreadyPressPlay=false;
var sTime;
var counter;

var countDown = 600;
var gameStart=false;

client.on('ready', () => {
  client.user.setGame('Let\'s play Liar Game IVQ!');
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  
  var content = msg.content //contains all the text Ex: !addrole Member
  var parts = content.split(" "); //splits everything up on spaces so you'll have an array of two strings
  

  if (msg.isMentioned(client.user)) {
    msg.channel.send('Welcome to a game of Liar Game Angels and Demons!\nCommands:\n`w!rules` `w!join` `w!play` `w!quit` `w!about`');
  }
  if (msg.content === config.prefix  + '!' + 'rules') {
	explainRules(msg);
  }
  if (msg.content === config.prefix  + '!' + 'join') {
	join(msg);
  }
  if (msg.content === config.prefix  + '!' + 'quit') {
	clear();
    msg.channel.send('Game restart.');
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
                msg.author.send("You are an angel. You are converted as a "+ stat +". You have "+numCross+" crosses and "+numScythe+" scythes.");
            }else{
                msg.author.send("You are a demon. You are converted as a "+ stat +" .You have "+numCross+" crosses and "+numScythe+" scythes.");
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
              listCrosses.findAt(indexSelf).editData(i-1);
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
              listScythes.findAt(indexSelf).editData(i-1);
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
          
          if(contactedAlready(author, target)){
                msg.channel.send("This combination has already been used. Try someone else.");
          }else{
              
               msg.channel.send(author+ " proposed to "+target+ " that they contact. Press l!accept @username to accept invitation.");
          }
          
          
          
          
            
            
      }

      
      
  }
 
  if(parts[0] === config.prefix  + '!' + 'accept'){
       msg.channel.send("Connection verified.");
      
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
                listStatus.findAt(indexAuthor).editData("demon");
                console.log(listCrosses.findAt(indexAuthor).editData(+i-1));
                listCrosses.findAt(indexAuthor).editData(i-1);
                listStatus.findAt(indexTarget).editData("angel");
            }
        }else if((listStatus.findAt(indexAuthor).getData()==="demon")&&(listStatus.findAt(indexTarget).getData()==="angel")){ //if author is demon
             var i= listCrosses.findAt(indexAuthor).getData();        
             var j= listCrosses.findAt(indexTarget).getData();
            
            if (j==0){
                listStatus.findAt(indexTarget).editData("demon");
            }else if(j>=1){
                listStatus.findAt(indexTarget).editData("demon");
                listCrosses.findAt(indexTarget).editData(+i-1);
                listStatus.findAt(indexAuthor).editData("angel");
            }
        }
        
         addtoContacted(author,target);
         
     }else{
         msg.channel.send("You do not have permission for this command.");
     }
  }
    
});


function explainRules(msg){
    msg.channel.send('__**How to play the game:**__\nThe game takes 10 minutes. The players are divided into angels and demons. Each player can examine their status by pressing `l!status` throughout the game. When two angels contact, they will each receive a cross. However, contacting the same person twice will not produce another cross. If two demons contact, a scythe is formed. If an angel contacts a demon, the angel will become a demon. If the demon contacts a cross holder, he will become an angel, while the other player loses one cross. A demon who owns a cross can activate it to become an angel, but he will lose a cross. An angel can activate a scythe to become a demon. The objective of the game is to convert as many people as you can to your team.');
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
        listIdentity.insert("angel");
        listStatus.insert("angel");
        listCrosses.insert('0');
		listScythes.insert('0');
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
        if(i%2==0){ //angel
            var index = list.indexOf(players[i]);
            listIdentity.findAt(index).editData("angel");
            listStatus.findAt(index).editData("angel");
        }else{
            var index = list.indexOf(players[i]);
            listIdentity.findAt(index).editData("demon");
            listStatus.findAt(index).editData("demon");
        }
        
    }

}


function play(msg){
	if (alreadyPressPlay==false){
		alreadyPressPlay=true;
		client.channels.get('348485259030953984').send('The timer counts down for 10 minutes. There are two teams, angels and demons. Check your status with l!status. In the meantime, pair up with someone to get crosses with `l!propose @username`. To ascend yourself from a demon to an angel, press `l!ascend`. To descend yourself from an angel to a demon, press `l!descend`. ');

		assignRoles();
		
		while (!gameStart){
			sTime = new Date().getTime();
		    counter = setInterval(function(){wait(msg)}, 500);
    		gameStart=true;
            
		}

	}else{
		client.channels.get('348485259030953984').send('Game already started');
	}
}	

async function wait(msg) {
 	var cTime = new Date().getTime();
    var diff = cTime - sTime;
    var seconds = countDown - Math.floor(diff / 1000);
    console.log(seconds);
    if(seconds<0||(gameStart==false)){
    	clearInterval(counter);
        
            var index=0;
            
            for (index = 0; index< list.getSize(); index++){
                client.channels.get('348485259030953984').send( list.findAt(index).getData()+' is a ' +listIdentity.findAt(index).getData() +" converted to "+listStatus.findAt(index).getData()+" with "+listCrosses.findAt(index).getData()+" crosses and "+listScythes.findAt(index).getData()+" scythes.");
            }
            
            index=0;
            var count=0;
            for (index = 0; index< list.getSize(); index++){
                if(listStatus.findAt(index).getData()==="angel"){
                    count++;
                }                
            }
            if (count==list.getSize()/2){
                client.channels.get('348485259030953984').send("Result: angels and demons tie!");
            }else if (count < list.getSize()/2){
                client.channels.get('348485259030953984').send("Result: demons win!");
                
            }else{
                client.channels.get('348485259030953984').send("Result: angels win!");
            }
                
        clear();
    }
}

function  addtoContacted(author, target){
    listContacted.insert(author+target);
    listContacted.insert(target+author);
    console.log(listContacted.printList());
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
listStatus.clear();
listCrosses.clear();
listProposals.clear();
listContacted.clear();
x=-1;
y=-1;

author="";
target="";

alreadyPressPlay=false;

var sTime=0;
var counter=0;

gameStart=false;
	
}


client.login(config.token);
