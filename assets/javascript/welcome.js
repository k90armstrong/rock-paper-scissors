// Initialize Firebase
var config = {
    apiKey: "AIzaSyDeuSJtzv4mI0Zxlh1vshnlWEMrNhUyoA8",
    authDomain: "rock-paper-scissors-79c80.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-79c80.firebaseio.com",
    projectId: "rock-paper-scissors-79c80",
    storageBucket: "",
    messagingSenderId: "43743713745"
};
firebase.initializeApp(config);
var db = firebase.database();

// classes
class User {
    constructor(dbUser, userId) {
        this.name = dbUser.name;
        this.id = dbUser.id;
        this.inGame = dbUser.inGame;
        this.request = dbUser.request;
        this.wins = dbUser.wins;
        this.losses = dbUser.losses;
        this.online = dbUser.online;
        this.userId = userId;
        this.gameId = dbUser.gameId;
    }
    addDbRef() {
        if (this.id) {
            this.dbRef = db.ref('/availableUsers/' + this.id);
        }
    }
    addListener() {
        this.dbRef.on('value', (snapshot) => {
            this.userInfoChanged(snapshot);
        });
    }
    userInfoChanged(snapshot) {
        var dbUser = snapshot.val();
        this.name = dbUser.name;
        this.inGame = dbUser.inGame;
        this.request = dbUser.request;
        this.wins = dbUser.wins;
        this.losses = dbUser.losses;
        this.online = dbUser.online;
        this.invitation = dbUser.invitation;
        this.gameId = dbUser.gameId;
        console.log(dbUser);
        if (dbUser.online === false) {
            this.changeToOffline();
        }
        if (dbUser.inGame) {
            this.changeToInGame();
        }
        if (dbUser.online && !dbUser.inGame) {
            this.changeToAvailable();
        }
        if (this.request !== false) {
            // someone wants to play
            if (this.id === this.userId) {
                console.log('someone wants to play you');
                window.openInvitaionModal(this.request);
            } else {
                // if this is not the user then just change to in game
                this.changeToInGame();
            }
        }
        if (this.invitation === 'accepted') {
            // open the game
            window.closeWaitModal();
            window.openGame();
            this.dbRef.update({
                invitation: 'waiting'
            });
        } else if (this.invitation === 'denied') {
            // close the modal
            window.closeWaitModal();
            this.dbRef.update({
                invitation: 'waiting'
            });
        } else if (this.invitation === 'revoked') {
            window.closeInvitationModal();
            this.dbRef.update({
                invitation: 'waiting'
            });
        } else if (this.invitation === 'quit') {
            window.closeGame();
            this.dbRef.update({
                invitation: 'waiting'
            });
        }
        if (this.gameId) {
            db.ref('/games/' + this.gameId).on('value', (sapshot) => {
                this.gameChangeHandler(snapshot);
            })
        }
    }
    gameChangeHandler(snapshot) {
        console.log(snapshot);
    }
    changeToAvailable() {
        $('#tr' + this.id).find('.offline').addClass('display-none');
        $('#tr' + this.id).find('.inGame').addClass('display-none');
        $('#tr' + this.id).find('.play-button').removeClass('display-none');
    }
    changeToOffline() {
        $('#tr' + this.id).find('.offline').removeClass('display-none');
        $('#tr' + this.id).find('.inGame').addClass('display-none');
        $('#tr' + this.id).find('.play-button').addClass('display-none');
    }
    changeToInGame() {
        $('#tr' + this.id).find('.offline').addClass('display-none');
        $('#tr' + this.id).find('.inGame').removeClass('display-none');
        $('#tr' + this.id).find('.play-button').addClass('display-none');
    }
}

$(document).ready(function () {
    console.log('hello world');

    // gloal variables
    var users = [];
    var oponent;
    var userId = localStorage.getItem('id');
    var availableUsers = db.ref('/availableUsers');
    var gamesRef = db.ref('/games');
    var gameId;

    // checking if there is a name stored in local storage
    var userName = localStorage.getItem('name');
    if (userName) {
        $('.name-input').val(userName);
    }

    var user = new User({
        name: userName,
        id: userId,
        inGame: false,
        request: false,
        wins: 0,
        losses: 0,
        online: true,
        gameId: null
    }, null);
    var userRef = db.ref('/availableUsers/' + user.id);

    // functions
    function getUserById(id) {
        for (var i = 0; i < users.length; i++) {
            if (users[i].id === id) {
                return users[i];
            }
        }
        return null;
    }

    function submittButtonHandler(e) {
        e.preventDefault();
        userName = $('.name-input').val();
        user.name = userName;
        // check if they have played before
        if (!userId || userName != localStorage.getItem('name')) {
            // add user to firebase
            var fireUserRef = availableUsers.push({
                name: user.name,
                inGame: false,
                request: false,
                wins: 0,
                losses: 0,
                invitation: 'waiting',
                online: true,
                gameId: null
            });
            user.id = fireUserRef.key;
            // set the id for local storage
            localStorage.setItem('id', user.id);
            user.addDbRef();
        } else {
            // set in game to false and request to false
            user.addDbRef();
            user.addListener();
            user.userId = user.id;
            user.dbRef.update({
                inGame: false,
                request: false,
                invitation: 'waiting',
                online: true
            });
        }
        localStorage.setItem('name', userName); // add name to localstorage        
        availableUsers.on('child_added', availableUsersHandler);
        var $fadeElement = $('.modal-content');
        fadeOut($fadeElement, function () {
            $fadeElement.find('.start-form').addClass('display-none');
            $('.start-message').removeClass('display-none');
            fadeIn($fadeElement, function () {
                setTimeout(function () {
                    fadeOut($('.start-modal'), function () {
                        $('.start-modal').removeClass('is-active');
                        $('.game-rooms').removeClass('display-none');
                    });
                }, 2000);
            });
        });
    }


    function availableUsersHandler(snapshot) {
        console.log(snapshot);
        var dbUser = snapshot.val();
        dbUser.id = snapshot.key;
        var nUser = new User(dbUser, user.id);
        nUser.addDbRef();
        nUser.addListener();
        users.push(nUser);
        console.log(dbUser);
        if (dbUser.id !== user.id) {
            var $el = createUserElement(dbUser);
            $('tbody').append($el);
        }
    }

    window.openInvitaionModal = function (id) {
        oponent = getUserById(id);
        user.oponentId = oponent.id;
        $('.ivitation').addClass('display-none');
        $('.invitation').addClass('is-active');
        $('.oponent-span').text(oponent.name);
        fadeIn($('.invitation'));
    }

    window.closeWaitModal = function () {
        fadeOut($('.wait'), function () {
            $('.wait').removeClass('is-active');
        });
    }

    window.closeInvitationModal = function () {
        fadeOut($('.invitation'), function () {
            $('.invitation').removeClass('is-active');
        });
    }

    window.closeGame = function () {
        fadeOut($('.game-container'), function () {
            $('.game-container').addClass('display-none');
            fadeIn($('.game-rooms'));
        });
    }

    function createUserElement(dbUser) {
        var $tr = $('<tr>');
        $tr.attr('id', 'tr' + dbUser.id);
        var $td = $('<td>');
        $td.text(dbUser.name);
        $tr.append($td);

        var $td = $('<td>');
        $td.text(dbUser.wins);
        $tr.append($td);

        var $td = $('<td>');
        $td.text(dbUser.losses);
        $tr.append($td);

        var $btn = $('<button>').text('Play Me!');
        $btn.addClass('button play-button');
        $btn.attr('data-id', dbUser.id);
        $btn.addClass('display-none');
        var $td = $('<td>');
        $td.append($btn);

        var $offline = $('<p>').text('Offline');
        $offline.addClass('offline display-none');
        var $inGame = $('<p>').text('In Game');
        $inGame.addClass('inGame display-none');

        $td.append($offline);
        $td.append($inGame);
        $tr.append($td);

        if (dbUser.online === false) {
            $offline.removeClass('display-none');
        }
        if (dbUser.inGame) {
            $inGame.removeClass('display-none');
        }
        if (dbUser.online && !dbUser.inGame) {
            $btn.removeClass('display-none');
        }

        return $tr;
    }

    function playButtonHanlder(event) {
        var id = $(this).attr('data-id');
        oponent = getUserById(id);
        user.oponentId = oponent.id;
        console.log('oponent', oponent)
        // invite a user
        oponent.dbRef.update({
            request: user.id,
            inGame: true
        });
        user.dbRef.update({
            invitation: 'waiting',
            inGame: true
        });
        $('.wait').addClass('display-none');
        $('.wait').addClass('is-active');
        $('.oponent-span').text(oponent.name);
        fadeIn($('.wait'));
    }

    function okButtonClickHandler(event) {
        event.preventDefault();
        // create a new game object in db
        var gameReturn = gamesRef.push({
            player1: {
                id: user.id,
                choice: null
            },
            player2: {
                id: oponent.id,
                choice: null
            }
        });
        gameId = gameReturn.key;

        user.dbRef.update({
            request: false,
            inGame: true,
            gameId: gameId,
            choice: null
        });
        oponent.dbRef.update({
            invitation: 'accepted',
            inGame: true,
            gameId: gameId,
            choice: null
        });
        window.closeInvitationModal();

        // open the game
        window.openGame();
    }

    window.openGame = function () {
        fadeOut($('.game-rooms'), function () {
            $('.oponent-name').text(oponent.name);
            $('.game-rooms').addClass('display-none');
            fadeIn($('.game-container'));
        });

    }

    function noButtonClickHandler(event) {
        event.preventDefault();
        user.dbRef.update({
            request: false,
            inGame: false,
            choice: null
        });
        oponent.dbRef.update({
            invitation: 'denied',
            inGame: false,
            choice: null
        });
        fadeOut($('.invitation'), function () {
            $('.invitation').removeClass('is-active');
        });
    }

    function cancelButtonClickHandler(event) {
        event.preventDefault();
        oponent.dbRef.update({
            invitation: 'revoked',
            inGame: false,
            request: false,
            choice: null
        });
        user.dbRef.update({
            inGame: false,
            invitation: 'waiting',
            request: false,
            choice: null
        });
        window.closeWaitModal();
    }

    function quitButtonClickHandler(event) {
        event.preventDefault();
        user.dbRef.update({
            inGame: false,
            invitation: 'waiting',
            request: false,
            choice: null
        });
        oponent.dbRef.update({
            inGame: false,
            invitation: 'quit',
            request: false,
            choice: null
        });
        window.closeGame();
    }

    function pickButtonClickHandler(event) {
        event.preventDefault();
        var choice = $('.weapon').find(":selected").text();
        console.log(choice);
        user.dbRef.update({
            choice: choice
        });
    }

    // animation functions 
    function fadeIn($element, cb) {
        $element.css({
            opacity: '0'
        });
        $element.removeClass('display-none').animate({
            opacity: '1'
        }, 500).promise().done(function () {
            if (cb) {
                return cb()
            }
            return undefined
        });
    }

    function fadeOut($element, cb) {
        $element.css({
            opacity: '1'
        });
        $element.animate({
            opacity: '0'
        }, 500).promise().done(function () {
            if (cb) {
                return cb()
            }
            return undefined
        });
    }

    // listeners
    $('.submit-button').on('click', submittButtonHandler);
    $(document).on('click', '.play-button', playButtonHanlder);
    $('.ok-button').on('click', okButtonClickHandler);
    $('.no-button').on('click', noButtonClickHandler);
    $('.cancel-button').on('click', cancelButtonClickHandler);
    $('.quit-game-button').on('click', quitButtonClickHandler);
    $('.pick-button').on('click', pickButtonClickHandler);
});