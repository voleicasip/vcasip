const formulario = document.getElementById("formulario-inscricao");
const campoNascimento = document.getElementById("data-nascimento");
const campoIdade = document.getElementById("idade");
const campoCategoria = document.getElementById("categoria");
const campoTelefone = document.getElementById("telefone");
const mensagemFormulario = document.getElementById(
    "mensagem-formulario"
);

function calcularIdade(dataNascimento) {
    const nascimento = new Date(`${dataNascimento}T00:00:00`);
    const hoje = new Date();

    let idade = hoje.getFullYear() - nascimento.getFullYear();

    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();

    const aindaNaoFezAniversario =
        mesAtual < mesNascimento ||
        (
            mesAtual === mesNascimento &&
            hoje.getDate() < nascimento.getDate()
        );

    if (aindaNaoFezAniversario) {
        idade--;
    }

    return idade;
}

function identificarCategoria(idade) {
    if (idade >= 15 && idade <= 17) {
        return "Categoria A";
    }

    if (idade >= 12 && idade <= 14) {
        return "Categoria B";
    }

    if (idade >= 10 && idade <= 11) {
        return "Categoria C";
    }

    if (idade >= 8 && idade <= 9) {
        return "Categoria D";
    }

    if (idade >= 6 && idade <= 7) {
        return "Categoria E";
    }

    return "Fora da faixa etária";
}

function atualizarIdadeECategoria() {
    const dataNascimento = campoNascimento.value;

    if (!dataNascimento) {
        campoIdade.value = "";
        campoCategoria.value = "";
        return;
    }

    const idade = calcularIdade(dataNascimento);

    campoIdade.value = `${idade} anos`;
    campoCategoria.value = identificarCategoria(idade);
}

function formatarTelefone(valor) {
    return valor
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .slice(0, 15);
}

function mostrarErro(campo, mensagem) {
    campo.classList.add("campo-invalido");

    const elementoErro =
        campo.parentElement.querySelector(".mensagem-erro");

    if (elementoErro) {
        elementoErro.textContent = mensagem;
    }
}

function limparErro(campo) {
    campo.classList.remove("campo-invalido");

    const elementoErro =
        campo.parentElement.querySelector(".mensagem-erro");

    if (elementoErro) {
        elementoErro.textContent = "";
    }
}

function validarFormulario() {
    let formularioValido = true;

    const camposObrigatorios = [
        document.getElementById("nome-atleta"),
        document.getElementById("data-nascimento"),
        document.getElementById("experiencia"),
        document.getElementById("nome-responsavel"),
        document.getElementById("telefone"),
        document.getElementById("email")
    ];

    camposObrigatorios.forEach((campo) => {
        limparErro(campo);

        if (!campo.value.trim()) {
            mostrarErro(campo, "Este campo é obrigatório.");
            formularioValido = false;
        }
    });

    const email = document.getElementById("email");
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.value && !formatoEmail.test(email.value)) {
        mostrarErro(email, "Digite um e-mail válido.");
        formularioValido = false;
    }

    const telefone = document.getElementById("telefone");
    const telefoneNumeros = telefone.value.replace(/\D/g, "");

    if (telefoneNumeros.length < 10) {
        mostrarErro(telefone, "Digite um telefone válido.");
        formularioValido = false;
    }

    const categoria = campoCategoria.value;

    if (categoria === "Fora da faixa etária") {
        mostrarErro(
            campoNascimento,
            "A inscrição é destinada a atletas de 6 a 17 anos."
        );

        formularioValido = false;
    }

    const aceiteTermos = document.getElementById("aceite-termos");
    const erroTermos = document.getElementById("erro-termos");

    erroTermos.textContent = "";

    if (!aceiteTermos.checked) {
        erroTermos.textContent =
            "É necessário confirmar as informações.";

        formularioValido = false;
    }

    return formularioValido;
}

campoNascimento.addEventListener(
    "change",
    atualizarIdadeECategoria
);

campoTelefone.addEventListener("input", () => {
    campoTelefone.value = formatarTelefone(campoTelefone.value);
});

formulario.addEventListener(
    "submit",
    async (evento) => {
        evento.preventDefault();

        mensagemFormulario.className =
            "mensagem-formulario";

        mensagemFormulario.textContent = "";

        const formularioValido = validarFormulario();

        if (!formularioValido) {
            mensagemFormulario.classList.add("erro");

            mensagemFormulario.textContent =
                "Revise os campos destacados antes de enviar.";

            return;
        }

        if (
            typeof API_VCASIP_URL === "undefined" ||
            !API_VCASIP_URL.includes("script.google.com")
        ) {
            mensagemFormulario.classList.add("erro");

            mensagemFormulario.textContent =
                "A URL da API ainda não foi configurada.";

            return;
        }

        const botaoEnviar =
            formulario.querySelector(
                'button[type="submit"]'
            );

        const textoOriginalBotao =
            botaoEnviar.textContent;

        botaoEnviar.disabled = true;
        botaoEnviar.textContent =
            "Enviando inscrição...";

        const dadosInscricao = {
            nomeAtleta:
                document
                    .getElementById("nome-atleta")
                    .value
                    .trim(),

            dataNascimento:
                document
                    .getElementById("data-nascimento")
                    .value,

            escola:
                document
                    .getElementById("escola")
                    .value
                    .trim(),

            turma:
                document
                    .getElementById("turma")
                    .value
                    .trim(),

            experiencia:
                document
                    .getElementById("experiencia")
                    .value,

            posicao:
                document
                    .getElementById("posicao")
                    .value,

            nomeResponsavel:
                document
                    .getElementById("nome-responsavel")
                    .value
                    .trim(),

            telefone:
                document
                    .getElementById("telefone")
                    .value,

            email:
                document
                    .getElementById("email")
                    .value
                    .trim(),

            observacoes:
                document
                    .getElementById("observacoes")
                    .value
                    .trim()
        };

        try {
            const corpoRequisicao =
                new URLSearchParams(
                    dadosInscricao
                );

            await fetch(
                API_VCASIP_URL,
                {
                    method: "POST",
                    mode: "no-cors",
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },
                    body: corpoRequisicao
                }
            );

            mensagemFormulario.classList.add(
                "sucesso"
            );

            mensagemFormulario.textContent =
                "Inscrição enviada com sucesso! O cadastro ficará aguardando aprovação.";

            formulario.reset();

            campoIdade.value = "";
            campoCategoria.value = "";

            window.scrollTo({
                top:
                    mensagemFormulario
                        .getBoundingClientRect()
                        .top +
                    window.scrollY -
                    130,

                behavior: "smooth"
            });
        } catch (erro) {
            console.error(
                "Erro ao enviar inscrição:",
                erro
            );

            mensagemFormulario.classList.add(
                "erro"
            );

            mensagemFormulario.textContent =
                "Não foi possível enviar a inscrição. Verifique sua conexão e tente novamente.";
        } finally {
            botaoEnviar.disabled = false;
            botaoEnviar.textContent =
                textoOriginalBotao;
        }
    }
);