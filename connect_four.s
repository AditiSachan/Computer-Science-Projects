########################################################################
# COMP1521 22T2 -- Assignment 1 -- Connect Four!
#
#
# !!! IMPORTANT !!!
# Before starting work on the assignment, make sure you set your tab-width to 8!
# It is also suggested to indent with tabs only.
# Instructions to configure your text editor can be found here:
#   https://cgi.cse.unsw.edu.au/~cs1521/22T2/resources/mips-editors.html
# !!! IMPORTANT !!!
#
#
# This program was written by ADITI SACHAN (z5379867)
# on 27-06-2022
#
# Version 1.0 (05-06-2022): Team COMP1521 <cs1521@cse.unsw.edu.au>
#
########################################################################

#![tabsize(8)]

# Constant definitions.
# DO NOT CHANGE THESE DEFINITIONS

# MIPS doesn't have true/false by default
true  = 1
false = 0

# How many pieces we're trying to connect
CONNECT = 4

# The minimum and maximum board dimensions
MIN_BOARD_DIMENSION = 4
MAX_BOARD_WIDTH     = 9
MAX_BOARD_HEIGHT    = 16

# The three cell types
CELL_EMPTY  = '.'
CELL_RED    = 'R'
CELL_YELLOW = 'Y'

# The winner conditions
WINNER_NONE   = 0
WINNER_RED    = 1
WINNER_YELLOW = 2

# Whose turn is it?
TURN_RED    = 0
TURN_YELLOW = 1

########################################################################
# .DATA
# YOU DO NOT NEED TO CHANGE THE DATA SECTION
	.data

# char board[MAX_BOARD_HEIGHT][MAX_BOARD_WIDTH];
board:		.space  MAX_BOARD_HEIGHT * MAX_BOARD_WIDTH

# int board_width;
board_width:	.word 0

# int board_height;
board_height:	.word 0


enter_board_width_str:	.asciiz "Enter board width: "
enter_board_height_str: .asciiz "Enter board height: "
game_over_draw_str:	.asciiz "The game is a draw!\n"
game_over_red_str:	.asciiz "Game over, Red wins!\n"
game_over_yellow_str:	.asciiz "Game over, Yellow wins!\n"
board_too_small_str_1:	.asciiz "Board dimension too small (min "
board_too_small_str_2:	.asciiz ")\n"
board_too_large_str_1:	.asciiz "Board dimension too large (max "
board_too_large_str_2:	.asciiz ")\n"
red_str:		.asciiz "[RED] "
yellow_str:		.asciiz "[YELLOW] "
choose_column_str:	.asciiz "Choose a column: "
invalid_column_str:	.asciiz "Invalid column\n"
no_space_column_str:	.asciiz "No space in that column!\n"


############################################################
####                                                    ####
####   Your journey begins here, intrepid adventurer!   ####
####                                                    ####
############################################################


########################################################################
#
# Implement the following 7 functions,
# and check these boxes as you finish implementing each function
#
#  - [X] main
#  - [X] assert_board_dimension
#  - [X] initialise_board
#  - [X] play_game
#  - [X] play_turn
#  - [X] check_winner
#  - [X] check_line
#  - [X] is_board_full	(provided for you)
#  - [X] print_board	(provided for you)
#
########################################################################


########################################################################
# .TEXT <main>
	.text
main:
	# Args:     void
	# Returns:
	#   - $v0: int
	#
	# Frame:    [$ra]
	# Uses:     [$v0, $t0, $a0, $a1, $a2]
	# Clobbers: [$v0, $t0, $a0, $a1, $a2]
	#
	# Locals:
	#   
	# Structure:
	#   main
	#   -> [prologue]
	#   -> body
	#   -> [epilogue]

main__prologue:
	begin					# begin a new stack frame
	push	$ra				# | $ra

main__body:
	la	$a0, enter_board_width_str	# printf("Enter board width: ");
	li	$v0, 4
	syscall

	li	$v0, 5				# scanf("%d", &board_width);
	syscall

	la 	$t0, board_width
	sw	$v0, ($t0)

	move	$a0, $v0
	li	$a1, MIN_BOARD_DIMENSION
	li	$a2, MAX_BOARD_WIDTH
	jal assert_board_dimension		# assert_board_dimension(board_width, MIN_BOARD_DIMENSION, MAX_BOARD_WIDTH);

	la 	$a0, enter_board_height_str	# printf("Enter board height: ");
	li	$v0, 4
	syscall

	li 	$v0, 5				# scanf("%d", &board_height);
	syscall

	la 	$t0, board_height
	sw	$v0, ($t0)

	move	$a0, $v0
	li	$a1, MIN_BOARD_DIMENSION
	li	$a2, MAX_BOARD_HEIGHT
	jal assert_board_dimension		# assert_board_dimension(board_height, MIN_BOARD_DIMENSION, MAX_BOARD_HEIGHT);
	
	jal 	initialise_board		# initialise_board();

	jal 	print_board			# print_board();

	jal  	play_game			# play_game()

main__epilogue:
	pop	$ra				# | $ra
	end					# ends the current stack frame

	li	$v0, 0
	jr	$ra				# return 0;


########################################################################
# .TEXT <assert_board_dimension>
	.text
assert_board_dimension:
	# Args:
	#   - $a0: int dimension
	#   - $a1: int min
	#   - $a2: int max
	# Returns:  void
	#
	# Frame:    [$ra]
	# Uses:     [$a0, $a1, $a2, $v0]
	# Clobbers: [$a0, $a1, $a2, $v0]
	#
	# Locals:
	#   - [...]
	#
	# Structure:
	#   assert_board_dimension
	#   -> [prologue]
	#   -> body
	#   -> board_small_if_loop
	#   -> board_small_if_loop__body
	#     -> board_small_if_loop__epilogue
	#   -> board_large_if_loop
	#   -> board_large_if_loop__body
	#     -> board_large_if_loop__epilogue
	#   -> [epilogue]

assert_board_dimension__prologue:
assert_board_dimension__body:
assert_board_dimension__board_small_if_loop:
assert_board_dimension__board_small_if_loop__body:
	bge	$a0, $a1, assert_board_dimension__board_large_if_loop 			# if (dimension < min) {	

	la 	$a0, board_too_small_str_1			
	li	$v0, 4
	syscall										# printf("%s","Board dimension too small (min ");

	move	$a0, $a1
	li 	$v0, 1
	syscall										# printf("%d", min);

	la	$a0, board_too_small_str_2
	li	$v0, 4
	syscall										# printf("%s", ")\n");

assert_board_dimension__board_small_if_loop__epilogue:
	pop 	$ra
	li 	$a0, 1
	li	$v0, 17
	jr 	$ra									# exit(1);

assert_board_dimension__board_large_if_loop:
assert_board_dimension__board_large_if_loop__body:
	ble	$a0, $a2, assert_board_dimension__epilogue				# if (dimension > max) {

	la 	$a0, board_too_large_str_1
	li	$v0, 4
	syscall										# printf("%s", "Board dimension too large (max ") ;

	move	$a0, $a2
	li 	$v0, 1
	syscall										# printf("%d", max);

	la	$a0, board_too_large_str_2
	li	$v0, 4
	syscall										# printf("%s", ")\n");

assert_board_dimension__board_large_if_loop__epilogue:
	pop 	$ra
	li 	$a0, 1
	li	$v0, 17
	jr 	$ra									# exit(1);
	
assert_board_dimension__epilogue:
	jr	$ra									# return;


########################################################################
# .TEXT <initialise_board>
	.text
initialise_board:
	# Args:     void
	# Returns:  void
	#
	# Frame:    [...]
	# Uses:     [$a0, $a1, $t0, $t1, $t2, $t3, $t4, $t5, $t6]
	# Clobbers: [$a0, $a1, $t0, $t1, $t2, $t3, $t4, $t5, $t6]
	#
	# Locals:
	#   - $t0: int row 
	#   - $t1: int col
	#
	# Structure:
	#   initialise_board
	#   -> [prologue]
	#   -> body
	#   -> loop_row_init
	#   -> loop_row_cond
	#   -> loop_row_body
	#     -> loop_col_init
	#     -> loop_col_cond
	#     -> loop_col_body
	#     -> loop_col_step
	#     -> loop_col_end
	#   -> loop_row_step
	#   -> loop_row_end
	#   -> [epilogue]

initialise_board__prologue:
	la	$t0, board_width
	lw 	$a0, 0($t0)

	la 	$t1, board_height
	lw 	$a1, 0($t1)

initialise_board__body:
initialise_board__loop_row_init:					
	li 	$t0, 0

initialise_board__loop_row_cond:
	bge 	$t0, $a1, initialise_board__epilogue					# for (int row = 0; row < board_height; row++) {

initialise_board__loop_row_body:
initialise_board__loop_col_init:
	li 	$t1, 0

initialise_board__loop_col_cond:
	bge 	$t1, $a0, initialise_board__loop_row_step				# for (int col = 0; col < board_width; col++) {

initialise_board__loop_col_body:
	la 	$t2, board
	mul 	$t3, $t0, MAX_BOARD_WIDTH
	add 	$t4, $t2, $t3

	add 	$t5, $t4, $t1
	li 	$t6, CELL_EMPTY
	sb 	$t6, ($t5)								# board[row][col] = CELL_EMPTY;																	# board[row][col] = CELL_EMPTY;

initialise_board__loop_col_step:
	addi 	$t1, $t1, 1
	j 	initialise_board__loop_col_cond

initialise_board__loop_col_end:
initialise_board__loop_row_step:
	addi 	$t0, $t0, 1
	j 	initialise_board__loop_row_cond

initialise_board__loop_row_end:
initialise_board__epilogue:
	jr	$ra									# return;


########################################################################
# .TEXT <play_game>
	.text
play_game:
	# Args:     void
	# Returns:  void
	#
	# Frame:    [$ra, $s0, $s1]
	# Uses:     [$v0, $v1, $s0, $s1, $a0, $a2, $t2]
	# Clobbers: [$v0, $v1, $a0, $a2, $t2]
	#
	# Locals:
	#   - $s0: int whose_turn
	#   - $s1: int winner
	#
	# Structure:
	#   play_game
	#   -> [prologue]
	#   -> body
	#   -> do_loop_body
	#   -> do_loop_first_condn
	#   -> do_loop_second_condn
	#   -> winner_check_if_loop
	#   -> winner_check_else_if_loop
	#   -> winner_check_else_loop
	#   -> [epilogue]

play_game__prologue:
	push 	$ra
	push 	$s0
	push 	$s1

play_game__body:
	li 	$s0, TURN_RED								# int whose_turn = TURN_RED;
											# do {
play_game__do_loop_body:
	move 	$a2, $s0
	jal 	play_turn		

	move	$s0, $v1								# whose_turn = play_turn(whose_turn);

	# doesnt call
	jal 	print_board								# print_board();

	# does call function
	jal 	check_winner

	# s1 will contain the winner or none
	move 	$s1, $v0								# winner = check_winner();
											# }
play_game__do_loop_first_condn:
	bne 	$s1, WINNER_NONE, play_game__winner_check_if_loop			# if (winner != WINNER_NONE) goto play_game__winner_check_if_loop

play_game__do_loop_second_condn:
	jal	is_board_full								
	move 	$t2, $v0
	beq 	$t2, true, play_game__winner_check_if_loop				# if(is_board_full()) goto play_game__winner_check_if_loop
	j 	play_game__do_loop_body			

play_game__winner_check_if_loop:
	bne 	$s1, WINNER_NONE, play_game__winner_check_else_if_loop			# if (winner == WINNER_NONE) {
	la	$a0, game_over_draw_str
	li	$v0, 4
	syscall										# printf("The game is a draw!\n");
											# }
	j 	play_game__epilogue

play_game__winner_check_else_if_loop:
	bne	$s1, WINNER_RED, play_game__winner_check_else_loop			# else if (winner == WINNER_RED) {
	la 	$a0, game_over_red_str
	li 	$v0, 4
	syscall										# printf("Game over, Red wins!\n");
											# }
	j 	play_game__epilogue

play_game__winner_check_else_loop:							# } else {
	la 	$a0, game_over_yellow_str
	li 	$v0, 4
	syscall										# printf("Game over, Yellow wins!\n");
											# }
play_game__epilogue:
	pop 	$s1
	pop 	$s0
	pop 	$ra
	jr	$ra									# return;


########################################################################
# .TEXT <play_turn>
	.text
play_turn:
	# Args:
	#   - $a2: int whose_turn
	# Returns:  
	#   - $v1: whose_turn
	#   - $v1: TURN_YELLOW
	#   - $v1: TURN_RED
	#
	# Frame:    [ ]
	# Uses:     [$v0, $v1, $a0, $a1, $a2, $a3, $t0, $t1, $t2, $t3, $t4, $t5, $t6]
	# Clobbers: [$v0, $v1, $a0, $a1, $a2, $a3, $t0, $t1, $t2, $t3, $t4, $t5, $t6]
	#
	# Locals:
	#   - $t0: target_col
	#   - $t1: target_row
	#
	# Structure:
	#   play_turn
	#   -> [prologue]
	#   -> body
	#   -> print_turn_if_cond
	#   -> print_turn_else_cond
	#   -> choose_col_print
	#   -> column_init
	#   -> column_scan_update
	#   -> invalid_col_first_if_cond
	#   -> invalid_col_second_if_cond
	#   -> invalid_col_if_body
	#   -> target_row_init
	#   -> row_while_loop_cond
	#   -> row_while_first_cond
	#   -> row_while_second_cond
	#   -> row_while_body
	#     -> row_while_if_body
	#   -> if_turn_yellow_loop
	#   -> else_turn_red_loop
	#   -> [epilogue]

play_turn__prologue:
	lw	$a3, board_width
	lw 	$a1, board_height
	
play_turn__body:
play_turn__print_turn_if_cond:
	bne 	$a2, TURN_RED, play_turn__print_turn_else_cond			# if (whose_turn == TURN_RED)	
	la	$a0, red_str
	li 	$v0, 4	
	syscall									# printf("[RED] ");
	j 	play_turn__choose_col_print

play_turn__print_turn_else_cond:						# else  
	la 	$a0, yellow_str
	li 	$v0, 4
	syscall									# printf("[YELLOW] ");

play_turn__choose_col_print:
	la	$a0, choose_column_str
	li 	$v0, 4
	syscall									# printf("Choose a column: ");
		
play_turn__column_init:
	li 	$t0, 0 								# int target_col = 0;

play_turn__column_scan_update:
	li 	$v0, 5
	syscall									# scanf("%d", &target_col);
	move 	$t0, $v0

	sub 	$t0, $t0, 1							# target_col--;

play_turn__invalid_col_first_if_cond:
	blt 	$t0, 0, play_turn__invalid_col_if_body				# if (target_col < 0)
	
play_turn__invalid_col_second_if_cond:
	bge	$t0, $a3, play_turn__invalid_col_if_body			# if (target_col >= board_width) {
	j 	play_turn__target_row_init

play_turn__invalid_col_if_body:
	la 	$a0, invalid_column_str
	li 	$v0, 4
	syscall									# printf("Invalid column\n");

	move 	$v1, $a2
	j	play_turn__epilogue						# return whose_turn;
										# }
play_turn__target_row_init:
	sub 	$t1, $a1, 1							# int target_row = board_height - 1;

play_turn__row_while_loop_cond:
play_turn__row_while_first_cond:
	blt 	$t1, 0, play_turn__if_turn_yellow_loop				# if (target_row < 0) goto play_turn__if_turn_red_loop

play_turn__row_while_second_cond:
	la 	$t2, board
	mul 	$t3, $t1, MAX_BOARD_WIDTH
	add 	$t4, $t2, $t3

	add 	$t5, $t4, $t0
	lb	$t6, ($t5)
	beq 	$t6, CELL_EMPTY, play_turn__if_turn_yellow_loop			# if (board[target_row][target_col] == CELL_EMPTY) goto play_turn__if_turn_red_loop													# board[row][col] = CELL_EMPTY;

play_turn__row_while_body:
	sub 	$t1, $t1, 1							# target_row--;

play_turn__row_while_if_body:
	bge 	$t1, 0, play_turn__row_while_loop_cond				# if (target_row < 0) {
	la 	$a0, no_space_column_str
	li 	$v0, 4
	syscall									# printf("No space in that column!\n");

	move	$v1, $a2
	j 	play_turn__epilogue						# return whose_turn;
										# }
play_turn__if_turn_yellow_loop:
	bne 	$a2, TURN_RED, play_turn__else_turn_red_loop			# if (whose_turn == TURN_RED) {
	
	la 	$t2, board
	mul 	$t3, $t1, MAX_BOARD_WIDTH
	add 	$t4, $t2, $t3

	add 	$t5, $t4, $t0
	li	$t6, CELL_RED
	sb	$t6, ($t5)							# # board[target_row][target_col] = CELL_RED;
										
	li 	$v1, TURN_YELLOW
	j 	play_turn__epilogue						# return TURN_YELLOW;
										# }
play_turn__else_turn_red_loop:							# else {
	la 	$t2, board
	mul 	$t3, $t1, MAX_BOARD_WIDTH
	add 	$t4, $t2, $t3

	add 	$t5, $t4, $t0
	li	$t6, CELL_YELLOW
	sb	$t6, ($t5)							# board[target_row][target_col] = CELL_YELLOW;
											
	li 	$v1, TURN_RED
	j 	play_turn__epilogue						# return TURN_RED;
										# }
play_turn__epilogue:
	jr	$ra		# return;


########################################################################
# .TEXT <check_winner>
	.text
check_winner:
	# Args:	    void
	# Returns:
	#   - $v0: int check
	#   - $v0: WINNER_NONE
	#
	# Frame:    [$ra, $s0, $s1, $s2, $s3, $s4, $s5, $s6, $s7]
	# Uses:     [$s0, $s1, $s2, $s3, $s4, $s5, $s6, $s7, $a0, $a1, $a2, $a3, $v0]
	# Clobbers: [$a0, $a1, $a2, $a3, $v0]
	#
	# Locals:
	#   - $s0: int row
	#   - $s1: int col
	#   - $s2: int check
	# 
	# Structure:
	#   check_winner
	#   -> [prologue]
	#   -> body
	#   -> loop_row_init
	#   -> loop_row_cond
	#   -> loop_row_body
	#     -> loop_col_init
	#     -> loop_col_cond
	#     -> loop_col_body
	#       -> loop_col_first_if_function_call
	# 	-> loop_col_first_if_cond
	#       -> loop_col_second_if_function_call
	#       -> loop_col_second_if_cond
	#       -> loop_col_third_if_function_call
	#       -> loop_col_third_if_cond
	#       -> loop_col_fourth_if_function_call
	#       -> loop_col_fourth_if_cond
	#     -> loop_col_step
	#   -> loop_row_step
	#   -> for_loop_epilogue
	#   -> [epilogue]

check_winner__prologue:
	push 	$ra
	lw	$s6, board_width
	lw 	$s7, board_height
	push 	$s6
	push 	$s7
	push 	$s0
	push 	$s1
	push 	$s2
	push 	$s3
	push 	$s4
	push 	$s5
	
check_winner__body:
check_winner__loop_row_init:					
	li 	$s0, 0

check_winner__loop_row_cond:
	bge 	$s0, $s7, check_winner__for_loop_epilogue					# for (int row = 0; row < board_height; row++) {
	
check_winner__loop_row_body:
check_winner__loop_col_init:
	li 	$s1, 0

check_winner__loop_col_cond:
	bge 	$s1, $s6, check_winner__loop_row_step					# for (int col = 0; col < board_width; col++) {
	
check_winner__loop_col_body:
check_winner__loop_col_first_if_function_call:
	move 	$a0, $s0
	move 	$a1, $s1
	li 	$a2, 1
	li 	$a3, 0
	
	li 	$s2, 0
	jal 	check_line
	move 	$s2, $v0								# check = check_line(row, col, 1, 0);

check_winner__loop_col_first_if_cond:
	beq 	$s2, WINNER_NONE, check_winner__loop_col_second_if_function_call	# if (check != WINNER_NONE) 
	move 	$v0, $s2
	j 	check_winner__epilogue							# return check;

check_winner__loop_col_second_if_function_call:
	move 	$a0, $s0
	move 	$a1, $s1
	li	$a2, 0
	li 	$a3, 1

	li 	$s3, 0
	jal 	check_line
	move 	$s3, $v0								# check = check_line(row, col, 0,1);

check_winner__loop_col_second_if_cond:
	beq 	$s3, WINNER_NONE, check_winner__loop_col_third_if_function_call		# if (check != WINNER_NONE)
	move 	$v0, $s3
	j 	check_winner__epilogue							# return check;

check_winner__loop_col_third_if_function_call:
	move 	$a0, $s0
	move 	$a1, $s1
	li	$a2, 1
	li 	$a3, 1
	
	li 	$s4, 0
	jal 	check_line
	move 	$s4, $v0								# check = check_line(row, col, 1, 1);

check_winner__loop_col_third_if_cond:
	beq 	$s4, WINNER_NONE, check_winner__loop_col_fourth_if_function_call	# if (check != WINNER_NONE)
	move 	$v0, $s4
	j 	check_winner__epilogue							# return check;

check_winner__loop_col_fourth_if_function_call:
	move 	$a0, $s0
	move 	$a1, $s1
	li	$a2, 1
	li 	$a3, -1

	li 	$s5, 0
	jal 	check_line
	move 	$s5, $v0								# check = check_line(row, col, 1, -1);

check_winner__loop_col_fourth_if_cond:
	beq 	$s5, WINNER_NONE, check_winner__loop_col_step				# if (check != WINNER_NONE)
	move 	$v0, $s5
	j 	check_winner__epilogue							# return check;

check_winner__loop_col_step:
	addi 	$s1, $s1, 1
	j 	check_winner__loop_col_cond
	
check_winner__loop_row_step:
	addi 	$s0, $s0, 1
	j 	check_winner__loop_row_cond

check_winner__for_loop_epilogue:
	li 	$v0, WINNER_NONE
	j 	check_winner__epilogue							# return WINNER_NONE;

check_winner__epilogue:
	pop 	$s5
	pop 	$s4
	pop 	$s3
	pop 	$s2
	pop 	$s1
	pop 	$s0
	pop 	$s7
	pop 	$s6
	pop 	$ra
	jr	$ra		# return;

########################################################################
# .TEXT <check_line>
	.text
check_line:
	# Args:
	#   - $a0: int start_row
	#   - $a1: int start_col
	#   - $a2: int offset_row
	#   - $a3: int offset_col
	#
	# Returns:
	#   - $v0: WINNER_NONE
	#   - $v0: WINNER_RED
	#   - $V0: WINNER_YELLOW
	#
	# Frame:    [$s0, $s6, $s7]
	# Uses:     [$s0, $s6, $s7, $a0, $a1, $a2, $a3, $t0, $t1, $t2, $t3, $t4, $t5, $t6, $t7, $t8, $t9, $v0]
	# Clobbers: [$a0, $a1, $a2, $a3, $t0, $t1, $t2, $t3, $t4, $t5, $t6, $t7, $t8, $t9, $v0]
	#
	# Locals:
	#   - $t8: char first_cell
	#   - $t2: int row
	#   - $t3: int col 
	#   - $t0: int i
	#   - $s0: char cell
	#
	# Structure:
	#   check_line
	#   -> [prologue]
	#   -> body
	#   -> if_cell_empty_cond
	#   -> for_loop_init
	#   -> for_loop_cond
	#     -> for_loop_first_if_cond
	#     -> for_loop_first_if_body
	#     -> for_loop_second_if_cond
	#     -> for_loop_second_if_body
	#     -> for_loop_third_if_cond
	#     -> for_loop_third_if_body
	#     -> for_loop_row_col_step
	#   -> for_loop_step
	#   -> if_else_cond
	#   -> if_cond
	#   -> else_cond
	#   -> [epilogue]

check_line__prologue:
	lw 	$s6, board_width
	lw 	$s7, board_height
	
	push 	$s6
	push 	$s7
	push 	$s0
	
check_line__body:
	la 	$t4, board
	mul 	$t5, $a0, MAX_BOARD_WIDTH
	add 	$t6, $t4, $t5

	add 	$t7, $t6, $a1
	lb	$t8, ($t7)							# char first_cell = board[start_row][start_col];	

check_line__if_cell_empty_cond:
	bne 	$t8, CELL_EMPTY, check_line__for_loop_init			# if (first_cell == CELL_EMPTY) 
	
	li 	$v0, WINNER_NONE
	j 	check_line__epilogue						# return WINNER_NONE;

check_line__for_loop_init:
	add 	$t2, $a0, $a2							# int row = start_row + offset_row;
	add 	$t3, $a1, $a3							# int col = start_col + offset_col;

	li 	$t0, 0								# int i = 0
	li 	$t1, CONNECT					
	sub 	$t7, $t1, 1							# i < CONNECT - 1

check_line__for_loop_cond:
	bge 	$t0, $t7, check_line__if_else_cond				# if( i >= CONNECT - 1) goto check_line__if_else_cond
 
check_line__for_loop_first_if_cond:
	blt 	$t2, 0, check_line__for_loop_first_if_body			# if (row < 0) goto check_line__for_loop_first_if_or_body
	blt	$t3, 0, check_line__for_loop_first_if_body			# if (col < 0) goto check_line__for_loop_first_if_or_body
	j 	check_line__for_loop_second_if_cond

check_line__for_loop_first_if_body:
	li 	$v0, WINNER_NONE
	j 	check_line__epilogue						# return WINNER_NONE;

check_line__for_loop_second_if_cond:
	bge 	$t2, $s7, check_line__for_loop_second_if_body	
	bge	$t3, $s6, check_line__for_loop_second_if_body
	j 	check_line__for_loop_third_if_cond

check_line__for_loop_second_if_body:
	li 	$v0, WINNER_NONE
	j 	check_line__epilogue						# return WINNER_NONE;

check_line__for_loop_third_if_cond:
	la 	$t4, board
	mul 	$t5, $t2, MAX_BOARD_WIDTH
	add 	$t6, $t4, $t5

	add 	$t9, $t6, $t3
	lb	$s0, ($t9)							# char cell = board[row][col];	

	beq 	$s0, $t8, check_line__for_loop_row_col_step			# if (cell != first_cell)

check_line__for_loop_third_if_body:
	li 	$v0, WINNER_NONE
	j 	check_line__epilogue						# return WINNER_NONE;

check_line__for_loop_row_col_step:
	add 	$t2, $t2, $a2							# row += offset_row;
	add 	$t3, $t3, $a3							# col += offset_col;

check_line__for_loop_step:
	add 	$t0, $t0, 1							# i++;
	j 	check_line__for_loop_cond

check_line__if_else_cond:
check_line__if_cond:
	bne 	$t8, CELL_RED, check_line__else_cond				# if (first_cell == CELL_RED)
	li 	$v0, 	WINNER_RED
	j 	check_line__epilogue						# return WINNER_RED;

check_line__else_cond:
	li 	$v0, WINNER_YELLOW						# else						
	j 	check_line__epilogue						# return WINNER_YELLOW;
					
check_line__epilogue:
	pop 	$s0
	pop 	$s7
	pop 	$s6
	
	jr	$ra								# return;


########################################################################
# .TEXT <is_board_full>
# YOU DO NOT NEED TO CHANGE THE IS_BOARD_FULL FUNCTION
	.text
is_board_full:
	# Args:     void
	# Returns:
	#   - $v0: bool
	#
	# Frame:    []
	# Uses:     [$v0, $t0, $t1, $t2, $t3]
	# Clobbers: [$v0, $t0, $t1, $t2, $t3]
	#
	# Locals:
	#   - $t0: int row
	#   - $t1: int col
	#
	# Structure:
	#   is_board_full
	#   -> [prologue]
	#   -> body
	#   -> loop_row_init
	#   -> loop_row_cond
	#   -> loop_row_body
	#     -> loop_col_init
	#     -> loop_col_cond
	#     -> loop_col_body
	#     -> loop_col_step
	#     -> loop_col_end
	#   -> loop_row_step
	#   -> loop_row_end
	#   -> [epilogue]

is_board_full__prologue:
is_board_full__body:
	li	$v0, true

is_board_full__loop_row_init:
	li	$t0, 0								# int row = 0;

is_board_full__loop_row_cond:
	lw	$t2, board_height
	bge	$t0, $t2, is_board_full__epilogue				# if (row >= board_height) goto is_board_full__loop_row_end;

is_board_full__loop_row_body:
is_board_full__loop_col_init:
	li	$t1, 0								# int col = 0;

is_board_full__loop_col_cond:
	lw	$t2, board_width
	bge	$t1, $t2, is_board_full__loop_col_end				# if (col >= board_width) goto is_board_full__loop_col_end;

is_board_full__loop_col_body:
	mul	$t2, $t0, MAX_BOARD_WIDTH					# row * MAX_BOARD_WIDTH
	add	$t2, $t2, $t1							# row * MAX_BOARD_WIDTH + col
	lb	$t3, board($t2)							# board[row][col];
	bne	$t3, CELL_EMPTY, is_board_full__loop_col_step			# if (cell != CELL_EMPTY) goto is_board_full__loop_col_step;

	li	$v0, false
	b	is_board_full__epilogue						# return false;

is_board_full__loop_col_step:
	addi	$t1, $t1, 1							# col++;
	b	is_board_full__loop_col_cond					# goto is_board_full__loop_col_cond;

is_board_full__loop_col_end:
is_board_full__loop_row_step:
	addi	$t0, $t0, 1							# row++;
	b	is_board_full__loop_row_cond					# goto is_board_full__loop_row_cond;

is_board_full__loop_row_end:
is_board_full__epilogue:
	jr	$ra								# return;


########################################################################
# .TEXT <print_board>
# YOU DO NOT NEED TO CHANGE THE PRINT_BOARD FUNCTION
	.text
print_board:
	# Args:     void
	# Returns:  void
	#
	# Frame:    []
	# Uses:     [$v0, $a0, $t0, $t1, $t2]
	# Clobbers: [$v0, $a0, $t0, $t1, $t2]
	#
	# Locals:
	#   - `int col` in $t0
	#   - `int row` in $t0
	#   - `int col` in $t1
	#
	# Structure:
	#   print_board
	#   -> [prologue]
	#   -> body
	#   -> for_header_init
	#   -> for_header_cond
	#   -> for_header_body
	#   -> for_header_step
	#   -> for_header_post
	#   -> for_row_init
	#   -> for_row_cond
	#   -> for_row_body
	#     -> for_col_init
	#     -> for_col_cond
	#     -> for_col_body
	#     -> for_col_step
	#     -> for_col_post
	#   -> for_row_step
	#   -> for_row_post
	#   -> [epilogue]

print_board__prologue:
print_board__body:
	li	$v0, 11						# syscall 11: print_int
	la	$a0, '\n'
	syscall							# printf("\n");

print_board__for_header_init:
	li	$t0, 0						# int col = 0;

print_board__for_header_cond:
	lw	$t1, board_width
	blt	$t0, $t1, print_board__for_header_body		# col < board_width;
	b	print_board__for_header_post

print_board__for_header_body:
	li	$v0, 1						# syscall 1: print_int
	addiu	$a0, $t0, 1					# col + 1
	syscall							# printf("%d", col + 1);

	li	$v0, 11						# syscall 11: print_character
	li	$a0, ' '
	syscall							# printf(" ");

print_board__for_header_step:
	addiu	$t0, 1						# col++
	b	print_board__for_header_cond

print_board__for_header_post:
	li	$v0, 11
	la	$a0, '\n'
	syscall							# printf("\n");

print_board__for_row_init:
	li	$t0, 0						# int row = 0;

print_board__for_row_cond:
	lw	$t1, board_height
	blt	$t0, $t1, print_board__for_row_body		# row < board_height
	b	print_board__for_row_post

print_board__for_row_body:
print_board__for_col_init:
	li	$t1, 0						# int col = 0;

print_board__for_col_cond:
	lw	$t2, board_width
	blt	$t1, $t2, print_board__for_col_body		# col < board_width
	b	print_board__for_col_post

print_board__for_col_body:
	mul	$t2, $t0, MAX_BOARD_WIDTH
	add	$t2, $t1
	lb	$a0, board($t2)					# board[row][col]

	li	$v0, 11						# syscall 11: print_character
	syscall							# printf("%c", board[row][col]);
	
	li	$v0, 11						# syscall 11: print_character
	li	$a0, ' '
	syscall							# printf(" ");

print_board__for_col_step:
	addiu	$t1, 1						# col++;
	b	print_board__for_col_cond

print_board__for_col_post:
	li	$v0, 11						# syscall 11: print_character
	li	$a0, '\n'
	syscall							# printf("\n");

print_board__for_row_step:
	addiu	$t0, 1
	b	print_board__for_row_cond

print_board__for_row_post:
print_board__epilogue:
	jr	$ra						# return;

