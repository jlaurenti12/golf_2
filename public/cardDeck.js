  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyAPjtOI0waR0kIpRtDcvjKMNV875rsodbw",
    authDomain: "golf-30c34.firebaseapp.com",
    databaseURL: "https://golf-30c34-default-rtdb.firebaseio.com",
    projectId: "golf-30c34",
    storageBucket: "golf-30c34.appspot.com",
    messagingSenderId: "1016496562075",
    appId: "1:1016496562075:web:40f9211f6ef1f1d2b44b3e"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

//=======================================
//Firebase setup
//=======================================

// get the game's unique key from the EJS variable
let gameKey = document.querySelector('#data').dataset.gamekey;
// console.log(gameKey);

// create a firebase node with the game's unique key
let gameListRef = firebase.database().ref(`gameList_${gameKey}`);
gameListRef.push();

let DeckReference = firebase.database().ref(`gameKey_${gameKey}`);
let deckRef = DeckReference.child('deckoCards');
let playersRef = DeckReference.child('players');
// let count1Ref = DeckReference.child('count1');
// let count2Ref = DeckReference.child('count2');
// let crib1Ref = DeckReference.child('crib1');
// let crib2Ref = DeckReference.child('crib2');
// let starterRef = DeckReference.child('starter');
// let scoreboardRef = DeckReference.child('scoreboard');
// let autoCribRef = DeckReference.child('autoCrib'); 
// let roundRef = DeckReference.child('counter');
// let coinFlipRef = DeckReference.child('coinFlip');
// let resetRef = DeckReference.child('reset');

//set the player hands to empty on page load
// player1Ref.set({player1Cards:[]});
// player2Ref.set({player2Cards:[]});
// count1Ref.set({count:[]});
// count2Ref.set({count:[]});
// crib1Ref.set({crib:[]});
// crib2Ref.set({crib:[]});
// starterRef.set({starter:[]})
// scoreboardRef.set({score1: 0, score2: 0});
// autoCribRef.set({fbAutoCrib1: 0, fbAutoCrib2: 0});
// Ref.set(0);
// resetRef.set(false);
// coinFlipRef.set({ player1: '', player2: '' });

// remove the game's firebase node when the players leave the page
window.addEventListener('beforeunload', (event) => {
  DeckReference.set({});
})

// elements hidden on page load
$('#restart').hide();
$('#pass').hide();
$('#deck').hide();
$('#byRound').hide();
$('#instruction').hide();


var playersFinished = 0;
var inCaseCards = [];
var remainingCards; 
var topCard;
var holes = [1, 2];
var currentHole = 1;
var startWith;
var d;

(function ($) {
  $.fn.replaceClass = function (pFromClass, pToClass) {
      return this.removeClass(pFromClass).addClass(pToClass);
  };
}(jQuery));


//========================================
//create card class and deck
//========================================
// determine if player 1 or 2
// coinFlipRef.once('value', (snap) => {
//   let val = snap.val();
//   console.log(val);
//   if(!val) {
//     val = {player1: "Player 1", player2: ""};
//     console.log(val);
//     $hand1Curtain.hide();
//     player2El.classList.add('hide', 'noClick');
//     coinFlipRef.set(val);
//     $showButton2.addClass('hide noClick');
//     showModal(val.player1);
//   } else if(val.player1 === "Player 1") {
//     val.player2 = 'Player 2';
//     console.log(val);
//     $hand2Curtain.hide();
//     player1El.classList.add('hide', 'noClick');
//     coinFlipRef.set(val);
//     $showButton1.addClass('hide noClick');
//     showModal(val.player2);
//   }
// })

function showModal(player) {
  console.log('triggered');
  let modal = `
   <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Welcome!/h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <h3>You are ${player.playerName}!</h3>
          <p class="modal-description">Welcome to online cribbage! Here's some important info before you get started.</p>
          <ul>
          <li>The game will reset if you or the other player reloads or refreshes the page.</li>
          <li>As ${player.playerName}, you will not see the other player's cards until they are played.</li>
          <li>The link to this game will be valid for 24 hours after it was created.</li>
          <li>The first two cards you click in your hand will go to the crib, the rest will go to the play.</li>
          <li>If you need to look up the rules, <a href="https://bicyclecards.com/how-to-play/cribbage/" target="_blank" rel="noopener">click here</a>.</li>
          <p>That's it, have fun!</p>
        </div>
      </div>
    </div>
  </div>
  `;
  // document.querySelector('#controls-wrapper').appendChild(modal);
  $(modal).modal('show');
}



class Card {
  constructor(suit, rank, value){
    this.suit = suit;
    this.rank = rank;
    this.value = value;
    this.hidden = false;

  }
}

//create deck out of Card class
class Deck {
  constructor() {
    this.deck = [];
    deckRef.set(this.deck)
  }

  createDeck(suits, ranks, values) {
    for (let i = 0; i < suits.length; i++) {
        for (let j = 0; j < ranks.length; j++) {
            this.deck.push({
              suit: suits[i],
              rank: ranks[j],
              value: values[j],
              hidden: false,
          });
        }
    }

    this.deck.push(
      {suit: "Joker",
      rank: "Joker",
      value: -3,
      hidden: false,
    }
    );

    this.deck.push(
      {suit: "Joker",
      rank: "Joker",
      value: -3,
      hidden: false,
    }
    );
    deckRef.set(this.deck);
    return this.deck;
  }

  shuffle() {
    let counter = this.deck.length, temp, i;

    while(counter) {
      i = Math.floor(Math.random() * counter--);
      temp = this.deck[counter];
      this.deck[counter] = this.deck[i];
      this.deck[i] = temp;
    }
    deckRef.set(this.deck);
    return this.deck;
  }

  // deal(cards) {
  //   let hand = [];
  //   while(hand.length < cards) {
  //     hand.push(this.deck.pop());
  //   }
  //   deckRef.set(this.deck);
  //   return hand;
  // }

  deal(cards, players) {

      console.log(players);

    // d = new Deck();
    // let deck = d.createDeck();
    // console.log(deck);
    // // addDeckDatabase(deck);
    // d.shuffleDeck();
    // startNewGame();
    // startNewRound();
    console.log('This is at the end');
    console.log(gameBoard.players);

    playersFinished = 0; 

    gameBoard.players.forEach(function(player) {
      player.playerFinished = false;
      player.playerLastTurn = false;
      player.playerTurn = false;
    });

    players[0].playerCards = this.deck.slice(0, 6);
    remainingCards = this.deck.slice(6, 54);
    players[1].playerCards = remainingCards.slice(0, 6);
    remainingCards = remainingCards.slice(6, 48);
    players[2].playerCards = remainingCards.slice(0, 6);
    remainingCards = remainingCards.slice(6, 42);
    players[3].playerCards = remainingCards.slice(0, 6);
    remainingCards = remainingCards.slice(6, 36);
        
    deckRef.set(remainingCards);

    discardPile(remainingCards);
    $('#instruction').html('Flip 2 of your cards!');   

    for(var i = 0; i < players.length; i++)
    {

      for(var j = 0; j < cards[i].playerCards.length; j++)
      {
        cards[i].playerCards[j].hidden = true;

        var card = document.createElement("div");
        var value = document.createElement("div");
        var suit = document.createElement("div");

        card.className = "card";
        card.classList.add(players[i].playerName);
        card.classList.add("back");
        card.id = j;
        value.innerHTML = cards[i].playerCards[j].rank;
        value.className = "value";
        value.classList.add("hidden");        
        var icon = determineSuit(cards[i].playerCards[j]);
        suit.innerHTML = icon;
        suit.className = "suit " + cards[i].playerCards[j].suit;
        suit.classList.add("hidden");
        card.appendChild(value);
        card.appendChild(suit);
        card.addEventListener('click', function() {
        selectCard(this, topCard, value.innerHTML, this.suit)
        });

        
        document.getElementById(players[i].playerName).appendChild(card);
        
      }

    }

    playersRef.set(players);

    }
    }

function determineSuit(card){

  var icon = '';
  if (card.suit == 'hearts')
  icon='&hearts;';
  else if (card.suit == 'spades')
  icon = '&spades;';
  else if (card.suit == 'diamonds')
  icon = '&diams;';
  else if (card.suit == 'clubs')
  icon = '&clubs;';
  else 
  icon = '&#9813;';

  return icon;

}

function discardPile(cards) {
  
  topCard = cards[0]; 

  var card = document.createElement("div");
  var value = document.createElement("div");
  var suit = document.createElement("div");
  card.addEventListener('click', function() {
    selectdiscardCard(this)
  });
  card.className = "discardCard";
  value.className = "discardValue";
  
  var icon = determineSuit(topCard);
  suit.innerHTML = icon;
  suit.className = topCard.suit + " discardSuit" ;

  value.innerHTML = topCard.rank;
  card.appendChild(value);
  card.appendChild(suit);

  topCard = card;

  document.getElementById('discardPile').prepend(card);

}




//hold the suits and ranks
let suits = ['hearts', 'diamonds', 'spades', 'clubs'];
let ranks = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
let values = [-1, -2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 0];


class Player {
  constructor(name, id) {
      this.playerName = name;
      this.playerID;
      this.playerCards = [];
      this.playerTurn = false;
      this.playerFinished = false;
      this.playerScore = [];
      this.playerTotal = 0;
      this.playerLastTurn = false;
  }
}


class Board {
  constructor() {
      this.players = [];
  }
  start(playerOneName, playerTwoName, playerThreeName, playerFourName) {
      this.players.push(new Player(playerOneName));
      this.players[0].playerID = 0;
      this.players.push(new Player(playerTwoName));
      this.players[1].playerID = 1;
      this.players.push(new Player(playerThreeName));
      this.players[2].playerID = 2;
      this.players.push(new Player(playerFourName));
      this.players[3].playerID = 3;

  for(var i = 0; i < this.players.length; i++)
  {
    var player = document.createElement('div');
    player.className = 'player';
    player.id = this.players[i].playerName;
    document.body.appendChild(player);
    var name = document.createElement('div');
    name.innerHTML = this.players[i].playerName;
    name.className = 'name';
    player.prepend(name);

  }
    playersRef.set(this.players);
  }
}


function selectCard(card, card2, value, suit) {


if (card2.classList.contains('selected')) {


  gameBoard.players.forEach(function(player) {

  if ((card.classList.contains(player.playerName)) && player.playerTurn == true) {


    var answer = confirm('Do you want to switch?');
      if (answer) {

        var ct = 0;

        $(card2).removeClass('selected');

        $('#pass').hide();

        cardDeck.clicked = false;
      

        var hold = player.playerCards[card.id];
        var hold2 = remainingCards[0];

        console.log(hold);
        console.log(hold2);
        
        player.playerCards[card.id] = hold2;
        remainingCards[0] = hold;

        $(card).children('.value').html(hold2.rank);
        $(card).children('.suit').replaceClass(hold.suit,hold2.suit);
        $(card).children('.value').removeClass('hidden');
        $(card).children('.suit').removeClass('hidden');
        $(card).removeClass('back');
        var icon = determineSuit(hold2)
        $(card).children('.suit').html(icon);

        $(card2).children('.discardValue').html(hold.rank);
        $(card2).children('.discardSuit').replaceClass(hold2.suit,hold.suit);
        var icon = determineSuit(hold);
        $(card2).children('.discardSuit').html(icon);

        
        player.playerCards[card.id].hidden = false;

        player.playerTurn = false;

        playersRef.set(gameBoard.players);
        deckRef.set(remainingCards);

        if (player.playerID < 3) {
          gameBoard.players[player.playerID + 1].playerTurn = true;
        } else {
           gameBoard.players[0].playerTurn = true;
        }

        if (player.playerLastTurn) {

          player.playerFinished = true;
          var get = document.getElementById(player.playerName);
          $(get).children().removeClass("back");
          $(get).children().children().removeClass("hidden");
          findScore(player, player.playerCards);
          playersFinished++;
          playersRef.set(gameBoard.players);
        }

        updateInstructions();

        player.playerCards.forEach(function(card) {
          if (card.hidden === true) {
            ct++;
          } 
          playersRef.set(gameBoard.players);
        })

        if (ct === 0) {
          player.playerFinished = true;
          playersFinished++;
          checkForFinished();
          findScore(player, player.playerCards)
          playersRef.set(gameBoard.players);
        }

      }

    }

   });


} else if (card.classList.contains('back')) {

  var count = 0;


  gameBoard.players.forEach(function(player) {
    if ((card.classList.contains(player.playerName))) {
    
      player.playerCards.forEach(function(card) {
        if (card.hidden) {
          count++;
        }
      });


    }

    if (count >= 5) {
    player.playerCards[card.id].hidden = false;
    $(card).removeClass('back');
    $(card).children('.value').removeClass('hidden');
    $(card).children('.suit').removeClass('hidden');
    count = 0;




    var ct = 0;

    gameBoard.players.forEach(function(player) {
      player.playerCards.forEach(function(card) {
        if (card.hidden) {
          ct++;
        }
      });
    });


    if (ct === 16) {
      if (startWith === undefined || startWith === 3) {
        gameBoard.players[0].playerTurn = true;
        startWith = 0;
      } else if (startWith < 3) {
        startWith++;
        gameBoard.players[startWith].playerTurn = true;
      }
    }
    
    playersRef.set(gameBoard.players);

    updateInstructions();



  } else {
  }

  });



  }
}

function scoreBoard () {



  $('#columns>th').remove();
  $('#rows>td').remove();
  $('#holes>tr').remove();
  $('#players>.p').remove();

  console.log(this.players);

  gameBoard.players.forEach(function(player) {
  $('#columns').append(`<th>` + player.playerName + `</th>`)
  $('#players').append(`<th class="p">` + player.playerName + `</th>`)
  $('#rows').append(
      `<td>` + player.playerTotal + `</td>`)
  });

  holes.forEach(function(hole) {
    $('#holes').append(`<tr id="` + hole + `"><th scope="row">` + hole + `</th></tr>`)
    gameBoard.players.forEach(function(player) {
      var z = document.createElement('td')
      if (player.playerScore[hole-1] === undefined) {
        z.innerHTML = '-'
      } else {
      z.innerHTML = player.playerScore[hole-1];
      }
      document.getElementById(hole).appendChild(z);
    });
  });



}


function findScore(player, cards) {
    var score = 0
    var column1 = 0;
    var column2 = 0;
    var column3 = 0;


    function columns (column, a, b) {
      var columnScore;

      if (a.rank === b.rank) {
        columnScore = 0
      } else {
        columnScore = a.value + b.value
      }
      return columnScore
    }

     column1 = columns(column1, cards[0], cards[3])
     column2 = columns(column2, cards[1], cards[4])
     column3 = columns(column3, cards[2], cards[5])

    cards.forEach(function(card) {
      score = column1+column2+column3;
      return score
    })

    player.playerScore.push(score);
    player.playerTotal = player.playerScore.reduce(function(a, b) {
        return a + b;
      });

}


function checkForFinished() {


gameBoard.players.forEach(function(player) {

  if (player.playerFinished) {
  } else {
    player.playerLastTurn = true;
  }
});

}




function selectdiscardCard(card) {

    var count = 0;

    gameBoard.players.forEach(function(player) {
      player.playerCards.forEach(function(card) {
        if (card.hidden) {
          count++;
        }
      });
    });

    if (card.classList.contains('selected') && count <=16) {
      $(card).removeClass('selected');
      } else if (count <=16){
      $(card).addClass('selected'); 
      }
    }


    function shuffle(a) {
      var j, x, i;
      for (i = a.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = a[i];
          a[i] = a[j];
          a[j] = x;
      }
      return a;
}


function updateInstructions () {

    var count = 0;
    var p;


    gameBoard.players.forEach(function(player) {
      if (player.playerTurn) {
        p = player.playerName;
      }

      player.playerCards.forEach(function(card) {
        if (card.hidden) {
          count++;
        }
      });
    });

    if (playersFinished === 4 && currentHole === 2) {
      $('#deck').hide();
      $('#new').show(); 
      var best = Math.min(gameBoard.players[0].playerTotal, gameBoard.players[1].playerTotal, gameBoard.players[2].playerTotal, gameBoard.players[3].playerTotal);
      gameBoard.players.forEach(function(player) { 
        if (player.playerTotal === best) {
          $('#instruction').html('Game Over!!! </br>' + player.playerName + ' is the winner!');
        }
      });
        scoreBoard();
      } else if (playersFinished === 4) {
        $('#deck').hide();
      $('#restart').show();
      playersFinished = 0;
      // var b =(currentHole-1)
      $('#instruction').html(`Hole: ` + currentHole + `</br>Complete`)
      currentHole++;
      scoreBoard();
    } else if (count <=16){
      $('#instruction').html('Hole: ' + currentHole + `</br>It's ` + p +`'s turn`)
    } else {
      $('#instruction').html('Flip 2 of your cards!')
    }


}



$('#deck').click(function() {

    if (remainingCards.length === 1) {
      var deck = remainingCards.concat(inCaseCards);
      remainingCards = deck;
      shuffle(remainingCards);
      deckRef.set(remainingCards);

    }

    gameBoard.players.forEach(function(player) {
      if (player.playerTurn && cardDeck.clicked === false) {
        cardDeck.clicked = true;
        $('.discardCard').remove();
        inCaseCards.push(remainingCards[0]);
        remainingCards.shift();
        discardPile(remainingCards);
        $('#pass').show();
        deckRef.set(remainingCards);
      } else {
      }

    });

    });

    $('#pass').click(function() {

    $('#pass').hide();
    cardDeck.clicked = false;

    var p;

    gameBoard.players.forEach(function(player) {
      if (player.playerTurn) {
        p = player;
      }
    });

    if (p.playerLastTurn) {

      p.playerFinished = true;
      var get = document.getElementById(p.playerName);
      $(get).children().removeClass("back");
      $(get).children().children().removeClass("hidden");
      findScore(p, p.playerCards);
      playersFinished++;
      playersRef.set(gameBoard.players);
    }

    p.playerTurn = false;

    if (p.playerID < 3) {
      gameBoard.players[p.playerID + 1].playerTurn = true;
      playersRef.set(gameBoard.players);
    } else {
       gameBoard.players[0].playerTurn = true;
       playersRef.set(gameBoard.players);
    }

    updateInstructions(); 
    });


    $('#restart').click(function() {
    $('#deck').show();
    $('#restart').hide();  
    $('div.card').remove();
    $('div.discardCard').remove();
    cardDeck.shuffle();
    cardDeck.deal(gameBoard.players, gameBoard.players);

});





$('#new').click(function() {
  $('#pass').hide();
  $('.logo').hide();
  $('#deck').show();
  $('#byRound').show();
  $('#new').hide();  
  $('div.card').remove();
  $('div.discardCard').remove();
  $('#instruction').show();
  cardDeck.shuffle();
  gameBoard.start( 'Mario', 'Luigi', 'Pikachu', 'Yoshi');
  cardDeck.deal(gameBoard.players, gameBoard.players)
  gameBoard.players.forEach(function(player) {
    player.playerTotal = 0;
    player.playerScore = [];
  });
  console.log(gameBoard.players);
  playersRef.set(gameBoard.players);   
  scoreBoard();
  currentHole = 1;
  });



//create new deck and shuffle it
let cardDeck = new Deck();
cardDeck.createDeck(suits, ranks, values);
// cardDeck.shuffle();


let gameBoard = new Board();
// gameBoard.players.push['Mario'];
// console.log(gameBoard.players);
// playersRef.set(gameBoard.players);   
// gameBoard.start( 'Mario', 'Luigi', 'Pikachu', 'Yoshi');
// showModal(gameBoard.players[0]);

//make player hands
// let player1Hand = [];
// let player2Hand = [];
// let turn = true;
// let autoCrib1 = 0;
// let autoCrib2 = 0;

// //get player hands html elements
// let player1El = document.querySelector('.player1');
// let player2El = document.querySelector('.player2');

// let $player1El = $('.player1');
// let $player2El = $('.player2');

// // Curtain elements
// let $hand1Curtain = $('.hand1-curtain');
// let $hand2Curtain = $('.hand2-curtain');

// //get player crib elements
// let player1CribEl = document.querySelector('.crib1');
// let player2CribEl = document.querySelector('.crib2');

// let $player1Crib = $('.crib1');
// let $player2Crib = $('.crib2');

// let starterEl = document.querySelector('.starter');
// let player1PotEl = document.querySelector('.player1-pot');
// let player2PotEl = document.querySelector('.player2-pot');

// // Score Elements
// let player1ScoreEl = document.querySelector('#score1-counter');
// let player2ScoreEl = document.querySelector('#score2-counter');

// //get button elements
// let dealButton = document.querySelector('#dealEl');
// let resetButton = document.querySelector('#resetEl');

// // get count element
// let countEl = document.querySelector('.count');

// let $showButton1 = $('.show-hand-1');
// let $showButton2 = $('.show-hand-2');
// let $cribButton1 = $('.show-crib-1');
// let $cribButton2 = $('.show-crib-2');

// $showButton1.click(()=>{
//   // $player1El.toggleClass('hide');
//   $hand1Curtain.slideToggle();
// });

// $showButton2.click(()=>{
//   // $player2El.toggleClass('hide');
//   $hand2Curtain.slideToggle();
// });

// $cribButton1.click(()=>{
//   // $player1Crib.toggleClass('hide');
//   $('.crib1-curtain').slideToggle();
// });

// $cribButton2.click(()=>{
//   // $player2Crib.toggleClass('hide')
//   $('.crib2-curtain').slideToggle();
// });

// // determine if player 1 or 2
// coinFlipRef.once('value', (snap) => {
//   let val = snap.val();
//   console.log(val);
//   if(!val) {
//     val = {player1: "Player 1", player2: ""};
//     console.log(val);
//     $hand1Curtain.hide();
//     player2El.classList.add('hide', 'noClick');
//     coinFlipRef.set(val);
//     $showButton2.addClass('hide noClick');
//     showModal(val.player1);
//   } else if(val.player1 === "Player 1") {
//     val.player2 = 'Player 2';
//     console.log(val);
//     $hand2Curtain.hide();
//     player1El.classList.add('hide', 'noClick');
//     coinFlipRef.set(val);
//     $showButton1.addClass('hide noClick');
//     showModal(val.player2);
//   }
// })

// function showModal(playerNum) {
//   let modal = document.createElement('div');
//   modal.classList.add('modal');
//   modal.innerHTML = `
//   <div class="modal-content">
//     <h3>You are ${playerNum}!</h3>
//     <p class="modal-description">Welcome to online cribbage! Here's some important info before you get started.</p>
//     <ul>
//     <li>The game will reset if you or the other player reloads or refreshes the page.</li>
//     <li>As ${playerNum}, you will not see the other player's cards until they are played.</li>
//     <li>The link to this game will be valid for 24 hours after it was created.</li>
//     <li>The first two cards you click in your hand will go to the crib, the rest will go to the play.</li>
//     <li>If you need to look up the rules, <a href="https://bicyclecards.com/how-to-play/cribbage/" target="_blank" rel="noopener">click here</a>.</li>
//     <p>That's it, have fun!</p>
//     <span class="modal-close" onclick="closeModal()">x</span>
//   </div>
//   `;
//   document.querySelector('#controls-wrapper').appendChild(modal);
// }

// function closeModal() {
//   document.querySelector('.modal').classList.add('hide-modal');
// }

// // update firebase score reference when click scorboard element
// player1ScoreEl.addEventListener('input', (e) => {

//   scoreboardRef.once('rank', (snap) => {
//     let fbScore = snap.val();
//     // console.log(fbScore);
//     let score = player1ScoreEl.rank;
//     fbScore.score1 = score;
//     scoreboardRef.set(fbScore);
//     score = fbScore.score1;
//   })
// })

// player2ScoreEl.addEventListener('input', (e) => {

//   scoreboardRef.once('rank', (snap) => {
//     let fbScore = snap.val();
//     // console.log(fbScore);
//     let score = player2ScoreEl.rank;
//     fbScore.score2 = score;
//     scoreboardRef.set(fbScore);
//     score = fbScore.score2;
//   })
// })

// scoreboardRef.on('value', (snap) => {
//   player1ScoreEl.rank = snap.val().score1;
//   player2ScoreEl.rank = snap.val().score2;
// })

// //===================================
// // Reset all ranks except scoreboard
// // on reset button click
// //===================================
// resetButton.addEventListener('click', (e) => {
//   e.preventDefault();

//   resetRef.once('value', (snap)=>{
//     let val = snap.val();
//     val = !val;
//     resetRef.set(val);
//   })
// })

// resetRef.on('value', (snap)=> {
//   //set the player hands to empty on page load
//   player1Ref.set({player1Cards:[]});
//   player2Ref.set({player2Cards:[]});
//   count1Ref.set({count:[]});
//   count2Ref.set({count:[]});
//   crib1Ref.set({crib:[]});
//   crib2Ref.set({crib:[]});
//   starterRef.set({starter:[]});
//   roundRef.set(0);
//   autoCribRef.set({fbAutoCrib1: 0, fbAutoCrib2: 0});

//   // create a new deck and shuffle it
//   cardDeck = new Deck();
//   cardDeck.createDeck(suits, ranks, values);
//   cardDeck.shuffle();

//   // reset the player hand arrays and the turn boolean
//   // player1Hand = [];
//   player2Hand = [];
//   turn = true;
//   autoCrib1 = 0;
//   autoCrib2 = 0;

//   //reset the pot elements on click (in case there's a glitch)
//   player1PotEl.innerHTML = '';
//   player2PotEl.innerHTML = '';
//   console.log('reset');
// });

// //============================================
// //call deal function when click on deal button
// //============================================
// dealButton.addEventListener('click', deal);

// function deal(){
//   deckRef.once('value', (snap)=>{
//     let fbDeck = snap.val();
//     // let val = document.querySelector('input[name=master-controls]:checked').rank;
//     // if(val === 'deal'){
//       for(let i=0; i<12; i++){
//         let fbCard = fbDeck.shift();
//         if(turn){
//           player1Ref.push().set(fbCard);
//           turn = false;
//         } else {
//           player2Ref.push().set(fbCard);
//           turn = true;
//         }
//       // }
//     } 
//     // if(val === 'starter') {
//       console.log('starter');
//       starterRef.push().set(fbDeck.shift());
//     // }
//     deckRef.set(fbDeck);
//   });
// };

// //listen for change in rank of player 1 hand
// //then creates an html element with that suit and rank
// player1Ref.on('value', (snap)=>{
//   let hand = snap.val();
//   //reset the players hand element
//   player1El.innerHTML='';
//   // console.log('render Player 1 hand');
//   getFBHand(player1El, hand);
// });

// //listen for change in rank of player 2 hand
// //then creates an html element with that suit and rank
// player2Ref.on('value', (snap)=>{
//   let hand = snap.val();
//   //reset player hand element
//   player2El.innerHTML='';
//   // console.log('render Player 2 hand');
//   getFBHand(player2El, hand);
// })

// starterRef.on('value', (snap)=>{
//   let hand = snap.val();
//   starterEl.innerHTML = '';
//   getFBHand(starterEl, hand);
// })

// crib1Ref.on('value', (snap)=>{
//   let hand = snap.val();
//   player1CribEl.innerHTML = '';
//   getFBHand(player1CribEl, hand);
// })

// crib2Ref.on('value', (snap)=>{
//   let hand = snap.val();
//   player2CribEl.innerHTML = '';
//   getFBHand(player2CribEl, hand);
// })

// count1Ref.on('value', (snap)=>{
//   let hand = snap.val();
//   // let val = document.querySelector('input[name="cribPotRadio"]:checked').rank;
//   autoCribRef.once('value', (snap) => {
//     let val = snap.val();
//     if(val.fbAutoCrib1 === 2) {
//       console.log('render POT1');
//       player1PotEl.innerHTML = '';
//       getFBHand(player1PotEl, hand);
//     } else if(val.fbAutoCrib1 < 2) {
//       // console.log('render CRIB1');
//       player1CribEl.innerHTML = '';
//       getFBHand(player1CribEl, hand)
//     }
//   })
// })

// count2Ref.on('value', (snap)=>{
//   let hand = snap.val();
//   // let val = document.querySelector('input[name="cribPotRadio"]:checked').rank;
//   autoCribRef.once('value', (snap) => {
//     let val = snap.val();

//     if(val.fbAutoCrib2 === 2) {
//       console.log('render POT2')
//       player2PotEl.innerHTML = '';
//       getFBHand(player2PotEl, hand);
//     } else if(val.fbAutoCrib2 < 2) {
//       // console.log('render CRIB2')
//       player2CribEl.innerHTML = '';
//       getFBHand(player2CribEl, hand)
//     }
//   })
// })

// roundRef.on('value', (snap) => {
//   let count = snap.val();
//   countEl.innerHTML = count;
// })

// //this runs every time there is a change in a player's hand in the database
// //for each key in hand, create HTML element and append to hand element
// function getFBHand(handEl, hand){
//   for(key in hand){
//     // console.log(key);
//     let suit = hand[key].suit;
//     let rank = hand[key].rank;
//     let cardEl = document.createElement('div');
//     cardEl.classList.add('card');
//     cardEl.classList.add(suit);
//     cardEl.innerHTML =
//       `<span class="${rank} rank">${rank}</span><br>
//        <!-- <span>${suit}</span>-->`;
//     handEl.appendChild(cardEl);
//   }
// }

// player1El.addEventListener('click', (e)=>{
//   //get nearest card element to the target
//   let card = e.target.closest('div.card');
//   let newHand = {};
//   // console.log(card);
//   //get the suit and card rank for the card that was clicked
//   let suit = card.classList[1];
//   let rank = card.querySelector('span').innerHTML;
//   // console.log(suit, rank);

//   card.remove()
//   //get a snapshot of the player's hand search it for the
//   //corresponding card that was clicked
//   player1Ref.once('value', (snap)=>{
//     let hand = snap.val();
//     // console.log('player 1 hand: ', hand);
//     // console.log(hand);
//     //iterate through the cards in the hand and find the one that was clicked
//     autoCribRef.once('value', (snap) => {
//       let val = snap.val();
      
//       for (key in hand) {
//         // grab the suit and rank of the key being checked
//         let fbSuit = hand[key]['suit'];
//         let fbRank = hand[key]['rank'];
//         let fbValue = hand[key]['value'];
  
//         //check if the fb card matches the card clicked
//         if (fbSuit === suit && fbRank.toString() === rank) {
//           // console.log('correct card');
//           // if there are less than 2 cards in player's crib already
//           if (val.fbAutoCrib1 < 2) {
//             // send card to crib
//             crib1Ref.push().set(hand[key]);
//             val.fbAutoCrib1++;
//             autoCribRef.child('fbAutoCrib1').set(val.fbAutoCrib1)
//             // console.log('fbAutoCrib1: ' + val.fbAutoCrib1);
//           } else {
//             // send card to player's pot
//             count1Ref.push().set(hand[key]);
//             // console.log('wrong card');
//             // update the count on both screens
//             updateCount(rank);
//           }
//         } else {
//           // if card does not match clicked card, add it to new hand
//           newHand[key] = hand[key];
//           // console.log('wrong card added to new hand');
//         }
//       }
//       player1Ref.set(newHand);
//       // console.log('player 1 set new FB hand');
//     })
//   })
//   // set the new firebase hand, sans card that was clicked
// })

// // Same for player 2 element
// player2El.addEventListener('click', (e)=>{

//   //get nearest card element to the target
//   let card = e.target.closest('div.card');
//   let newHand = {};
//   // console.log(card);
//   //get the suit and card rank for the card that was clicked
//   let suit = card.classList[1];
//   let rank = card.querySelector('span').innerHTML;
//   // console.log(typeof rank);

//   card.remove()
//   //get a snapshot of the player's hand search it for the
//   //corresponding card that was clicked
//   player2Ref.once('value', (snap)=>{
//     let hand = snap.val();
    
//     autoCribRef.once('value', (snap) => {
//       let val = snap.val();
      
//       for (key in hand) {
//         // grab the suit and rank of the key being checked
//         let fbSuit = hand[key]['suit'];
//         let fbRank = hand[key]['rank'];
//         let fbValue = hand[key]['value'];
//         //check if the fb card matches the card clicked
//         if (fbSuit === suit && fbRank.toString() === rank) {
//           // executes if the crib radio is selected
//           if(val.fbAutoCrib2 < 2) {
//             crib2Ref.push().set(hand[key]);
//             val.fbAutoCrib2++;
//             autoCribRef.child('fbAutoCrib2').set(val.fbAutoCrib2);
//             // console.log('fbAutoCrib2: ' + val.fbAutoCrib2);
//           } else {
//             count2Ref.push().set(hand[key]);
//             updateCount(rank);
//           }
//         } else {
//           // console.log('wrong card');
//           newHand[key] = hand[key];
//         } 
//       }
//       player2Ref.set(newHand);
//     })
//     // console.log(hand);
//     //iterate through the cards in the hand and find the one that was clicked
    
//   })
//   // set the new firebase hand

// })


// function updateCount(cardVal) {
//   let currentCount = parseInt(countEl.innerHTML);
//   let parsedVal = 0;
//   // console.log('current count: ' + currentCount);
//   // if (document.querySelector('input[name="cribPotRadio"]:checked').rank === 'pot') {
//     if(cardVal == 'J' || cardVal == 'Q' || cardVal == 'K') {
//       parsedVal += 10;
//       currentCount += 10;
//     } else if (cardVal == 'A') {
//       parsedVal += 1;
//       currentCount += 1;
//     } else {
//       parsedVal += parseInt(cardVal);
//       currentCount += parseInt(cardVal);
//     }
//   // }

//   (currentCount > 31) ? counterRef.set(parsedVal) : counterRef.set(currentCount);
// }

// // tell user the game works better in landscape mode
// function detectLandscape() {
//   if (window.innerWidth < window.innerHeight) {
//     alert('This game works best with your phone in landscape mode!');
//   }
// }

// detectLandscape();

/*
lucky semicolon, don't touch
;
*/