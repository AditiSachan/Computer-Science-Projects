set can-use-hw-watchpoints 0
define connect
dir ~/cs3231/warmup-src/kern/compile/WARMUP
target remote unix:.sockets/gdb
b panic
end