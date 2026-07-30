const botaoMenu = document.getElementById("botao-menu");
const menuPrincipal = document.getElementById("menu-principal");

if (botaoMenu && menuPrincipal) {
    botaoMenu.addEventListener("click", () => {
        const menuEstaAberto = menuPrincipal.classList.toggle("aberto");

        botaoMenu.setAttribute(
            "aria-expanded",
            menuEstaAberto ? "true" : "false"
        );
    });
}