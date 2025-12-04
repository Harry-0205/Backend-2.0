@echo off 
cd /d "C:\xampp\htdocs\Backend-2.0\backend" 
set "JAVA_HOME=C:\Program Files\Java\jdk-21" 
set "PATH=%JAVA_HOME%\bin;%PATH%" 
echo Java configurado: %JAVA_HOME% 
echo Iniciando Spring Boot... 
mvnw.cmd spring-boot:run 
pause 
