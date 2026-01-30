import { Ponto, PontoTipo, ValidacaoPonto, Localizacao, LocalTrabalho } from '../types/funcionarios.types';

/**
 * Calcula distância entre dois pontos GPS usando fórmula de Haversine
 */
export const calcularDistancia = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371e3; // raio da Terra em metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Valida se localização está dentro do raio permitido
 */
export const validarLocalizacao = (
  localizacao: Localizacao,
  localEsperado: LocalTrabalho
): { valido: boolean; distancia: number } => {
  const distancia = calcularDistancia(
    localizacao.lat,
    localizacao.lng,
    localEsperado.lat,
    localEsperado.lng
  );

  return {
    valido: distancia <= localEsperado.raioPermitidoMetros,
    distancia: Math.round(distancia),
  };
};

/**
 * Determina próximo ponto permitido na sequência
 */
export const proximoPontoPermitido = (pontos: Ponto[]): PontoTipo | null => {
  if (pontos.length === 0) return 'entrada';

  const ultimoPonto = pontos[pontos.length - 1];

  switch (ultimoPonto.tipo) {
    case 'entrada':
      return 'almoco_saida';
    case 'almoco_saida':
      return 'almoco_volta';
    case 'almoco_volta':
      return 'saida';
    case 'saida':
      return null; // Já saiu, não pode bater mais ponto hoje
    default:
      return 'entrada';
  }
};

/**
 * Valida se ponto pode ser registrado
 */
export const validarPonto = (
  pontos: Ponto[],
  tipo: PontoTipo,
  localizacao: Localizacao,
  localTrabalho?: LocalTrabalho
): ValidacaoPonto => {
  const avisos: string[] = [];
  const agora = new Date();

  // 1. Validar sequência
  const proximoPermitido = proximoPontoPermitido(pontos);
  if (proximoPermitido !== tipo) {
    return {
      valido: false,
      erro: `Próximo ponto deve ser: ${getTipoPontoLabel(proximoPermitido)}`,
    };
  }

  // 2. Validar intervalo mínimo entre pontos (30 minutos)
  if (pontos.length > 0) {
    const ultimoPonto = pontos[pontos.length - 1];
    const diffMinutos =
      (agora.getTime() - ultimoPonto.timestamp.getTime()) / (1000 * 60);

    if (diffMinutos < 30) {
      return {
        valido: false,
        erro: `Aguarde pelo menos 30 minutos entre pontos (faltam ${Math.ceil(30 - diffMinutos)} min)`,
      };
    }
  }

  // 3. Validar horário máximo de almoço (2 horas)
  if (tipo === 'almoco_volta') {
    const almocoSaida = pontos.find((p) => p.tipo === 'almoco_saida');
    if (almocoSaida) {
      const diffHoras =
        (agora.getTime() - almocoSaida.timestamp.getTime()) / (1000 * 60 * 60);
      if (diffHoras > 2) {
        avisos.push(
          `Intervalo de almoço muito longo: ${diffHoras.toFixed(1)}h (máx recomendado: 2h)`
        );
      }
      if (diffHoras < 0.5) {
        avisos.push(
          `Intervalo de almoço muito curto: ${(diffHoras * 60).toFixed(0)} min (mín recomendado: 30min)`
        );
      }
    }
  }

  // 4. Validar horário de trabalho antes do almoço (mínimo 2h)
  if (tipo === 'almoco_saida') {
    const entrada = pontos.find((p) => p.tipo === 'entrada');
    if (entrada) {
      const diffHoras =
        (agora.getTime() - entrada.timestamp.getTime()) / (1000 * 60 * 60);
      if (diffHoras < 2) {
        avisos.push(
          `Tempo de trabalho antes do almoço muito curto: ${diffHoras.toFixed(1)}h`
        );
      }
    }
  }

  // 5. Validar jornada total (máximo 12h)
  if (tipo === 'saida') {
    const entrada = pontos.find((p) => p.tipo === 'entrada');
    if (entrada) {
      const diffHoras =
        (agora.getTime() - entrada.timestamp.getTime()) / (1000 * 60 * 60);
      if (diffHoras > 12) {
        avisos.push(
          `Jornada muito longa: ${diffHoras.toFixed(1)}h (máx recomendado: 12h) - Verificar horas extras`
        );
      }
    }
  }

  // 6. Validar localização (se configurado)
  if (localTrabalho) {
    const { valido, distancia } = validarLocalizacao(localizacao, localTrabalho);
    if (!valido) {
      avisos.push(
        `Você está a ${distancia}m do local de trabalho (máx permitido: ${localTrabalho.raioPermitidoMetros}m)`
      );
    }
  }

  // 7. Validar horário de entrada (antes das 12h)
  if (tipo === 'entrada') {
    const hora = agora.getHours();
    if (hora >= 12) {
      avisos.push(`Entrada após meio-dia (${hora}h) - Verificar se é atraso`);
    }
  }

  return {
    valido: true,
    avisos: avisos.length > 0 ? avisos : undefined,
  };
};

/**
 * Calcula horas trabalhadas baseado nos pontos
 */
export const calcularHorasTrabalhadas = (pontos: Ponto[]): number => {
  if (pontos.length < 2) return 0;

  let totalMinutos = 0;

  // Entrada até saída almoço
  const entrada = pontos.find((p) => p.tipo === 'entrada');
  const almocoSaida = pontos.find((p) => p.tipo === 'almoco_saida');

  if (entrada && almocoSaida) {
    const diff = almocoSaida.timestamp.getTime() - entrada.timestamp.getTime();
    totalMinutos += diff / (1000 * 60);
  }

  // Volta almoço até saída final
  const almocoVolta = pontos.find((p) => p.tipo === 'almoco_volta');
  const saida = pontos.find((p) => p.tipo === 'saida');

  if (almocoVolta && saida) {
    const diff = saida.timestamp.getTime() - almocoVolta.timestamp.getTime();
    totalMinutos += diff / (1000 * 60);
  } else if (almocoVolta) {
    // Ainda trabalhando
    const diff = new Date().getTime() - almocoVolta.timestamp.getTime();
    totalMinutos += diff / (1000 * 60);
  }

  return totalMinutos / 60; // Retorna em horas
};

/**
 * Calcula diária baseado em horas trabalhadas
 */
export const calcularDiaria = (
  pontosHoje: Ponto[],
  diariaBaseCentavos: number,
  horasMinimas: number = 8
): {
  valorCentavos: number;
  horasTrabalhadas: number;
  horasExtras: number;
  proporcional: boolean;
} => {
  const horasTrabalhadas = calcularHorasTrabalhadas(pontosHoje);

  // Validar se bateu todos os pontos necessários
  const temSaida = pontosHoje.some((p) => p.tipo === 'saida');
  if (!temSaida) {
    // Ainda trabalhando ou não bateu saída
    return {
      valorCentavos: 0,
      horasTrabalhadas,
      horasExtras: 0,
      proporcional: true,
    };
  }

  // Calcular horas extras
  const horasExtras = Math.max(0, horasTrabalhadas - horasMinimas);

  // Calcular valor
  let valorCentavos: number;
  let proporcional = false;

  if (horasTrabalhadas >= horasMinimas) {
    // Diária completa + horas extras (50% adicional)
    const valorHoraExtra = (diariaBaseCentavos / horasMinimas) * 1.5;
    valorCentavos = diariaBaseCentavos + Math.floor(horasExtras * valorHoraExtra);
  } else {
    // Proporcional
    valorCentavos = Math.floor((diariaBaseCentavos / horasMinimas) * horasTrabalhadas);
    proporcional = true;
  }

  return {
    valorCentavos,
    horasTrabalhadas,
    horasExtras,
    proporcional,
  };
};

/**
 * Retorna label do tipo de ponto
 */
export const getTipoPontoLabel = (tipo: PontoTipo | null): string => {
  if (!tipo) return 'Nenhum';

  switch (tipo) {
    case 'entrada':
      return 'Entrada';
    case 'almoco_saida':
      return 'Saída para Almoço';
    case 'almoco_volta':
      return 'Volta do Almoço';
    case 'saida':
      return 'Saída Final';
    default:
      return tipo;
  }
};

/**
 * Formata valor em centavos para reais
 */
export const centavosToReais = (centavos: number): string => {
  return (centavos / 100).toFixed(2);
};

/**
 * Converte reais para centavos
 */
export const reaisToCentavos = (reais: number): number => {
  return Math.round(reais * 100);
};

/**
 * Valida CPF
 */
export const validarCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digito1 = resto >= 10 ? 0 : resto;

  if (digito1 !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digito2 = resto >= 10 ? 0 : resto;

  return digito2 === parseInt(cpf.charAt(10));
};

/**
 * Formata CPF
 */
export const formatarCPF = (cpf: string): string => {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata telefone
 */
export const formatarTelefone = (telefone: string): string => {
  telefone = telefone.replace(/[^\d]/g, '');

  if (telefone.length === 11) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (telefone.length === 10) {
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return telefone;
};
