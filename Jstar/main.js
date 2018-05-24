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

const client_module = require('./client');
const game_module = require('./game');
const alfabeta_search_module = require('./alfabeta-search');

main(process.argv);

function main(argv) {
    var player = argv[2];

    process.stdout.write("JStar player " + player+"\n");
    process.stdout.write("\n");

    var client = new client_module.Client(player);

    var game = new game_module.Game();

    var search = new alfabeta_search_module.AlfaBetaSearch(game);

    // TODO: refactor
    var myTurn = player === "WHITE" ? true : false;

    var turnNumber = 0;

    (async function loop() {
        while (true) {
            var state = await client.readState();

            turnNumber++;

            var player = game.getPlayer(state);

            process.stdout.write("Current state...\n");
            process.stdout.write(state.toString());
            process.stdout.write("\n");

            process.stdout.write(player + " playing...\n");
            process.stdout.write("\n");

            if (game.isTerminal(state)) {
                break;
            }
        
            if (!myTurn) {
                myTurn = true;

                continue;
            }

            
            var phase = state.getPhase();

            var maxDepth = 5;
            if (phase == 1) {
                var step = Math.floor(turnNumber / 5);
                maxDepth = 5 + step;
            }
            if (phase == 2) {
                maxDepth = 10;
            }
            


            console.log("Searching with max depth = " + maxDepth);

            var now = new Date()
            game.setCutoffTime(now.getTime() + 59000);
            var  cutoffTime = (now.getTime() + 59000);
            var tempState = state.clone();
            var action = search.makeDecision(tempState, maxDepth);
            
            now = new Date();
            
            while(cutoffTime - now > 10000 && maxDepth < 20){
                tempState = state.clone();
                maxDepth = maxDepth + 1;
                process.stdout.write("Nodes expanded: " + search.getNumberOfNodesExpanded() + "\n");
                console.log("Still got time, new max depth = " + maxDepth);
                action = search.makeDecision(tempState, maxDepth);
            }
            
            client.writeAction(phase, action);

            myTurn = false;

            process.stdout.write("Nodes expanded: " + search.getNumberOfNodesExpanded() + "\n");
            process.stdout.write("\n");
        }

        process.stdout.write("JStar done\n");
        process.stdout.write(search.getNumberOfNodesExpanded() + "\n");
    })();
}


