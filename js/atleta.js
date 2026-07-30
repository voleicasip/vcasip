const formularioAcesso =
    document.getElementById(
        "formulario-acesso"
    );

const campoCodigo =
    document.getElementById(
        "codigo-atleta"
    );

const mensagemAcesso =
    document.getElementById(
        "mensagem-acesso"
    );

const painelAtleta =
    document.getElementById(
        "painel-atleta"
    );

const botaoSair =
    document.getElementById(
        "botao-sair"
    );

let scriptConsultaAtual = null;
let temporizadorConsulta = null;

campoCodigo.addEventListener(
    "input",
    () => {
        campoCodigo.value =
            campoCodigo.value
                .toUpperCase()
                .replace(
                    /[^A-Z0-9]/g,
                    ""
                );
    }
);

formularioAcesso.addEventListener(
    "submit",
    (evento) => {
        evento.preventDefault();

        const codigo =
            campoCodigo.value
                .trim()
                .toUpperCase();

        mensagemAcesso.className =
            "mensagem-formulario";

        mensagemAcesso.textContent = "";

        if (codigo.length !== 12) {
            mostrarErro(
                "Digite um código válido com 12 caracteres."
            );

            return;
        }

        consultarAtleta(codigo);
    }
);

function consultarAtleta(codigo) {
    limparConsultaAnterior();

    const botao =
        formularioAcesso.querySelector(
            'button[type="submit"]'
        );

    botao.disabled = true;
    botao.textContent =
        "Consultando...";

    const nomeCallback =
        "receberDadosAtleta_" +
        Date.now();

    window[nomeCallback] =
        function (resposta) {
            limparConsultaAnterior(
                nomeCallback
            );

            botao.disabled = false;
            botao.textContent =
                "Acessar meus dados";

            if (
                !resposta ||
                resposta.sucesso !== true
            ) {
                mostrarErro(
                    resposta &&
                    resposta.mensagem
                        ? resposta.mensagem
                        : "Não foi possível acessar os dados."
                );

                return;
            }

            preencherPainel(
                resposta.dados
            );
        };

    const parametros =
        new URLSearchParams({
            acao: "atleta",
            codigo,
            callback: nomeCallback
        });

    scriptConsultaAtual =
        document.createElement(
            "script"
        );

    scriptConsultaAtual.src =
        `${API_VCASIP_URL}?${parametros.toString()}`;

    scriptConsultaAtual.onerror =
        function () {
            limparConsultaAnterior(
                nomeCallback
            );

            botao.disabled = false;
            botao.textContent =
                "Acessar meus dados";

            mostrarErro(
                "Não foi possível conectar ao sistema."
            );
        };

    document.body.appendChild(
        scriptConsultaAtual
    );

    temporizadorConsulta =
        window.setTimeout(
            () => {
                limparConsultaAnterior(
                    nomeCallback
                );

                botao.disabled = false;
                botao.textContent =
                    "Acessar meus dados";

                mostrarErro(
                    "A consulta demorou muito. Tente novamente."
                );
            },
            15000
        );
}

function limparConsultaAnterior(
    nomeCallback
) {
    if (temporizadorConsulta) {
        clearTimeout(
            temporizadorConsulta
        );

        temporizadorConsulta = null;
    }

    if (
        scriptConsultaAtual &&
        scriptConsultaAtual.parentNode
    ) {
        scriptConsultaAtual
            .parentNode
            .removeChild(
                scriptConsultaAtual
            );
    }

    scriptConsultaAtual = null;

    if (
        nomeCallback &&
        window[nomeCallback]
    ) {
        delete window[nomeCallback];
    }
}

function preencherPainel(dados) {
    const perfil = dados.perfil;
    const frequencia = dados.frequencia;

    document
        .getElementById(
            "nome-atleta"
        )
        .textContent =
        perfil.nome;

    document
        .getElementById(
            "categoria-atleta"
        )
        .textContent =
        perfil.categoria;

    document
        .getElementById(
            "posicao-atleta"
        )
        .textContent =
        `Posição: ${perfil.posicao}`;

    document
        .getElementById(
            "frequencia-percentual"
        )
        .textContent =
        `${frequencia.percentual}%`;

    document
        .getElementById(
            "presencas-total"
        )
        .textContent =
        frequencia.presentes;

    document
        .getElementById(
            "ausencias-total"
        )
        .textContent =
        frequencia.ausentes;

    document
        .getElementById(
            "justificadas-total"
        )
        .textContent =
        frequencia.justificados;

    preencherEstatisticas(
        dados.estatisticas
    );

    preencherObservacoes(
        dados.observacoes
    );

    formularioAcesso.classList.add(
        "oculto"
    );

    painelAtleta.classList.remove(
        "oculto"
    );

    mensagemAcesso.textContent = "";

    campoCodigo.value = "";

    painelAtleta.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function preencherEstatisticas(
    estatisticas
) {
    const grade =
        document.getElementById(
            "grade-estatisticas"
        );

    grade.innerHTML = "";

    const fundamentos = [
        {
            nome: "Ataque",
            dados:
                estatisticas.ataque
        },
        {
            nome: "Saque",
            dados:
                estatisticas.saque
        },
        {
            nome: "Defesa e passe",
            dados:
                estatisticas.defesaPasse
        },
        {
            nome: "Levantamento",
            dados:
                estatisticas.levantamento
        },
        {
            nome: "Bloqueio",
            dados:
                estatisticas.bloqueio
        }
    ];

    fundamentos.forEach(
        (fundamento) => {
            const artigo =
                document.createElement(
                    "article"
                );

            artigo.className =
                "cartao cartao-estatistica";

            const titulo =
                document.createElement(
                    "h3"
                );

            titulo.textContent =
                fundamento.nome;

            const total =
                document.createElement(
                    "p"
                );

            total.textContent =
                `Ações registradas: ${fundamento.dados.total}`;

            const eficiencia =
                document.createElement(
                    "strong"
                );

            eficiencia.textContent =
                `${fundamento.dados.eficiencia}%`;

            const legenda =
                document.createElement(
                    "span"
                );

            legenda.textContent =
                "Eficiência acumulada";

            artigo.append(
                titulo,
                total,
                eficiencia,
                legenda
            );

            grade.appendChild(
                artigo
            );
        }
    );
}

function preencherObservacoes(
    observacoes
) {
    const lista =
        document.getElementById(
            "lista-observacoes"
        );

    lista.innerHTML = "";

    if (
        !Array.isArray(observacoes) ||
        observacoes.length === 0
    ) {
        const vazio =
            document.createElement(
                "div"
            );

        vazio.className =
            "cartao estado-vazio";

        vazio.textContent =
            "Nenhuma orientação foi registrada.";

        lista.appendChild(vazio);

        return;
    }

    observacoes.forEach(
        (observacao) => {
            const artigo =
                document.createElement(
                    "article"
                );

            artigo.className =
                "cartao observacao-atleta";

            const cabecalho =
                document.createElement(
                    "div"
                );

            cabecalho.className =
                "observacao-cabecalho";

            const titulo =
                document.createElement(
                    "h3"
                );

            titulo.textContent =
                observacao.fundamento ||
                "Observação";

            const data =
                document.createElement(
                    "span"
                );

            data.textContent =
                observacao.data;

            cabecalho.append(
                titulo,
                data
            );

            artigo.appendChild(
                cabecalho
            );

            adicionarLinhaObservacao(
                artigo,
                "FO+",
                observacao.foPositivo
            );

            adicionarLinhaObservacao(
                artigo,
                "FO-",
                observacao.foNegativo
            );

            adicionarLinhaObservacao(
                artigo,
                "Orientação",
                observacao.orientacao
            );

            adicionarLinhaObservacao(
                artigo,
                "Próxima meta",
                observacao.proximaMeta
            );

            lista.appendChild(
                artigo
            );
        }
    );
}

function adicionarLinhaObservacao(
    elemento,
    titulo,
    texto
) {
    if (!texto) {
        return;
    }

    const paragrafo =
        document.createElement("p");

    const destaque =
        document.createElement(
            "strong"
        );

    destaque.textContent =
        `${titulo}: `;

    paragrafo.append(
        destaque,
        document.createTextNode(texto)
    );

    elemento.appendChild(
        paragrafo
    );
}

function mostrarErro(mensagem) {
    mensagemAcesso.className =
        "mensagem-formulario erro";

    mensagemAcesso.textContent =
        mensagem;

    painelAtleta.classList.add(
        "oculto"
    );
}

botaoSair.addEventListener(
    "click",
    () => {
        painelAtleta.classList.add(
            "oculto"
        );

        formularioAcesso.classList.remove(
            "oculto"
        );

        campoCodigo.value = "";

        campoCodigo.focus();
    }
);