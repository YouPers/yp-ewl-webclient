function ActivityLogCtrl($scope) {
    $scope.activityLogEntries = [
        {
            "status": "done",
            "type": "past",
            "activity": "Joggen über Mittag",
            "nofcomments": "7",
            "recurring": "yes",
            "recurringinfo": "jeden Dienstag",
            "rating": "4",
            "timestamp": "06.08.2013 12:15"
        },
        {
            "status": "not done",
            "type": "past",
            "activity": "Joggen über Mittag",
            "nofcomments": "2",
            "recurring": "yes",
            "recurringinfo": "jeden Dienstag",
            "rating": "1",
            "timestamp": "13.08.2013 11:45"
        },
        {
            "status": "open",
            "type": "current",
            "activity": "Joggen über Mittag",
            "nofcomments": "3",
            "recurring": "yes",
            "recurringinfo": "jeden Dienstag",
            "rating": "0",
            "timestamp": "heute 12:00"
        },
        {
            "status": "open",
            "type": "future",
            "activity": "Joggen über Mittag",
            "nofcomments": "0",
            "recurring": "yes",
            "recurringinfo": "jeden Dienstag",
            "rating": "0",
            "timestamp": "27.08.2013 12:00"
        },
        {
            "status": "open",
            "type": "future",
            "activity": "Joggen über Mittag",
            "nofcomments": "0",
            "recurring": "yes",
            "recurringinfo": "jeden Dienstag",
            "rating": "0",
            "timestamp": "03.09.2013 12:00"
        },
        {
            "status": "open",
            "type": "future",
            "activity": "Joggen über Mittag",
            "nofcomments": "0",
            "recurring": "yes",
            "recurringinfo": "jeden Dienstag",
            "rating": "0",
            "timestamp": "10.09.2013 12:00"
        },
        {
            "status": "open",
            "type": "future",
            "activity": "Joggen über Mittag",
            "nofcomments": "0",
            "recurring": "yes",
            "recurringinfo": "jeden Dienstag",
            "rating": "0",
            "timestamp": "17.09.2013 12:00"
        },
        {
            "status": "open",
            "type": "future",
            "activity": "Joggen über Mittag",
            "nofcomments": "0",
            "recurring": "yes",
            "recurringinfo": "jeden Dienstag",
            "rating": "0",
            "timestamp": "24.09.2013 12:00"
        },
        {
            "status": "open",
            "type": "future",
            "activity": "Joggen über Mittag",
            "nofcomments": "0",
            "recurring": "yes",
            "recurringinfo": "jeden Dienstag",
            "rating": "0",
            "timestamp": "01.10.2013 12:00"
        }
    ];

    $scope.getStars = function(num) {
        var starsArray = new Array();
        for (var i = 0; i < num; i++) {
            starsArray[i]=i;
        }
        return starsArray;
    }

    $scope.getEmptyStars = function(num) {
        var starsArray = new Array();
        for (var i = 0; i < num; i++) {
            starsArray[i]=i;
        }
        return starsArray;
    }

    $scope.glyphiconStatus = function(status) {
        var icon = "";
        if (status == "done") {
            icon = "ok";
        } else if (status == "not done") {
            icon = "remove";
        } else if (status == "open") {
            icon = "unchecked";
        };
        return icon;
    };

    $scope.glyphiconType = function(status) {
        var icon = "";
        if (status == "past") {
            icon = "past";
        } else if (status == "current") {
            icon = "active";
        } else if (status == "future") {
            icon = "";
        };
        return icon;
    };

}