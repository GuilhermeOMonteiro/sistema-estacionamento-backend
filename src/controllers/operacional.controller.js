// Arquivo: src/controllers/operacional.controller.js (VERSÃO REATORADA)

const db = require('../config/database');

// --- Helper centralizado para tratar as datas ---
const getDatasFromReq = (req) => {
    let { data_inicio, data_fim } = req.query;
    
    // Padrão: se nenhuma data for enviada, assume o dia de hoje.
    if (!data_inicio) {
        data_inicio = new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD
    }
    if (!data_fim) {
        data_fim = data_inicio;
    }
    
    // Garante que todo o último dia seja incluído no intervalo.
    const dataFimCompleta = `${data_fim} 23:59:59.999`;
    
    return { data_inicio, data_fim, dataFimCompleta };
};

// ==========================================================
// ENDPOINT 1: Retorna TODOS os KPIs de uma só vez.
// ==========================================================
const getMetricasOperacionais = async (req, res) => {
    const { data_inicio, dataFimCompleta } = getDatasFromReq(req);
    try {
        const query = `
            SELECT
                -- Métrica #1: Lotação Atual (sempre em tempo real)
                (SELECT COUNT(*) FROM registros_estacionamento WHERE status IN ('Estacionado', 'Pago')) AS lotacao_atual,
                
                -- Métrica #2: Pernoite (sempre em tempo real)
                (SELECT COUNT(*) FROM registros_estacionamento WHERE status IN ('Estacionado', 'Pago') AND horario_entrada < NOW() - INTERVAL '24 hours') AS total_pernoite,
                
                -- Métrica #3: Permanência Média (calculada para o período selecionado)
                (SELECT COALESCE(
                    EXTRACT(EPOCH FROM AVG(horario_saida - horario_entrada)) / 60,
                0) FROM registros_estacionamento WHERE status = 'Finalizado' AND horario_pagamento IS NOT NULL AND horario_saida BETWEEN $1 AND $2) AS tempo_medio_permanencia_minutos;
        `;
        
        const { rows } = await db.query(query, [data_inicio, dataFimCompleta]);

        res.status(200).json(rows[0]);

    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar métricas operacionais: ' + error.message });
    }
};

// ==========================================================
// ENDPOINT 2: Retorna os dados para os gráficos.
// A lógica muda dependendo se o período é um único dia ou vários.
// ==========================================================
const getDadosParaGraficos = async (req, res) => {
    const { data_inicio, dataFimCompleta } = getDatasFromReq(req);
    const timezone = 'America/Sao_Paulo';

    try {
        // A NOVA QUERY: simplesmente pega TODAS as entradas e saídas do período
        const query = `
            SELECT 
                horario_entrada,
                horario_saida
            FROM registros_estacionamento
            WHERE 
                -- Pega qualquer registro que TOCOU no período de tempo selecionado
                (horario_entrada AT TIME ZONE $3) < $2 AND
                (horario_saida IS NULL OR (horario_saida AT TIME ZONE $3) >= $1);
        `;
        
        const { rows } = await db.query(query, [data_inicio, dataFimCompleta, timezone]);
        // Retorna a lista crua de eventos
        res.status(200).json(rows);

    } catch(error) {
        return res.status(500).json({error: "Erro ao buscar eventos para gráficos: " + error.message});
    }
};

// --- EXPORTAÇÕES REFINADAS ---
module.exports = {
    getMetricasOperacionais,
    getDadosParaGraficos
};