
const db = require('../config/database');

const registrarLog = require('../services/logger.service');

const handleEntrada = async (req, res) => {
  const { placa } = req.body;
  const autorId = req.usuario.id;

  try {
    if (!placa) { return res.status(400).json({ error: 'O campo "placa" é obrigatório.' }); }
    
    const mensalistaResult = await db.query(
        'SELECT * FROM clientes_mensalistas WHERE UPPER(placa_principal) = UPPER($1) AND ativo = TRUE',
        [placa]
    );

    if (mensalistaResult.rows.length > 0) {
        const mensalista = mensalistaResult.rows[0];
        if (mensalista.status_pagamento === 'Adimplente') {
            registrarLog('INFO', 'Entrada Mensalista', `Acesso liberado para ${mensalista.nome_completo} (Placa: ${placa}).`, autorId);
            return res.status(200).json({ message: 'Acesso de mensalista liberado.', tipo: 'Mensalista' });
        } else {
            registrarLog('AVISO', 'Entrada Mensalista', `Acesso negado para ${mensalista.nome_completo} (Placa: ${placa}) por inadimplência.`, autorId);
            return res.status(403).json({ error: 'Acesso negado. Mensalidade pendente.' });
        }
    }

    const veiculoJaDentro = await db.query(
      "SELECT id FROM registros_estacionamento WHERE UPPER(placa) = UPPER($1) AND status IN ('Estacionado', 'Pago')",
      [placa]
    );

    if (veiculoJaDentro.rows.length > 0) {
      return res.status(409).json({ error: 'Este veículo já se encontra no pátio.' });
    }

    const horaAtual = new Date();
    const novoRegistro = await db.query(
      "INSERT INTO registros_estacionamento (placa, horario_entrada, status) VALUES ($1, $2, 'Estacionado') RETURNING *",
      [placa.toUpperCase(), horaAtual]
    );
    
    const veiculoRegistrado = novoRegistro.rows[0];

    registrarLog('INFO', 'Entrada Avulso', `Veículo placa ${veiculoRegistrado.placa} registrado no pátio.`, autorId);

    res.status(201).json(veiculoRegistrado);

  } catch (error) {
    console.error(`Erro ao registrar entrada para a placa ${placa}:`, error);
    registrarLog('ERRO', 'Entrada Avulso', `Falha ao tentar registrar ${placa}. Erro: ${error.message}`, autorId);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


// Nova função para listar os veículos atualmente no pátio
const listarVeiculosNoPatio = async (req, res) => {
  console.log('Recebida requisição para listar veículos no pátio.');

  try {
    // Busca todos os registros onde o status seja 'Estacionado' ou 'Pago'
    const { rows } = await db.query(
      "SELECT id, placa, horario_entrada, status FROM registros_estacionamento WHERE status IN ('Estacionado', 'Pago') ORDER BY horario_entrada DESC"
    );

    // Retorna a lista de veículos
    res.status(200).json(rows);

  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Importa nosso novo serviço de cálculo
const calculoService = require('../services/calculo.service');

const consultarValor = async (req, res) => {
  // Pega a placa que vem como parâmetro na URL
  const { placa } = req.params;
  console.log(`Consultando valor para a placa: ${placa}`);

  try {
    // 1. Busca os dados do veículo que ainda está estacionado
    const veiculoResult = await db.query(
      "SELECT id, horario_entrada FROM registros_estacionamento WHERE placa = $1 AND status = 'Estacionado'",
      [placa]
    );

    if (veiculoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado ou já foi pago.' });
    }

    const veiculo = veiculoResult.rows[0];

    // 2. Busca a tabela de preços ativa
    const precoResult = await db.query("SELECT * FROM tabela_precos WHERE ativa = TRUE LIMIT 1");

    if (precoResult.rows.length === 0) {
      return res.status(500).json({ error: 'Nenhuma tabela de preços ativa encontrada.' });
    }

    const tabelaPreco = precoResult.rows[0];

    // 3. Usa o serviço de cálculo para obter o valor
    const valorAPagar = calculoService.calcularValor(veiculo.horario_entrada, tabelaPreco);

    // 4. Retorna os detalhes para o cliente
    res.status(200).json({
      placa: veiculo.placa, // Não precisávamos mas é bom retornar
      horario_entrada: veiculo.horario_entrada,
      valor_a_pagar: valorAPagar.toFixed(2), // Garante duas casas decimais
    });

  } catch (error) {
    console.error(`Erro ao consultar valor para a placa ${placa}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const registrarPagamento = async (req, res) => {
  const { placa } = req.params;
  const autorId = req.usuario.id;

  console.log(`Registrando pagamento para a placa: ${placa} por usuário ID: ${autorId}`);

  try {
    // 1. & 2. Busca o veículo e a tabela de preços (lógica similar à consulta)
    const veiculoResult = await db.query(
      "SELECT * FROM registros_estacionamento WHERE placa = $1 AND status = 'Estacionado'",
      [placa]
    );

    if (veiculoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado ou pagamento já registrado.' });
    }
    const veiculo = veiculoResult.rows[0];

    const precoResult = await db.query("SELECT * FROM tabela_precos WHERE ativa = TRUE LIMIT 1");
    if (precoResult.rows.length === 0) {
      return res.status(500).json({ error: 'Nenhuma tabela de preços ativa encontrada.' });
    }
    const tabelaPreco = precoResult.rows[0];

    // 3. Reutiliza nosso serviço de cálculo para confirmar o valor
    const valorCalculado = calculoService.calcularValor(veiculo.horario_entrada, tabelaPreco);

    // 4. ATUALIZA o registro no banco
    const horaDoPagamento = new Date();

    registrarLog('INFO', 'Pagamento', `Pagamento para ${placa} registrado. Valor: ${valorCalculado.toFixed(2)}`, autorId);

    await db.query(
      "UPDATE registros_estacionamento SET status = 'Pago', horario_pagamento = $1, valor_total = $2, id_tabela_preco = $3 WHERE id = $4",
      [horaDoPagamento, valorCalculado, tabelaPreco.id, veiculo.id]
    );

    // 5. Retorna sucesso
    res.status(200).json({
      message: 'Pagamento registrado com sucesso!',
      placa: veiculo.placa,
      valor_pago: valorCalculado.toFixed(2),
      tolerancia_saida: `${tabelaPreco.tolerancia_saida_minutos} minutos.`
    });

  } catch (error) {
    registrarLog('ERRO', 'Pagamento', `Falha ao registrar pagamento para ${placa}. Erro: ${error.message}`, autorId);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const validarSaida = async (req, res) => {
  const { placa } = req.params;
  
  try {
    // 1º - O carro é de um mensalista ativo e adimplente?
    const mensalistaResult = await db.query(
      'SELECT * FROM clientes_mensalistas WHERE UPPER(placa_principal) = UPPER($1) AND ativo = TRUE AND status_pagamento = \'Adimplente\'',
      [placa]
    );

    if (mensalistaResult.rows.length > 0) {
        // Ação opcional: registrar um evento de saída de mensalista no log principal.
        console.log(`Permissão de saída concedida para mensalista (Placa: ${placa}).`);
        return res.status(200).json({ permissao: 'concedida', tipo: 'Mensalista' });
    }

    // 2º - Se não é mensalista, é um cliente avulso que já pagou?
    const veiculoPagoResult = await db.query("SELECT * FROM registros_estacionamento WHERE UPPER(placa) = UPPER($1) AND status = 'Pago'", [placa]);
    if (veiculoPagoResult.rows.length > 0) {
        // ... Lógica de tolerância pós-pagamento ...
        // (Esta parte do seu código está perfeita e pode ser mantida como está)
    }

    // 3º - Se não, é um cliente avulso saindo dentro da tolerância de entrada?
    const veiculoEstacionadoResult = await db.query("SELECT * FROM registros_estacionamento WHERE UPPER(placa) = UPPER($1) AND status = 'Estacionado'", [placa]);
    if (veiculoEstacionadoResult.rows.length > 0) {
        // ... Lógica da tolerância de 5 minutos ...
        // (Esta parte do seu código também está perfeita)
    }

    // 4º - Se nenhuma das condições acima for atendida, o acesso é negado.
    return res.status(403).json({ permissao: 'negada', motivo: 'Pagamento necessário ou veículo não encontrado no pátio.' });

  } catch (error) {
    console.error(`Erro ao validar saída para ${placa}:`, error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


// Função para finalizar um registro manualmente
const finalizarManualmente = async (req, res) => {
  const { placa } = req.params;
  const motivo = req.body ? req.body.motivo : undefined;
  const autorId = req.usuario.id;

  registrarLog('AVISO', 'Saída Manual', `Saída para ${placa}. Motivo: ${motivo}`, autorId);

  try {
    // Busca um veículo que esteja DENTRO do pátio ('Estacionado' ou 'Pago')
    const veiculoResult = await db.query(
      "SELECT id FROM registros_estacionamento WHERE placa = $1 AND status IN ('Estacionado', 'Pago')",
      [placa]
    );

    if (veiculoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado no pátio.' });
    }

    const veiculoId = veiculoResult.rows[0].id;
    const horaAtual = new Date();

    // ATUALIZA o status diretamente para 'Finalizado'.
    // Idealmente, poderíamos ter uma coluna 'observacao' para anotar o motivo.
    await db.query(
      "UPDATE registros_estacionamento SET status = 'Finalizado', horario_saida = $1 WHERE id = $2",
      [horaAtual, veiculoId]
    );
    
    res.status(200).json({ message: `Saída do veículo ${placa} registrada manualmente com sucesso.` });

  } catch (error) {
    registrarLog('ERRO', 'Finalizar Manual', `Falha ao processar ${placa}. Erro: ${error.message}`, autorId);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};



// Exportamos a função para que as rotas possam usá-la
module.exports = {
  handleEntrada,
  listarVeiculosNoPatio,
  consultarValor,
  registrarPagamento,
  validarSaida,
  finalizarManualmente,
};