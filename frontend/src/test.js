// Definisci la tua stringa da controllare
const inputString = '[test]';

// Definisci l'espressione regolare per cercare parole tra parentesi quadre
const regex = /\[([^\]]+)\]/g;

// Cerca corrispondenze nella stringa
const matches = inputString.match(regex);

// Verifica se ci sono corrispondenze e visualizza i risultati
if (matches) {
  console.log('Parole tra parentesi quadre trovate:');
  matches.forEach(match => {
    // Estrai la parola tra parentesi quadre
    const wordInsideBrackets = match.slice(1, -1);
    console.log(wordInsideBrackets);
  });
} else {
  console.log('Nessuna parola tra parentesi quadre trovata.');
}
