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


const state = require('./state');

var Game = (function () {
    function Game() {
        var initialState = null;
        var currentCutoffTime;
       
        init();

        return {
            getInitialState: getInitialState,
            getPlayers: getPlayers,
            getPlayer: getPlayer,
            getActions: getActions,
            getResultForAction: getResultForAction,
            setCutoffTime : setCutoffTime,
            cutoffTest: cutoffTest,
            isTerminal: isTerminal,
            getUtility: getUtility
        };

        function init() {
            initialState = new state.State();
        }

        function getInitialState() {
            return initialState;
        }

        function getPlayers() {
            return [state.PLAYER_WHITE, state.PLAYER_BLACK];
        }

        function getPlayer(state) {
            return state.getPlayerToMove();
        }

        function getActions(state) {
            switch(state.getPhase()){
                case 1: return state.getPhaseOneActions();
                case 2 : return state.getPhaseTwoActions();
                case 3 : return state.getPhaseThreeActions();
                
            }
        }

        function getResult(state, position) {
            var result = state.clone();
            result.mark(position);
            return result;
        }

        function getResultForAction(state, action){
            var result = state.clone();
            result.applyAction(action);
            return result;
        }

        function setCutoffTime(time){
            currentCutoffTime = time;
        }

        function cutoffTest(state, depth) {
            var date = new Date();
              if(currentCutoffTime - date.getTime() < 1000 || depth == 0) {
                return true;
            }

            if (isTerminal(state)) {
                return true;
            }

            return false;
        }

        function isTerminal(state) {
            var stateUtility = state.getUtility();
            var stateIsTermial = stateUtility === state.RESULT_WIN || stateUtility === state.RESULT_LOOSE;

            return stateIsTermial;
        }

        function getUtility(state, player) {
            var result = state.getUtility();

            return result;
        }
    }

    return Game;
})();

module.exports = {
    Game: Game
};