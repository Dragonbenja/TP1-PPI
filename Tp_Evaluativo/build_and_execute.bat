:: Compilo el Binario
g++ -std=c++17 -Wall -Wextra -Wpedantic -Werror -I.\include main.cpp src\utilities.cpp src/globals.cpp -o program.exe

:: Limpio los códigos objeto
DEL .\*.o

:: Ejecuto
program.exe
