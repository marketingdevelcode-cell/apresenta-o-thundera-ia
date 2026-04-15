@echo off
echo ====================================================
echo  Automatizador de Organizacao - Thundera GitHub Pages
echo ====================================================
echo.

:: 1. Renomeia a pasta CSS para 'style'
if exist "css" (
    rename "css" "style"
    echo [ OK ] Pasta 'css' renomeada para 'style'.
)

:: 2. Cria a pasta assets e move as imagens
if not exist "assets" mkdir "assets"
if exist "*.png" (
    move "*.png" "assets\" >nul
    echo [ OK ] Imagens PNG movidas para a pasta 'assets'.
)

:: 3. Salva o index.html antigo como design-system.html
if exist "index.html" (
    rename "index.html" "design-system.html"
    echo [ OK ] Cópia salva: 'index.html' renomeado para 'design-system.html'.
)

:: 4. Substitui o index.html pelo presentation.html
if exist "presentation.html" (
    rename "presentation.html" "index.html"
    echo [ OK ] 'presentation.html' promovido a 'index.html' principal.
)

echo.
echo [ SUCESSO ] Todos os arquivos organizados, e seu arquivo de Design System salvo com sucesso!
echo Feche o terminal ou aperte qualquer tecla.
pause >nul
