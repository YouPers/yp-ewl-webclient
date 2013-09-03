function SocialLogCtrl($scope) {
    $scope.socialLogEntries = [
        {
            "type": "community",
            "status": "newMessage",
            "avatar": "assets/img/UBAU.jpeg",
            "author": "Urs Baumeler",
            "area": "Bewegung",
            "activity": "Joggen über Mittag",
            "comment": "Bin auch dabei",
            "timestamp": "20.08.2013 11:25"
        },
        {
            "type": "community",
            "status": "newMessage",
            "avatar": "assets/img/IRIG.jpeg",
            "author": "Ivan Rigamonti",
            "area": "Bewegung",
            "activity": "Joggen über Mittag",
            "comment": "Kann leider nicht, bin ausser Haus.",
            "timestamp": "20.08.2013 11:22"
        },
        {
            "type": "youpers",
            "status": "newMessage",
            "avatar": "assets/img/youpers.jpeg",
            "author": "YouPers",
            "area": "Ernährung",
            "activity": "Kohlenhydratarme Kost",
            "comment": "Neue attraktive Ernährungsvorschläge!",
            "timestamp": "20.08.2013 09:15"
        },
        {
            "type": "community",
            "status": "newMessage",
            "avatar": "assets/img/RBLU.jpeg",
            "author": "Reto Blunschi",
            "area": "Bewegung",
            "activity": "Joggen über Mittag",
            "comment": "Welche Route heute?",
            "timestamp": "20.08.2013 09:07"
        },
        {
            "type": "community",
            "status": "newMessage",
            "avatar": "assets/img/SMUE.jpeg",
            "author": "Stefan Müller",
            "area": "Bewegung",
            "activity": "Joggen über Mittag",
            "comment": "Wer ist mit von der Partie?",
            "timestamp": "20.08.2013 08:15"
        },
        {
            "type": "community",
            "status": "readMessage",
            "avatar": "assets/img/UBAU.jpeg",
            "author": "Urs Baumeler",
            "area": "Bewegung",
            "activity": "Joggen über Mittag",
            "comment": "Kann dir nur zustimmen!",
            "timestamp": "17.08.2013 16:35"
        },
        {
            "type": "community",
            "status": "readMessage",
            "avatar": "assets/img/SMUE.jpeg",
            "author": "Stefan Müller",
            "area": "Bewegung",
            "activity": "Joggen über Mittag",
            "comment": "Wetter und Strecke waren einfach genial heute!",
            "timestamp": "17.08.2013 14:22"
        }
    ];

    $scope.glyphicon = function(status) {
        var icon = "";
        if (status == "newMessage") {
            icon = "envelope";
        } else if (status == "readMessage") {
            icon = "ok";
        } else {
            icon = "star";
        };
        return icon;
    };

}