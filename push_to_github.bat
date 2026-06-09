@echo off
chcp 65001 >nul
echo ====================================================================
echo   Subir projeto Cãominhada Petsalut para o GitHub
echo ====================================================================
echo.
echo Este script irá inicializar o Git, adicionar os arquivos, criar o commit
echo e subir o código para o seu repositório no GitHub.
echo.
set /p REPO_URL="Cole a URL do seu repositório (ex: https://github.com/seu-usuario/caominhada-petsalut.git): "
if "%REPO_URL%"=="" (
    echo.
    echo [ERRO] A URL do repositório não pode ser vazia.
    echo.
    pause
    exit /b
)

echo.
echo [1/6] Inicializando Git local...
git init

echo.
echo [2/6] Adicionando arquivos ao versionamento...
git add .

echo.
echo [3/6] Criando o commit inicial...
git commit -m "feat: Ajuste do template principal de acordo com o mockup"

echo.
echo [4/6] Definindo branch principal como 'main'...
git branch -M main

echo.
echo [5/6] Vinculando ao repositório remoto...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%

echo.
echo [6/6] Enviando arquivos para o GitHub...
echo (Se solicitado, faça login no seu navegador ou insira suas credenciais)
echo.
git push -u origin main

echo.
echo ====================================================================
echo   Processo concluído! Verifique a página do seu GitHub.
echo ====================================================================
echo.
pause
