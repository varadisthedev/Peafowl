@echo off
setlocal EnableDelayedExpansion
title DevKill - Port Process Manager

:: ============================================================
::  DEVKILL.BAT - Kill processes hogging your dev ports
:: ============================================================

echo.
echo  =========================================
echo   DevKill ^| Dev Port Process Manager
echo  =========================================
echo.

:: --- Common developer ports to scan ---
set "PORTS=3000 3001 4000 4173 5000 5173 5174 8000 8080 8888 9000"

echo  [*] Scanning common dev ports...
echo.
echo  PORT     PID      PROCESS
echo  -------- -------- ----------------------------

set FOUND=0

for %%P in (%PORTS%) do (
    for /f "tokens=5" %%I in ('netstat -ano ^| findstr ":%%P " ^| findstr "LISTENING" 2^>nul') do (
        set "PID=%%I"
        if not "!PID!"=="0" (
            :: Get process name via tasklist
            for /f "skip=3 tokens=1" %%N in ('tasklist /FI "PID eq !PID!" 2^>nul') do (
                set "PROC=%%N"
            )
            echo   %%P       !PID!     !PROC!
            set FOUND=1
        )
    )
)

if !FOUND!==0 (
    echo   ^(no processes found on common dev ports^)
    echo.
    echo  Tip: Your port might not be in the default list.
    echo  You can still enter any port number below.
    echo.
)

echo.
echo  =========================================
set /p "TARGET_PORT= Enter port to inspect: "

if "%TARGET_PORT%"=="" (
    echo  [!] No port entered. Exiting.
    goto :EOF
)

:: Validate it's a number
echo %TARGET_PORT%| findstr /r "^[0-9][0-9]*$" >nul 2>&1
if errorlevel 1 (
    echo  [!] Invalid port number. Exiting.
    goto :EOF
)

echo.
echo  [*] Looking up port %TARGET_PORT%...
echo.

set "TARGET_PID="
for /f "tokens=5" %%I in ('netstat -ano ^| findstr ":%TARGET_PORT% " ^| findstr "LISTENING" 2^>nul') do (
    set "TARGET_PID=%%I"
)

if "!TARGET_PID!"=="" (
    echo  [!] No LISTENING process found on port %TARGET_PORT%.
    echo      It may already be free or using UDP.
    echo.
    goto :EOF
)

:: --- Gather process info ---
set "PROC_NAME=Unknown"
set "PROC_MEM=Unknown"
set "PROC_SESSION=Unknown"

for /f "skip=3 tokens=1,5,6" %%A in ('tasklist /FI "PID eq !TARGET_PID!" /FO TABLE 2^>nul') do (
    set "PROC_NAME=%%A"
    set "PROC_MEM=%%B %%C"
)

:: Get full command line via WMIC for richer info
set "PROC_CMD=N/A"
for /f "skip=1 delims=" %%C in ('wmic process where "ProcessId=!TARGET_PID!" get CommandLine 2^>nul') do (
    if not "%%C"=="" (
        if "!PROC_CMD!"=="N/A" set "PROC_CMD=%%C"
    )
)

:: Get start time via WMIC
set "PROC_TIME=N/A"
for /f "skip=1" %%T in ('wmic process where "ProcessId=!TARGET_PID!" get CreationDate 2^>nul') do (
    if not "%%T"=="" (
        if "!PROC_TIME!"=="N/A" (
            set "RAW=%%T"
            :: Format: YYYYMMDDHHmmss -> readable
            set "PROC_TIME=!RAW:~0,4!-!RAW:~4,2!-!RAW:~6,2! !RAW:~8,2!:!RAW:~10,2!:!RAW:~12,2!"
        )
    )
)

echo  =========================================
echo   Process Info
echo  =========================================
echo   Port       : %TARGET_PORT%
echo   PID        : !TARGET_PID!
echo   Name       : !PROC_NAME!
echo   Memory     : !PROC_MEM!
echo   Started    : !PROC_TIME!
echo   Command    : !PROC_CMD!
echo  =========================================
echo.

set /p "CONFIRM= Kill process !TARGET_PID! (!PROC_NAME!)? [y/N]: "

if /i "!CONFIRM!"=="y" (
    echo.
    echo  [*] Terminating PID !TARGET_PID!...
    taskkill /PID !TARGET_PID! /F >nul 2>&1

    if errorlevel 1 (
        echo  [!] Failed to kill process. Try running as Administrator.
    ) else (
        echo  [+] Process !TARGET_PID! ^(!PROC_NAME!^) killed successfully.
        echo  [+] Port %TARGET_PORT% is now free.
    )
) else (
    echo.
    echo  [~] Aborted. Process left running.
)

echo.
pause
endlocal