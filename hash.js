// Arquivo: hash.js
const bcrypt = require('bcrypt');
const saltRounds = 10;

// <<<--- MUDE A SENHA AQUI
const senhaEmTexto = 'erik123'; 

console.log(`Gerando hash para a senha: "${senhaEmTexto}"\n`);
// ... o resto do script continua igual ...
bcrypt.hash(senhaEmTexto, saltRounds, function(err, hash) {
    if(err) { /*...*/ }
    console.log('Hash Gerado para o Erik:');
    console.log(hash);
});