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
    constructor(name, id, inGame, request, wins, losses) {
        this.username = name;
        this.id = id;
        this.inGame = inGame;
        this.request = request;
        this.wins = wins;
        this.losses = losses;
    }
}

$(document).ready(function () {
    console.log('hello world');

    // gloal variables
    var userId = localStorage.getItem('id');
    var availableUsers = db.ref('/availableUsers');

    // checking if there is a username stored in local storage
    var userName = localStorage.getItem('name');
    if (userName) {
        $('input').val(userName);
    }

    var user = new User(userName, userId, false, false, 0, 0);
    var userRef = db.ref('/availableUsers/' + user.id);


    // functions
    function submittButtonHandler(e) {
        e.preventDefault();
        userName = $('input').val();
        user.username = userName;
        localStorage.setItem('name', userName); // add username to localstorage
        // check if they have played before
        if (!userId) {
            // add user to firebase
            var fireUserRef = availableUsers.push({
                name: user.username,
                inGame: false,
                request: false,
                wins: 0,
                losses: 0,
                invitation: 'waiting'
            });
            user.id = fireUserRef.key;
            // set the id for local storage
            localStorage.setItem('id', user.id);
            userRef = db.ref('/availableUsers/' + user.id);
        } else {
            // set in game to false and request to false
            userRef.update({
                inGame: false,
                request: false,
                invitation: 'waiting'
            });
        }
        availableUsers.on('child_added', availableUsersHandler);
        userRef.on('value', userValueChangeHandler);
        var $fadeElement = $('.modal-content');
        fadeOut($fadeElement, function () {
            $fadeElement.find('form').addClass('display-none');
            $('p').removeClass('display-none');
            fadeIn($fadeElement, function () {
                setTimeout(function () {
                    fadeOut($('.modal'), function () {
                        $('.modal').removeClass('is-active');
                        $('.game-rooms').removeClass('display-none');
                    });
                }, 2000);
            });
        });
    }

    function userValueChangeHandler(snapshot) {
        var dbUser = snapshot.val();
        console.log(dbUser);
        // if dbUser.request == true then bring up a modal to accept the invitation
    }

    function availableUsersHandler(snapshot) {
        console.log(snapshot);
        var dbUser = snapshot.val();
        dbUser.id = snapshot.key;
        console.log(dbUser);
        if (dbUser.id !== user.id && !dbUser.inGame) {
            var $el = createUserElement(dbUser);
            $('tbody').append($el);
        }
    }

    function createUserElement(dbUser) {
        var $tr = $('<tr>');
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
        var $td = $('<td>');
        $td.append($btn);
        $tr.append($td);

        return $tr;
    }

    function playButtonHanlder(event) {
        var id = $(this).attr('data-id');
        // invite a user
        db.ref('/availableUsers/' + id).update({
            request: true
        });
        // add listener to the user that was invited
        db.ref('/availableUsers/' + id).on('value', function (snapshot) {
            var oponent = snapshot.val();
            if (oponent.invitation === 'accepted') {
                // start game!
                console.log('start game');
            }
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
    $(document).on('click', '.play-button', playButtonHanlder)



});