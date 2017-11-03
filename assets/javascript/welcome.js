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
    constructor(name, id, inGame, request) {
        this.username = name;
        this.id = id;
        this.inGame = inGame;
        this.request = request;
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

    var user = new User(userName, userId, false, false);
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
                request: false
            });
            user.id = fireUserRef.key;
            // set the id for local storage
            localStorage.setItem('id', user.id);
            userRef = db.ref('/availableUsers/' + user.id);
        } else {
            // set in game to false and request to false
            userRef.update({
                inGame: false,
                request: false
            });
        }
        var $fadeElement = $('.modal-content');
        fadeOut($fadeElement, function () {
            $fadeElement.find('form').addClass('display-none');
            $('p').removeClass('display-none');
            fadeIn($fadeElement, function () {
                setTimeout(function () {
                    fadeOut($('.modal'), function () {
                        $('.modal').removeClass('is-active');
                    });
                }, 2000);
            });
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
    $('button').on('click', submittButtonHandler)

});