// Larinuim dictionary in array/objectified way

function larinuim_FIND_ANY(word) {
    let opts = [];
    for(let i = 0; i < __dict.length; ++i) {
        const obj = __dict[i];
        if (obj.l.indexOf(word) != -1) {
            opts[opts.length] = obj;
        }
        else {
            for(let j = 0; j < obj.d.length; ++j) {
                if (obj.d[j].indexOf(word) >= 0) {
                    opts[opts.length] = obj;
                    break;
                }
            }
        }
    }
    return opts;
}

function larinuim_FIND_WORD(word) {
    let opts = [];
    for(let i = 0; i < __dict.length; ++i) {
        const obj = __dict[i];
        if (obj.l.indexOf(word) != -1) opts[opts.length] = obj;
    }
    return opts;
}

function larinuim_FIND_REVERSE(revs) {
    let opts = [];
    for(let i = 0; i < __dict.length; ++i) {
        const obj = __dict[i];
        for(let j = 0; j < obj.d.length; ++j) {
            if (obj.d[j].indexOf(revs) >= 0) {
                opts[opts.length] = obj;
                break;
            }
        }
    }
    return opts;
}
function larinuim_LENGTH() {
    return __dict.length;
}
function larinuim_INDEX(index) {
    if (index >= __dict.length) return null;
    return __dict[index];
}

// example of some
const __dict = [    
    { l: 'anne', d: ['macaco.'] },
    { l: 'abd', d: ['aprender.'] },
    { l: 'abia', d: ['lama, terra molhada', 'sujeira, sujo.'] },
    { l: 'abl', d: ['acontecer, fazer existir', 'preparar, ajustar, deixar pronto (para algo que vai acontecer).'] },
    { l: 'adi', d: ['conhecer, descobrir algo novo.'] },
    { l: 'ae', d: ['você, ele (sujeito).'] },
    { l: 'aete', d: ['nome, identificação, palavra que identifique alguém.'] },
    { l: 'afoh', d: ['cachorro, cadela (animal doméstico)', 'pet, bichinho de estimação', 'subordinado, dependente', 'derivado, originado de.'] },
    { l: 'ahly', d: ['ilha, monte de terra rodeado por água geralmente grande.'] },
    { l: 'ai', d: ['isso, isto, objeto próximo, algo próximo.'] },
    { l: 'aka', d: ['arrumar, organizar, otimizar', 'dar um jeito de conseguir algo (aka edof: arrumar dinheiro).'] },
    { l: 'ale', d: ['escovar, pentear', 'desculpar, pedir desculpa, desculpar-se.'] },
    { l: 'alfk', d: ['dom, habilidade.'] },
    { l: 'alg', d: ['almoçar, lanche entre o café da manhã e o café da tarde, maior refeição do dia.'] },
    { l: 'alul', d: ['cavalo, égua.'] },
    { l: 'amya', d: ['tanto, tantos, tantas, tão.'] },
    { l: 'anoa', d: ['sol', 'fogo, quente, fonte de calor, fogueira', 'centro, origem', 'destaque, destacado, em foco, ponto, argumento.'] },
    { l: 'aout', d: ['tomada, plugue, encaixe, conector', 'buraco (para passagem ou transporte), veia, artéria, via.'] },
    { l: 'as', d: ['vosso, vossa (de vós, pronome).'] },
    { l: 'asse', d: ['possível, provável, possibilidade, chance, oportunidade.'] },
    { l: 'au', d: ['nosso, nossa (de nós, pronome).'] },
    { l: 'av', d: ['seu, sua, seus, suas (de vocês, pronome).'] },
    { l: 'aved', d: ['talvez.'] },
    { l: 'awf', d: ['recuperar, consertar, corrigir, desfazer, cancelar.'] },
    { l: 'awfo', d: ['recuperação, o ato de recuperar, o processo de conserto, correção.'] },
    { l: 'bak', d: ['pegar, capturar, agarrar um objeto, segurar algo.'] },
    { l: 'bal', d: ['carregar, transportar algo', 'recarregar', 'carregar-se de texto ou informação, ler', 'obter, receber (conhecimento ou algo).'] },
    { l: 'bduh', d: ['bobo, no sentido de um erro engraçado ou numa conversa casual, sem sentido negativo em si.'] },
    { l: 'bih', d: ['chorar, lacrimejar, estar triste a ponto de chorar', 'entristecer, ficar mal, piorar, ficar pior, estragar', 'envelhecer, chegando ao fim, indo para o fim, terminando.'] },
    { l: 'bite', d: ['ano, 365 dias, conjunto de meses que formam o ano', 'luz, luminosidade, energia (de luz).'] },
    { l: 'bla', d: ['conversar, falar.'] },
    { l: 'blar', d: ['conversa, papo, mensagem, comentário.'] },
    { l: 'bly', d: ['vender, troca de algo por dinheiro.'] },
    { l: 'body', d: ['bolo, massa em formato de bolo, alimento à base de massa', 'conjunto, objetos juntos em um espaço', 'conjunto de peças que fazem sentido juntas, organizadas de alguma maneira', 'lista, pasta (de documentos, por exemplo).'] },
    { l: 'bofo', d: ['brócolis.'] },
    { l: 'brad', d: ['pão, massa de pão.'] }
];

