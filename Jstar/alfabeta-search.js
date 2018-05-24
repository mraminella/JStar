/*
*    JStar AI Player for Nine Men's Morris
*
*    Authors:    Scarpa Nicolò
*                Raminella Marco
*    Copyright 2018 Nicolò Scarpa, Marco Raminella.
*    
*    This file is part of JStar.
*
*    JStar is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    JStar is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with JStar.  If not, see <http://www.gnu.org/licenses/>.
* 
*/


var AlfaBetaSearch = (function () {
    function AlfaBetaSearch(theGame) {
        var numberOfNodesExpanded;

        var game;

        init(theGame);

        return {
            makeDecision: makeDecision,
            getNumberOfNodesExpanded: getNumberOfNodesExpanded
        };

        function init(theGame) {
            numberOfNodesExpanded = 0;

            game = theGame;
        }

        function makeDecision(state, depth) {
            var result = null;
            numberOfNodesExpanded = 0;
            var resultValue = Number.NEGATIVE_INFINITY;
            var actions = game.getActions(state);
            actions.forEach(function (action) {
                var value = minValue(game.getResultForAction(state, action), depth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
                if (value > resultValue) {
                    result = action;
                    resultValue = value;
                }
            });

            return result;
        }

        function maxValue(state, depth, alpha, beta) {
            numberOfNodesExpanded++;

            if (game.cutoffTest(state, depth)) {
                return game.getUtility(state);
            }

            var value = Number.NEGATIVE_INFINITY;
            var actions = game.getActions(state);
            actions.forEach(function (action) {
                value = Math.max(value, minValue(game.getResultForAction(state, action), depth - 1, alpha, beta));
                if (value >= beta) {
                    return value;
                }
                alpha = Math.max(alpha, value);
            });

            return value;
        }

        function minValue(state, depth, alpha, beta) {
            numberOfNodesExpanded++;

            if (game.cutoffTest(state, depth)) {
                return game.getUtility(state);
            }

            var value = Number.POSITIVE_INFINITY;
            var actions = game.getActions(state);
            actions.forEach(function (action) {
                value = Math.min(value, maxValue(game.getResultForAction(state, action), depth - 1, alpha, beta));
                if (value <= alpha) {
                    return value;
                }
                beta = Math.min(beta, value);
            });

            return value;
        }

        function getNumberOfNodesExpanded() {
            return numberOfNodesExpanded;
        }
    };

    return AlfaBetaSearch;
})();

module.exports = {
    AlfaBetaSearch: AlfaBetaSearch
};