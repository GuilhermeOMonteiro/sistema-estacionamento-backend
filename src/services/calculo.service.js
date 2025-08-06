function calcularValor(horarioEntrada, tabelaPreco) {
  const agora = new Date();
  const entrada = new Date(horarioEntrada);
  const diffMs = agora - entrada;
  const diffHoras = Math.ceil(diffMs / (1000 * 60 * 60));

  console.log(`Diferença de tempo calculada: ${diffHoras} hora(s)`);

  // Converte os valores da tabela de preço (que vêm como string) para números
  const valorPrimeiraHora = parseFloat(tabelaPreco.valor_primeira_hora);
  const valorAdicional = parseFloat(tabelaPreco.valor_hora_adicional);

  if (diffHoras <= 1) {
    return valorPrimeiraHora; // Agora estamos retornando um NÚMERO
  } else {
    const horasAdicionais = diffHoras - 1;
    // O cálculo já resultará em um número
    return valorPrimeiraHora + (horasAdicionais * valorAdicional);
  }
}

module.exports = {
  calcularValor,
};