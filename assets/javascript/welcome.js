$(document).ready(function () {
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

    // global variables
    var db = firebase.database();
    var user;
    var opponent;
    var users = [];
    var opponent;
    var userId = localStorage.getItem('id');
    var availableUsers = db.ref('/availableUsers');
    var gamesRef = db.ref('/games');
    var gameId;
    var thisGameWins = 0;
    var thisGameLosses = 0;
    var statusMessage;

    // global functions
    function openInvitaionModal(id) {
        opponent = getUserById(id);
        opponent.isOpponent = true;
        user.opponentId = opponent.id;
        $('.ivitation').addClass('display-none');
        $('.invitation').addClass('is-active');
        $('.opponent-span').text(opponent.name);
        fadeIn($('.invitation'));
    }

    function getUserById(id) {
        for (var i = 0; i < users.length; i++) {
            if (users[i].id === id) {
                return users[i];
            }
        }
        return null;
    }

    function openGame() {
        $('.messages').empty();
        db.ref('/games/' + gameId + '/messages').on('child_added', messageAddedHandle);
        fadeOut($('.game-rooms'), function () {
            $('.opponent-name').text(opponent.name);
            $('.game-rooms').addClass('display-none');
            fadeIn($('.game-container'));
        });
    }

    function closeWaitModal() {
        fadeOut($('.wait'), function () {
            $('.wait').removeClass('is-active');
        });
    }

    function openWaitModal() {
        $('.wait').addClass('display-none');
        $('.wait').addClass('is-active');
        $('.opponent-span').text(opponent.name);
        fadeIn($('.wait'));
    }

    function closeInvitationModal() {
        fadeOut($('.invitation'), function () {
            $('.invitation').removeClass('is-active');
        });
    }

    function userHasMadeChoice() {
        if (user.choice) {
            return true;
        }
        return false;
    }

    function opponentHasMadeChoice() {
        if (opponent.choice) {
            return true;
        }
        return false;
    }

    function getOpponentChoice() {
        return opponent.choice;
    }

    function closeGame() {
        db.ref('/games/' + gameId + '/messages').off();
        fadeOut($('.game-container'), function () {
            $('.game-container').addClass('display-none');
            fadeIn($('.game-rooms'));
        });
    }

    function checkIfUserWon() {
        var possibleWins = ['RockScissors', 'PaperRock', 'ScissorsPaper'];
        if (user.choice === opponent.choice) {
            // it is a tie
            statusMessage = 'tied';
            return 'tie';
        }
        for (var i = 0; i < possibleWins.length; i++) {
            if (user.choice + opponent.choice === possibleWins[i]) {
                // user won
                thisGameWins += 1;
                statusMessage = 'won';
                return 'win';
            }
        }
        thisGameLosses += 1;
        statusMessage = 'lost';
        return 'lose';
    }

    function resetGame() {
        $('.game-user-wins').text(thisGameWins);
        $('.game-opponent-wins').text(thisGameLosses);
        $('.win-lose-modal').addClass('is-active');
        $('.game-status').text(statusMessage);
        fadeIn($('.win-lose-modal'), function () {
            setTimeout(function () {
                fadeOut($('.win-lose-modal'), function () {
                    $('.opponent-choice').text('Waiting...');
                    $('.user-choice').text('Pick Weapon');
                    $('.win-lose-modal').removeClass('is-active');
                });
            }, 2000);
        })

    }

    function createUserElement(dbUser) {
        var $tr = $('<tr>');
        $tr.attr('id', 'tr' + dbUser.id);
        var $td = $('<td>');
        $td.text(dbUser.name);
        $tr.append($td);

        var $td = $('<td>');
        $td.text(dbUser.wins);
        $td.addClass('wins-col');
        $tr.append($td);

        var $td = $('<td>');
        $td.addClass('losses-col');
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
    // end global functions

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
    // end animation functions


    // User Class
    class User {
        constructor(dbUser) {
            this.name = dbUser.name;
            this.id = dbUser.id;
            this.inGame = dbUser.inGame;
            this.request = dbUser.request;
            this.wins = dbUser.wins;
            this.losses = dbUser.losses;
            this.online = dbUser.online;
            this.gameId = dbUser.gameId;
            this.choice = undefined;
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
            console.log('dbUser', dbUser);
            // this.name = dbUser.name;
            this.inGame = dbUser.inGame;
            this.request = dbUser.request;
            this.wins = dbUser.wins;
            this.losses = dbUser.losses;
            this.online = dbUser.online;
            this.invitation = dbUser.invitation;
            this.gameId = dbUser.gameId;
            this.choice = dbUser.choice;
            console.log(user);
            this.updateMainStats();
            if (dbUser.online === false) {
                this.changeToOffline();
            }
            if (dbUser.inGame) {
                this.changeToInGame();
            }
            if (dbUser.online && !dbUser.inGame) {
                this.changeToAvailable();
            }
            // stuff below here we only care if this user is an opponent or the user 
            if (this.isUser || this.isOpponent) {
                if (this.request !== false) {
                    // someone wants to play
                    if (this.isUser) {
                        openInvitaionModal(this.request);
                    } else {
                        // if this is not the user then just change to in game
                        this.changeToInGame();
                    }
                }
                if (this.invitation === 'accepted') {
                    // open the game
                    closeWaitModal();
                    gameId = this.gameId;
                    openGame();
                    this.dbRef.update({
                        invitation: 'waiting'
                    });
                } else if (this.invitation === 'denied') {
                    // close the modal
                    closeWaitModal();
                    this.dbRef.update({
                        invitation: 'waiting'
                    });
                } else if (this.invitation === 'revoked') {
                    closeInvitationModal();
                    this.dbRef.update({
                        invitation: 'waiting'
                    });
                } else if (this.invitation === 'quit') {
                    closeGame();
                    this.dbRef.update({
                        invitation: 'waiting'
                    });
                }
                if (this.choice) {
                    if (this.isOpponent) {
                        // change the waiting to the choice
                        $('.opponent-choice').text('Ready');
                        if (userHasMadeChoice()) {
                            $('.opponent-choice').text(this.choice);
                            var verdict = checkIfUserWon();
                            this.updateStats(verdict);
                            console.log(verdict);
                            setTimeout(resetGame, 2000);
                        }
                    } else if (this.isUser) {
                        // show the choice
                        $('.user-choice').text(this.choice);
                        if (opponentHasMadeChoice()) {
                            var oppChoice = getOpponentChoice();
                            $('.opponent-choice').text(oppChoice);
                            var verdict = checkIfUserWon();
                            this.updateStats(verdict);
                            this.choice = undefined;
                            console.log(verdict);
                            setTimeout(resetGame, 2000);
                        }
                    }
                }
            }
        }
        updateStats(verdict) {
            if (verdict === 'win') {
                this.wins += 1;
                this.dbRef.update({
                    wins: this.wins,
                    choice: null
                });
            } else if (verdict === 'lose') {
                this.losses += 1;
                this.dbRef.update({
                    losses: this.losses,
                    choice: null
                });
            }
        }
        updateMainStats() {
            $('#tr' + this.id).find('.losses-col').text(this.losses);
            $('#tr' + this.id).find('.wins-col').text(this.wins);
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
    // end user class

    // checking if there is a name stored in local storage
    var userName = localStorage.getItem('name');
    if (userName) {
        $('.name-input').val(userName);
    }

    user = new User({
        name: userName,
        id: userId,
        inGame: false,
        request: false,
        wins: 0,
        losses: 0,
        online: true,
        gameId: null
    });
    user.isUser = true;
    users.push(user);

    // end handlers
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
            user.addListener();
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
        var dbUser = snapshot.val();
        dbUser.id = snapshot.key;
        if (dbUser.id !== user.id) {
            var nUser = new User(dbUser);
            nUser.addDbRef();
            nUser.addListener();
            users.push(nUser);
            var $el = createUserElement(dbUser);
            $('tbody').append($el);
        }
    }


    function playButtonHanlder(event) {
        var id = $(this).attr('data-id');
        opponent = getUserById(id);
        opponent.isOpponent = true;
        user.opponentId = opponent.id;
        // invite a user
        opponent.dbRef.update({
            request: user.id,
            inGame: true
        });
        user.dbRef.update({
            invitation: 'waiting',
            inGame: true
        });
        openWaitModal();
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
                id: opponent.id,
                choice: null
            },
            messages: {
                first: {
                    message: 'Welcome',
                    name: ''
                }
            }
        });
        gameId = gameReturn.key;
        user.dbRef.update({
            request: false,
            inGame: true,
            gameId: gameId,
            choice: null
        });
        opponent.dbRef.update({
            invitation: 'accepted',
            inGame: true,
            gameId: gameId,
            choice: null
        });
        closeInvitationModal();

        // open the game
        openGame();
    }

    function noButtonClickHandler(event) {
        event.preventDefault();
        user.dbRef.update({
            request: false,
            inGame: false,
            choice: null
        });
        opponent.dbRef.update({
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
        opponent.dbRef.update({
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
        closeWaitModal();
    }

    function quitButtonClickHandler(event) {
        event.preventDefault();
        user.dbRef.update({
            inGame: false,
            invitation: 'waiting',
            request: false,
            choice: null
        });
        opponent.dbRef.update({
            inGame: false,
            invitation: 'quit',
            request: false,
            choice: null
        });
        thisGameLosses = 0;
        thisGameWins = 0;
        closeGame();
    }

    function pickButtonClickHandler(event) {
        event.preventDefault();
        var choice = $('.weapon').find(":selected").text();
        user.dbRef.update({
            choice: choice
        });
    }

    function messageAddedHandle(snapshot) {
        var message = snapshot.val();
        if (message.name === user.name) {
            message.name = 'You';
        }
        $('.messages').append($('<div>').html('<strong>' + message.name + ': </strong>' + message.message));
        $(".messages").scrollTop($(".messages")[0].scrollHeight);
    }

    function sendMessageHandler(event) {
        event.preventDefault();
        var message = {
            message: $('.message-input').val().trim(),
            name: user.name
        };
        db.ref('/games/' + gameId + '/messages').push(message);
        $('.message-input').val('');
    }
    // end handlers

    // listeners
    $('.submit-button').on('click', submittButtonHandler);
    $(document).on('click', '.play-button', playButtonHanlder);
    $('.ok-button').on('click', okButtonClickHandler);
    $('.no-button').on('click', noButtonClickHandler);
    $('.cancel-button').on('click', cancelButtonClickHandler);
    $('.quit-game-button').on('click', quitButtonClickHandler);
    $('.pick-button').on('click', pickButtonClickHandler);
    $('.send-message').on('click', sendMessageHandler);
    $(window).on('unload', function () {
        user.dbRef.update({
            inGame: false,
            online: false
        });
    });
});