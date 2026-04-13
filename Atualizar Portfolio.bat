@echo off
setlocal enabledelayedexpansion
chcp 65001 > nul

echo ==================================================
echo   GERENCIADOR DO PORTFOLIO - ANNA SOUZA BEAUTY
echo ==================================================
echo.
echo Procurando por novas fotos na pasta "img\portfolio"...

if not exist "img\portfolio" (
    echo [!] A pasta "img\portfolio" não existe. Criando agora...
    mkdir "img\portfolio"
    echo [!] Pasta criada. Por favor, coloque suas fotos dentro de "img\portfolio" e rode este arquivo novamente.
    pause
    exit
)

set OUTPUT="data\fotos.js"
echo const FOTOS_DATA = [ > !OUTPUT!

set COUNTER=0
set COMMA=
for %%f in (img\portfolio\*.jpg img\portfolio\*.png img\portfolio\*.jpeg img\portfolio\*.webp) do (
    if defined COMMA echo !COMMA! >> !OUTPUT!
    set "filename=%%~nxf"
    set "line=    { "src": "img/portfolio/!filename!", "alt": "!filename!" }"
    echo !line! >> !OUTPUT!
    set COMMA=,
    set /a COUNTER+=1
)

echo ]; >> !OUTPUT!

echo.
echo [SUCESSO!] O Portfolio foi atualizado automaticamente!
echo Foram encontradas e registradas !COUNTER! imagens.
echo.
echo Pressione qualquer tecla para sair...
pause > nul
