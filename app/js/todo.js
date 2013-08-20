/**
 * Created with IntelliJ IDEA.
 * User: IvanRigamonti
 * Date: 19.07.13
 * Time: 15:06
 * example from http://angularjs.org/
 */

function TodoCtrl($scope) {
    $scope.todos = [
        {text:'An Arbeitstagen vormittags eine 15-minütige Arbeitspause weg vom Arbeitsplatz einlegen.',
            deadline:'22. Juli 2013',
            feld:'Bewegung',
            art:'refresh',
            done:true},

        {text:'Bei Mahlzeit in der Kantine auf tiefen Kohlenhydratanteil achten.',
            deadline:'22. Juli 2013',
            feld:'Ernährung',
            art:'refresh',
            done:false},
        {text:'Am Mittag mit der Arbeit aufhören und Nachmittag mit der Familie verbringen.',
            deadline:'31. Juli 2013',
            feld:'Sozialer Austausch',
            art:'calendar',
            done:false}];

    $scope.addTodo = function() {
        $scope.todos.push({text:$scope.todoText, deadline:'6. Dez. 2013', feld:'eigene Idee', art:'calendar', done:false});
        $scope.todoText = '';
    };

    $scope.remaining = function() {
        var count = 0;
        angular.forEach($scope.todos, function(todo) {
            count += todo.done ? 0 : 1;
        });
        return count;
    };

    $scope.archive = function() {
        var oldTodos = $scope.todos;
        $scope.todos = [];
        angular.forEach(oldTodos, function(todo) {
            if (!todo.done) $scope.todos.push(todo);
        });
    };
}
