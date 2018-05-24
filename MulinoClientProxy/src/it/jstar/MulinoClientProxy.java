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

package it.jstar;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.ServerSocket;
import java.net.Socket;

import it.unibo.ai.didattica.mulino.actions.Action;
import it.unibo.ai.didattica.mulino.actions.Phase1Action;
import it.unibo.ai.didattica.mulino.actions.Phase2Action;
import it.unibo.ai.didattica.mulino.actions.PhaseFinalAction;
import it.unibo.ai.didattica.mulino.domain.State;
import it.unibo.ai.didattica.mulino.domain.State.Checker;
import it.unibo.ai.didattica.mulino.domain.State.Phase;

public class MulinoClientProxy {
	private final static int PORT = 5900;

	private ServerSocket proxySocket;
	private Socket agentSocket;
	private BufferedReader in;
	private BufferedWriter out;

	private MulinoTCPClient engineClient;

	public static void main(String[] args) {
		int port = PORT;
		if (args.length == 1) {
			port = Integer.parseInt(args[0]);
		}
		
		MulinoClientProxy proxy = new MulinoClientProxy();

		proxy.setupAndWaitForConnection(port);
	}

	public void setupAndWaitForConnection(int port) {
		try {
			System.out.println("[PROXY] Waiting for connection on port " + port + "...");
			this.proxySocket = new ServerSocket(port);

			this.agentSocket = this.proxySocket.accept();

			System.out.println("[PROXY] Remote player connected!");

			InputStream inputStream = agentSocket.getInputStream();
			this.in = new BufferedReader(new InputStreamReader(inputStream));
			OutputStream outputStream = this.agentSocket.getOutputStream();
			this.out = new BufferedWriter(new OutputStreamWriter(outputStream));

			// Read the player from the Agent
			Checker player;
			if (this.in.readLine().equals("WHITE")) {
				player = Checker.WHITE;
			} else {
				player = Checker.BLACK;
			}
			System.out.println("You are player " + player + "!");
			// Create the Client to the Engine Server
			this.engineClient = new MulinoTCPClient(player);
			
			boolean isFirstMoveOfTheGame = true;
			
			while (true) {
				readAndReplyState();
				
				// if the player is black than it moves second, so first read white player's move
				if (isFirstMoveOfTheGame && player.equals(Checker.BLACK)) {
					readAndReplyState();
					
					isFirstMoveOfTheGame = false;
				}

				readAndReplyAction();

				readAndReplyState();
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	private void readAndReplyState() throws ClassNotFoundException, IOException {
		// Read the State from the EngineClient
		State currentState = this.engineClient.read();
		System.out.println("[PROXY] Engine: \n" + currentState);

		// Reply the State to the Agent
		String currentStateString = currentState.toCompactString();
		this.out.write(currentStateString);
		this.out.flush();
	}

	private void readAndReplyAction() throws IOException, ClassNotFoundException {
		String phaseActionString = this.in.readLine();
		System.out.println("[PROXY] Agent: " + phaseActionString);

		Action action = buildFromPhaseActionString(phaseActionString);
		System.out.println(action);

		this.engineClient.write(action);
	}

	private static Action buildFromPhaseActionString(String phaseActionString) {
		Phase phase;
		String phaseString = phaseActionString.split("-")[0];

		int phaseInt = Integer.parseInt(phaseString);
		switch (phaseInt) {
		case 1:
			phase = Phase.FIRST;
			break;
		case 2:
			phase = Phase.SECOND;
			break;
		case 3:
			phase = Phase.FINAL;
			break;
		default:
			throw new RuntimeException("Phase not recognized: " + phaseString);
		}

		String actionString = phaseActionString.split("-")[1];

		Action action = stringToAction(actionString, phase);

		return action;
	}

	/**
	 * Converte una stringa testuale in un oggetto azione
	 * 
	 * @param actionString
	 *            La stringa testuale che esprime l'azione desiderata
	 * @param fase
	 *            La fase di gioco attuale
	 * @return L'oggetto azione da comunicare al server
	 */
	private static Action stringToAction(String actionString, Phase fase) {
		if (fase == Phase.FIRST) { // prima fase
			Phase1Action action;
			action = new Phase1Action();
			action.setPutPosition(actionString.substring(0, 2));
			if (actionString.length() == 4)
				action.setRemoveOpponentChecker(actionString.substring(2, 4));
			else
				action.setRemoveOpponentChecker(null);
			return action;
		} else if (fase == Phase.SECOND) { // seconda fase
			Phase2Action action;
			action = new Phase2Action();
			action.setFrom(actionString.substring(0, 2));
			action.setTo(actionString.substring(2, 4));
			if (actionString.length() == 6)
				action.setRemoveOpponentChecker(actionString.substring(4, 6));
			else
				action.setRemoveOpponentChecker(null);
			return action;
		} else { // ultima fase
			PhaseFinalAction action;
			action = new PhaseFinalAction();
			action.setFrom(actionString.substring(0, 2));
			action.setTo(actionString.substring(2, 4));
			if (actionString.length() == 6)
				action.setRemoveOpponentChecker(actionString.substring(4, 6));
			else
				action.setRemoveOpponentChecker(null);
			return action;
		}
	}
}
