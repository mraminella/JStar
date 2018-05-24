Marco Raminella
Nicolò Scarpa

Istruzioni avvio giocatore Jstar

NB: i comandi sono racchiusi fra virgolette ""

Giocatore realizzato in node.js, quindi è richiesta una installazione di Node.js per eseguirlo.
E' fornito un adattatore per il client Java nella cartella MulinoClientProxy, per avviare 
la partita è STRETTAMENTE NECESSARIO eseguire ESATTAMENTE nel seguente ordine:

1) Engine di Mulino (progetto Mulino2018)
2) Proxy con "java -jar JstarMulinoClientProxy.jar 5900" (proxy player WHITE)
3) giocatore bianco (Jstar o altro tipo)
4) Proxy con "java -jar JstarMulinoClientProxy.jar 5901" (proxy player BLACK)
5) giocatore nero (Jstar o altro tipo)

Il giocatore Jstar parte come player WHITE se eseguito (dalla cartella Jstar) come:
"node main WHITE"
o come nero invece se eseguito con:
"node main BLACK"

