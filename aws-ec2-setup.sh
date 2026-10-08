#!/bin/bash
# Script de inicialización para AWS EC2 (Amazon Linux 2023)
# Cópialo y pégalo en la consola de tu instancia EC2.

echo "Actualizando paquetes..."
sudo dnf update -y

echo "Instalando Git y Docker..."
sudo dnf install git docker -y

echo "Iniciando Docker..."
sudo systemctl enable docker
sudo systemctl start docker

echo "Añadiendo el usuario ec2-user al grupo docker..."
sudo usermod -a -G docker ec2-user

echo "Instalando Docker Compose..."
# En Amazon Linux 2023, Docker Compose suele venir como un plugin de Docker CLI
sudo dnf install docker-compose-plugin -y

echo "--------------------------------------------------------"
echo "¡Instalación completada!"
echo "Para aplicar los permisos de Docker, CIERRA ESTA SESIÓN (escribe 'exit')"
echo "y vuelve a conectarte por SSH a la EC2."
echo ""
echo "Luego, para desplegar la app, corre:"
echo "1. git clone [URL_DE_TU_REPO]"
echo "2. cd Quack-MVP"
echo "3. nano .env (Pega aquí tu VITE_GCP_GEMINI_API_KEY=...)"
echo "4. docker compose up --build -d"
echo "--------------------------------------------------------"
