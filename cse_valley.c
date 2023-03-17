// CSE Valley
// cse_valley.c
//
// This program was written by Aditi Sachan (z5379867)
// on 07-10-2021.
//
// Version 1.0.0 (2021-10-04): Assignment Released.
//
// We are the farmers and cse_valley is our farm.
// We can get different types of seeds, grow, water, harvest and trade them
// and see the state of our land at any time even in the natural disasters like
// droughts and windstorms. 

#include <stdio.h>

#define MAX_NAME_SIZE 50
#define MAX_NUM_SEED_TYPES 26
#define LAND_SIZE 8
#define NO_SEED ' '
#define TRUE 1
#define FALSE 0

struct land {
    int is_watered;
    char seed_name;   
};

struct seeds {
    char name;
    int amount;
};

struct farmer {
    int curr_col;
    int curr_row;
    char curr_dir;
    int curr_day;
};

// Function prototype section
//
// Loops through seed_collection 
// and prints the name and amount of all the seeds
void print_all_seeds(struct seeds seed_collection[MAX_NUM_SEED_TYPES],
                     int total_type_seed);
// Loops through seed_collection 
// and prints the name and amount of all the seeds
void print_one_seed(char command2, 
                    struct seeds seed_collection[MAX_NUM_SEED_TYPES],
                    int total_type_seed);
// Function to change direction and and move around the land
void change_dir_and_move(char command,
                         struct farmer *pointer);

// Function to water the adjacent land
void water_adjacent_land(struct farmer cse_farmer,
                         struct land farm_land[LAND_SIZE][LAND_SIZE]);
// Function to plant seed to the adjacent land
void seed_adjacent_land(struct farmer cse_farmer,
                        struct land farm_land[LAND_SIZE][LAND_SIZE],
                        char seed_name_farmer);
// Function to checks if that seed type is with the farmer
void seed_name_check(struct seeds seed_collection[MAX_NUM_SEED_TYPES],
                     char seed_name,
                     struct farmer cse_farmer,
                     struct land farm_land[LAND_SIZE][LAND_SIZE]);
// Function for scattering seeds
void scatter_seeds(struct farmer cse_farmer,
                   struct land farm_land[LAND_SIZE][LAND_SIZE],
                   struct seeds seed_collection[MAX_NUM_SEED_TYPES], 
                   char seed_name,
                   int seed_name_index);
                   
// Function to alter the amount of seeds to account for the seeds planted
void seed_update_function(struct seeds seed_collection[MAX_NUM_SEED_TYPES],
                          char seed_name );                     
// Prints the structs land (including locating where the
// farmer is)
void print_land(struct land farm_land[LAND_SIZE][LAND_SIZE],
                struct farmer cse_farmer);
// Function to square water a particular size of farm land
void square_watering(int size,
                     struct land farm_land[LAND_SIZE][LAND_SIZE],
                     struct farmer cse_farmer);
// Advancing to the next day
// Function to update the land after advancing to next day
void advance_next_day(struct land farm_land[LAND_SIZE][LAND_SIZE],
                      struct seeds seed_collection[MAX_NUM_SEED_TYPES]);
// Function to harvest adjacent land
// To access the plant next to the current farmer postion and direction
void harvest_adjacent_land( struct land farm_land[LAND_SIZE][LAND_SIZE],
                            struct seeds seed_collection[MAX_NUM_SEED_TYPES],
                            struct farmer cse_farmer);
// Function to harvest adjacent land
// Function to update the seeds farmer got by harvesting the plants
void harvested_seed_update(struct land farm_land[LAND_SIZE][LAND_SIZE],
                           struct seeds seed_collection[MAX_NUM_SEED_TYPES],
                           int row,
                           int col);
// Function to trade seeds
// Function to check if there are sufficient amount of seeds to be traded
void check_for_trade_seed(char seed_name,
                          int seed_amount,
                          struct seeds seed_collection[MAX_NUM_SEED_TYPES],
                          char trade_for_seed,
                          int *total_type_seed_ptr);
// Function to trade seeds
// and update the amount of seed traded in and seed traded for
void trade_seeds(int index,
                 int seed_amount,
                 struct seeds seed_collection[MAX_NUM_SEED_TYPES],
                 char trade_for_seed,
                 int *total_type_seed_ptr);
// Function to trade seeds if there's a new seed
// Update the seed_collection to display information about new seed first
void new_seed_update(int *total_type_seed_ptr,
                     struct seeds seed_collection[MAX_NUM_SEED_TYPES],
                     char trade_for_seed,
                     int seed_amount,
                     int index);
// Edge boundaries check and 
// clamping it back into land limits.
void edge_boundary_check_disaster(int *row_start,
                                  int *row_end,
                                  int *col_start,
                                  int *col_end); 
// Function to decide wether it will kill the seeds
// or clear the land because a negative number was entered as a minimum condition
void kill_or_clear_the_seed(int min_num_plants_to_die,
                            struct land farm_land[LAND_SIZE][LAND_SIZE],
                            char command2); 
// Function to change the state of the land depending on the disaster
void disaster_drought_wind_storm(int min_num_plants_to_die,
                                 struct land farm_land[LAND_SIZE][LAND_SIZE],                                 
                                 char command2); 
// Function to calculate the number of plants that will die in the disaster
int to_calculate_dead_plants(int row,
                             int col, 
                             int row_start, 
                             int row_end, 
                             struct land farm_land[LAND_SIZE][LAND_SIZE]);
// Function to check the number of plant around a particular plant
// and increment no_of_plant accordingly
int farm_land_not_empty(int no_of_plant,
                        int row_start,
                        int col_start,
                        struct land farm_land[LAND_SIZE][LAND_SIZE]);
// Function to kill and remove the plants that didn't survive 
void remove_dead_plants(int to_store_the_dead_plants_coord[LAND_SIZE][LAND_SIZE],
                        struct land farm_land[LAND_SIZE][LAND_SIZE]);  
// Function to clear the land that has seeds/plants on it
void clear_the_seeded_land(struct land farm_land[LAND_SIZE][LAND_SIZE]); 
                               
// Provided functions to use for game setup
struct farmer initialise_farmer(struct farmer cse_farmer);
void initialise_seeds(struct seeds seed_collection[MAX_NUM_SEED_TYPES]);
void initialise_land(struct land farm_land[LAND_SIZE][LAND_SIZE]);
void print_top_row(struct land farm_land[LAND_SIZE][LAND_SIZE],
                   int row);
void print_farmer_row(struct land farm_land[LAND_SIZE][LAND_SIZE], 
                      struct farmer cse_farmer);

// Main
int main(void) {

    struct farmer cse_farmer = {};
    cse_farmer = initialise_farmer(cse_farmer);    
    cse_farmer.curr_day = 1;
    
    struct land farm_land[LAND_SIZE][LAND_SIZE];
    initialise_land(farm_land);

    struct seeds seed_collection[MAX_NUM_SEED_TYPES];
    initialise_seeds(seed_collection);
    
    
    printf("Welcome to CSE Valley, farmer!\n");
    printf("Congratulations, you have received 60 seeds.\n");
    printf("How many different seeds do you wish to have? ");
    
    // Scans in number of different seeds    
    int total_type_seed;
    scanf("%d", &total_type_seed);
    
    printf("Enter the names of the seeds to be given:\n");
    int counter = 0;
    while (counter < total_type_seed) {
        // Scans in different names of seeds
        scanf(" %c", &seed_collection[counter].name);
        
        // We have received 60 seeds in beginning
        // We split them equally among different seeds
        seed_collection[counter].amount = 60 / total_type_seed;
        counter++;
    }
        
    printf("Game Started!\n");
    
    // Handles the main commands    
    char command;
    
    // command 2 if used to scan 'seed name' 
    // will print information about that seed
    // If given 'w' as command2, will be used for watering and 
    // 'p' for planting on adjacent land
    char command2; 
    
    // Declaring a pointer to store cse_farmer address
    // to be able to update the farmer's movements
    struct farmer *cse_farmer_ptr = &cse_farmer;
    
  
    printf("Enter command: ");
    int keep_commanding = scanf(" %c", &command);
    
    // While command != ctrl+D (i.e, keep_commanding != 0),
    // we will be asked to keep entering commands
    while (keep_commanding == 1) { 
        // Prints all the seeds with its amount, available with the farmer
        if (command == 'a') {
            // Calling the function to print information about all the seeds
            print_all_seeds(seed_collection,
                            total_type_seed);
        }
        // Prints one seed with its amount
        else if (command == 's') {
            // Scanning in the seed name as command2,
            // farmer wants to know the amount about
            scanf(" %c", &command2);
            // Checking if the seed name is lower cased
            if (command2 >= 'a' && command2 <= 'z') {
                // Calling function to print information about the seed name
                // enetered by the user
                print_one_seed(command2,
                               seed_collection,
                               total_type_seed);
            }
            else {
                printf(" Seed name has to be a lowercase letter\n");                      
            }    
        }
        // Prints the land showing the farmer and status
        // such as which seeds are planted or which land is watered
        else if (command == 'l') {
            print_land(farm_land,
                       cse_farmer);
        }
        // Commands for changing directions and moving around the farm
        else if (command == '>' ||
                 command == '<' ||
                 command == '^' ||
                 command == 'v'  ) {
            
            change_dir_and_move(command,
                                cse_farmer_ptr); 
             
        }
        
        else if (command == 'o') {
            scanf(" %c", &command2);
            // If the farmer wishes to water the land
            if (command2 == 'w') {                
                water_adjacent_land(cse_farmer,
                                    farm_land);                
            }
            
            // Farmer wishes to plant a seed into the land           
            else if (command2 == 'p') {                             
                // Farmer needs to enter the name of the seed they wish to plant
                char seed_name_farmer; 
                scanf(" %c", &seed_name_farmer);                 
                seed_adjacent_land(cse_farmer,
                                   farm_land,
                                   seed_name_farmer);  
                seed_update_function(seed_collection,
                                     seed_name_farmer);                 
            }
        }
        // Farmer wishes to plant multiple seeds at once (scattering of seeds)
        else if (command == 'p') {
            // command2 will be the seed name farmer wishes to scatter          
            scanf(" %c", &command2);                               
            if (command2 >= 'a' && command2 <= 'z') {
                seed_name_check(seed_collection,
                                command2,
                                cse_farmer,
                                farm_land);               
            }                 
            else {
                printf(" Seed name has to be a lowercase letter\n");
            }           
        }
        // Farmer wishes to water a sqaure of the land in one go
        else if (command == 'w') {
            // Size represents the sqaure section of the farm land
            int size;
            scanf(" %d", &size);
            if (size < 0) {
                printf(" The size argument needs to be a non-negative integer\n"); 
            }
            else {
                square_watering(size,
                                farm_land,
                                cse_farmer);
            }
        }
        // Farmer done with the farming for the day
        // We go to the next day
        else if (command == 'n') {
            cse_farmer = initialise_farmer(cse_farmer);
            cse_farmer.curr_day++;            
            printf(" Advancing to the next day... Day %d, let's go!\n",
                     cse_farmer.curr_day);
            advance_next_day(farm_land,
                             seed_collection);
        }
        // Farmer wishes to harvest the adjacent land
        else if (command == 'h' ) {
            harvest_adjacent_land(farm_land,
                                  seed_collection,
                                  cse_farmer); 
        }
        // Farmer wishes to trade seeds with other farmers
        else if (command == 't') {
            // The name of the seed you wish to trade
            char seed_name_farmer; 
            // Its amount
            int seed_amount;            
            // Name of the seed that you want to trade for
            char trade_for_seed;           
            scanf(" %c %d %c", &seed_name_farmer, &seed_amount, &trade_for_seed);
            
            // If the seed names given are not lowercase    
            if (seed_name_farmer < 'a' || 
                seed_name_farmer > 'z' || 
                trade_for_seed < 'a' || 
                trade_for_seed > 'z') {
                
                printf(" Seed name has to be a lowercase letter\n");
            }
            // When the farmer tries to put in a negative number of seeds
            else if (seed_amount < 0 ) {
                printf(" You can't trade negative seeds\n");
            }
            else {
                // Pointer for referencing total types of seeds
                // To increase its value if a new seed is traded in  
                int *total_type_seed_ptr = &total_type_seed;
                check_for_trade_seed(seed_name_farmer,
                                     seed_amount, 
                                     seed_collection,
                                     trade_for_seed, 
                                     total_type_seed_ptr);
            }            
        }
        // Natural disasters hit the farm
        else if (command == 'd') {
            
            scanf(" %c", &command2);
            // Drought hits
            if (command2 == 'd') {
                // Min number of plants in the plant's adjacent lands
                // for a plant to die
                // Adjacent lands are the lands that are within
                // 1 column/row away from a particular land
                int min_num_plants_to_die;                                    
                scanf(" %d", &min_num_plants_to_die);
                kill_or_clear_the_seed(min_num_plants_to_die,
                                       farm_land,
                                       command2);
                                
            }
            // Windstorm hits
            else if (command2 == 'w') {
                // Min number of plants in the plant's adjacent lands
                // for a plant to survive 
                // Adjacent lands are the lands that are within
                // 1 column/row away from a particular land
                int(min_num_plants_to_survive);
                scanf(" %d", &min_num_plants_to_survive);              
                disaster_drought_wind_storm(min_num_plants_to_survive,
                                            farm_land,                                    
                                            command2);
            }            
        }
        // Asks us to enter command until keep_commanding != 1 
        // i.e. EOF (we entered ctrl D)    
        printf("Enter command: ");
        keep_commanding = scanf(" %c", &command);        
    }       
    return 0;
}


//functions definition section

// Loops through seed_collection 
// and prints the name and amount of all the seeds
void print_all_seeds(struct seeds seed_collection[MAX_NUM_SEED_TYPES],
                     int total_type_seed) {
    printf(" Seeds at your disposal:\n");
    // Can use same name variable inside a function, because it has local scope
    int counter = 0;               
    // < total_type_seed makes sure that we do not print struct seeds that has
    // NO_SEED as their name 
    while (counter < total_type_seed) {
        printf(" - %d seed(s) with the name '%c'\n",
                 seed_collection[counter].amount,
                 seed_collection[counter].name);
                 
        counter++;
    }
}

// Loops through seed_collection
// Prints the name and amount of the seed name given by the user
// Prints about invalid seed name if there's no seed with the name given
void print_one_seed(char command2, 
                    struct seeds seed_collection[MAX_NUM_SEED_TYPES],
                    int total_type_seed) {
    int loop = 0;
    int keep_looping = 1;
    while (loop < total_type_seed) {
        if (command2 == seed_collection[loop].name &&
            keep_looping == 1) {
            printf(" There are %d seeds with the name '%c'\n", 
                     seed_collection[loop].amount,
                     seed_collection[loop].name); 
            // Found that the seed is in the seed collection            
            keep_looping = 0;
        }
        loop++;           
    }
    // There's no seed with the name given by the user
    if (keep_looping != 0) {
        printf(" There is no seed with the name '%c'\n", command2);    
    }
}
    
// Prints the structs land (including locating where the
// farmer is)

void print_land(struct land farm_land[LAND_SIZE][LAND_SIZE],
                struct farmer cse_farmer) {
    printf("|---|---|---|---|---|---|---|---|\n");
    int i = 0;
    while (i < LAND_SIZE) {
        print_top_row(farm_land, i);
        //only prints mid and bottom row when the farmer
        //is in that row
        if (i == cse_farmer.curr_row) {
            print_farmer_row(farm_land, cse_farmer);
        }
        printf("|---|---|---|---|---|---|---|---|\n");
        i++;
    }
}

// Function to change direction and and move around the land
void change_dir_and_move(char command,
                         struct farmer *pointer) {
    // To move to an adjacent struct land,
    // the farmer must already be facing that direction
    if (pointer->curr_dir != command) {
        pointer->curr_dir = command;
    }
    
    else {
        if (command == '>') {
            pointer->curr_col++;
            // Max column boundary check
            if (pointer->curr_col >= LAND_SIZE) {
                pointer->curr_col = (LAND_SIZE - 1);
            }
        }  
                 
        else if (command == '<') {           
            pointer->curr_col--; 
            // Min column boundary check
            if (pointer->curr_col < 0) {
                pointer->curr_col = 0;
            }          
        }
        
        else if (command == '^') {                          
            pointer->curr_row--;
            // Min row boundary check
            if (pointer->curr_row < 0) {
                pointer->curr_row = 0;
            }
                        
        }  
              
        else if (command == 'v') {                  
            pointer->curr_row++;
            // Max row boundary check
            if (pointer->curr_row >= LAND_SIZE) {
                pointer->curr_row = (LAND_SIZE - 1);
            }
        }                
    }    
} 

// Function to water the adjacent land
void water_adjacent_land(struct farmer cse_farmer,
                         struct land farm_land[LAND_SIZE][LAND_SIZE]) {
                         
    if (cse_farmer.curr_dir == '>' &&
        cse_farmer.curr_col < (LAND_SIZE + 1)) {
        farm_land[cse_farmer.curr_row][cse_farmer.curr_col + 1].is_watered = 1;
    }
    
    else if (cse_farmer.curr_dir == '<' &&
             cse_farmer.curr_col > 0) {
        farm_land[cse_farmer.curr_row][cse_farmer.curr_col - 1].is_watered = 1;
    }
    
    else if (cse_farmer.curr_dir == '^' && 
             cse_farmer.curr_row > 0) {
        farm_land[cse_farmer.curr_row - 1][cse_farmer.curr_col].is_watered = 1;
    }
    
    else if (cse_farmer.curr_dir == 'v' &&
             cse_farmer.curr_row < (LAND_SIZE - 1)) {
        farm_land[cse_farmer.curr_row + 1][cse_farmer.curr_col].is_watered = 1;
    }
}

// Function to plant seed to the adjacent land
void seed_adjacent_land(struct farmer cse_farmer, 
                        struct land farm_land[LAND_SIZE][LAND_SIZE],
                        char seed_name_farmer) {
    // Trying to plant a seed or water into a land that
    // is outside the boundary of the farm will not do anything.                  
    if (cse_farmer.curr_dir == '>' &&
        cse_farmer.curr_col < (LAND_SIZE + 1)) {
        farm_land[cse_farmer.curr_row][cse_farmer.curr_col + 1].seed_name =
                                                           seed_name_farmer;
    }
    
    else if (cse_farmer.curr_dir == '<' &&
             cse_farmer.curr_col > 0) {
        farm_land[cse_farmer.curr_row][cse_farmer.curr_col - 1].seed_name =
                                                           seed_name_farmer;
    }
    
    else if (cse_farmer.curr_dir == '^' &&
             cse_farmer.curr_row > 0) {
        farm_land[cse_farmer.curr_row - 1][cse_farmer.curr_col].seed_name =
                                                           seed_name_farmer;
    }
    
    else if (cse_farmer.curr_dir == 'v' &&
             cse_farmer.curr_row < (LAND_SIZE - 1)) {
        farm_land[cse_farmer.curr_row + 1][cse_farmer.curr_col].seed_name =
                                                           seed_name_farmer;
    }
}

// Function to checks if that seed type is with the farmer
void seed_name_check(struct seeds seed_collection[MAX_NUM_SEED_TYPES],
                     char seed_name,
                     struct farmer cse_farmer, 
                     struct land farm_land[LAND_SIZE][LAND_SIZE]) {
    int seed_name_index = 0;   
    int no_seeds_check = -1;              
    while (seed_name_index < MAX_NUM_SEED_TYPES && (no_seeds_check == -1)) {
        if (seed_collection[seed_name_index].name == seed_name) {                                 
            no_seeds_check = seed_name_index;            
        }
        seed_name_index++; 
    }
    // if return == -1
    if (no_seeds_check == -1 ) {   
        printf(" There is no seed with the name '%c'\n",
                 seed_name);
    }
    else {    
        scatter_seeds(cse_farmer, farm_land, seed_collection,
                      seed_name, no_seeds_check);  
    }    
}

// Function for scattering seeds
void scatter_seeds(struct farmer cse_farmer, 
                   struct land farm_land[LAND_SIZE][LAND_SIZE],
                   struct seeds seed_collection[MAX_NUM_SEED_TYPES], 
                   char seed_name,
                   int seed_name_index) {
    
        
    if (cse_farmer.curr_dir == '^' ||
        cse_farmer.curr_dir == '<') {
        printf(" You cannot scatter seeds ^ or <\n");
    }
    else if (cse_farmer.curr_dir == '>') {
        // A line of seeds will be planted, starting at the farmer,
        // going until either you run out of seeds, 
        // or we reach the rightmost edge of the farm.
        int col = cse_farmer.curr_col;
        while (col < LAND_SIZE &&
              (seed_collection[seed_name_index].amount != 0)) {
            farm_land[cse_farmer.curr_row][col].seed_name = seed_name;
            col++;
            seed_update_function(seed_collection, seed_name);            
        }
    }
    
    else if (cse_farmer.curr_dir == 'v') {
        // A line of seeds should be planted, starting at the farmer,
        // going until either you run out of seeds,
        // or we reach the bottom of the far
        int row = cse_farmer.curr_row;
        while (row < LAND_SIZE &&
              (seed_collection[seed_name_index].amount != 0)) {
            farm_land[row][cse_farmer.curr_col].seed_name = seed_name;
            row++;
            seed_update_function(seed_collection, seed_name);            
        }
    }    
}

// Function to alter the amount of seeds to account for the seeds planted
void seed_update_function(struct seeds seed_collection[MAX_NUM_SEED_TYPES],
                          char seed_name ) {
    int i = 0;
    while (i < MAX_NUM_SEED_TYPES) {
        if (seed_collection[i].name == seed_name) {
            seed_collection[i].amount--;
        }        
        i++;
    } 
}

// Function to square water a particular size of farm land
void square_watering(int size, 
                     struct land farm_land[LAND_SIZE][LAND_SIZE],
                     struct farmer cse_farmer) {
    
    int row = cse_farmer.curr_row + size;
    // If it exceeds the max row farm size
    if (row >= LAND_SIZE) {
        row = LAND_SIZE - 1;
    } 
    int keep_looping_row = 1;
    while (row >= cse_farmer.curr_row - size && keep_looping_row == 1) {
        int col = cse_farmer.curr_col + size;
        // If it exceeds the max column farm size
        if (col >= LAND_SIZE) {
            col = LAND_SIZE - 1;
        }            
        int keep_looping_col = 1;
        while (col >= cse_farmer.curr_col - size && keep_looping_col == 1) {
            farm_land[row][col].is_watered = 1;
            col--;
            
            // We are watering column land from east to west
            // So if column is below min column value i.e. 0 
            // the while loop will end as the keep_looping_col
            // condition becomes false
            if (col < 0) {
                keep_looping_col = 0;
            }
        }        
        row--;
        // We are watering row land from south to north
        // So if row is below min row value i.e. 0 
        // the while loop will end as the keep_looping_row
        // condition becomes false
        if (row < 0 ) {
            keep_looping_row = 0;  
        }
    }
}

// Advancing to the next day
// Function to update the land after advancing to next day
void advance_next_day(struct land farm_land[LAND_SIZE][LAND_SIZE],
                      struct seeds seed_collection[MAX_NUM_SEED_TYPES]) {
    int row = 0;    
    while (row < LAND_SIZE) {    
        int col = 0;
        while (col < LAND_SIZE) {
            // If the seed has been planted AND watered,
            // then it ready to be harvested
            // It will be displayed as uppercase of that letter
            if (farm_land[row][col].is_watered == 1 && 
                farm_land[row][col].seed_name >= 'a' && 
                farm_land[row][col].seed_name <= 'z') {
                             
                // upper case the seed found
                farm_land[row][col].seed_name -= 32;                                                     
                // We need the farm unwatered for the start of the day                                                                 
                farm_land[row][col].is_watered = 0;
               
                    
            }
            else {
                // If the seed isn't watered
                // OR the harvested plants are not harvested      
                // The seed disappears                
                farm_land[row][col].seed_name = NO_SEED; 
            }
            col++;
        }
        row++;
    }
}

// Function to harvest adjacent land
// To access the plant next to the current farmer postion and direction 
void harvest_adjacent_land(struct land farm_land[LAND_SIZE][LAND_SIZE],
                           struct seeds seed_collection[MAX_NUM_SEED_TYPES], 
                           struct farmer cse_farmer) {
    
    int row = cse_farmer.curr_row;           
    int col = cse_farmer.curr_col;           
    if (cse_farmer.curr_dir == '>') {
        col++;       
    }  
    
    else if (cse_farmer.curr_dir == '<') {
        col--;
    }
    
    else if (cse_farmer.curr_dir == 'v') {
        row++;
    }
    
    else if (cse_farmer.curr_dir == '^') {
        row--;
    } 
    // Land boundary check 
    if (row >= 0        && 
        row < LAND_SIZE && 
        col >= 0        && 
        col < LAND_SIZE) {
   
        harvested_seed_update(farm_land,
                              seed_collection,
                              row,
                              col);
    }     
} 

// Function to harvest adjacent land
// Function to update the seeds farmer got by harvesting the plants
void harvested_seed_update(struct land farm_land[LAND_SIZE][LAND_SIZE],
                           struct seeds seed_collection[MAX_NUM_SEED_TYPES],
                           int row, 
                           int col) {
               
    if (farm_land[row][col].seed_name >= 'A' && 
        farm_land[row][col].seed_name <= 'Z') {
        
        char seed_name = (farm_land[row][col].seed_name += 32);
        int index = 0;
        int keep_looping = 1;
        while (keep_looping == 1) {
            // To match the harvested plant with the
            // seeds in the seed collection
            if (seed_collection[index].name == seed_name) {
                printf(" Plant '%c' was harvested, resulting in 5 '%c' seed(s)\n"
                        , seed_name - 32, seed_name);
                // and then increasing the amount by 5
                seed_collection[index].amount += 5;
                // Found the seed type we harvested, we exit the while loop 
                // by making the condtion false
                keep_looping = 0;
                // Clearing the land after harvesting
                farm_land[row][col].seed_name = NO_SEED;
            }
            index++;
        }
                    
    }
}

// Function to trade seeds
// Function to check if there are sufficient amount of seeds to be traded
void check_for_trade_seed(char seed_name,
                          int seed_amount, 
                          struct seeds seed_collection[MAX_NUM_SEED_TYPES], 
                          char trade_for_seed,
                          int *total_type_seed_ptr) {
    int index = 0;
    int keep_looping = 1;
    while (index < MAX_NUM_SEED_TYPES) {
        if (seed_collection[index].name == seed_name &&
            keep_looping == 1) {        
            if (seed_collection[index].amount < seed_amount) {
                printf(" You don't have enough seeds to be traded\n");                
            }
            else {
                // Calling the function for trading
                // Found the seed farmer wishes to trade at index 'index'
                trade_seeds(index,
                            seed_amount, 
                            seed_collection, 
                            trade_for_seed,
                            total_type_seed_ptr);
            }
            // Found the seed farmer wishes to trade in the seed_collection
            //so making the while loop condtion false            
            keep_looping = 0;
        }
        index++;        
    }
    // If keep_looping is still 1 means there's no seed with that seed name
    // in the seed_collection
    if (keep_looping == 1) {
        printf(" You don't have the seeds to be traded\n");
    }
}

// Function to trade seeds
// and update the amount of seed traded in and seed traded for
void trade_seeds(int index,
                 int seed_amount, 
                 struct seeds seed_collection[MAX_NUM_SEED_TYPES], 
                 char trade_for_seed,
                 int *total_type_seed_ptr) {
    int counter = 0;
    int keep_looping = 1;
    while (counter < MAX_NUM_SEED_TYPES) {
        if (seed_collection[counter].name == trade_for_seed) {
            // Increase amount for the seeds gained
            seed_collection[counter].amount += seed_amount;
            // Decrease the amount of seeeds traded
            // Need to decrease the amount of seeds no matter
            // the seed traded in is new or not 
            seed_collection[index].amount -= seed_amount;
            keep_looping = 0;
        }       
        counter++;        
    }
    
    // If keep_looping is still 1 means we are trading in a new seed
    // which needs to be displayed first
    if (keep_looping == 1) {
        new_seed_update(total_type_seed_ptr,
                        seed_collection,
                        trade_for_seed,    
                        seed_amount,
                        index);
    }
}

// Function to trade seeds if there's a new seed
// Update the seed_collection to display information about new seed first
void new_seed_update(int *total_type_seed_ptr,
                     struct seeds seed_collection[MAX_NUM_SEED_TYPES],
                     char trade_for_seed,
                     int seed_amount,
                     int index) {
    int new_index = *total_type_seed_ptr;
    
    // Incrementing the value of the total types of seeds by 1
    *total_type_seed_ptr = *total_type_seed_ptr + 1;
    while (new_index > 0) {
        // Making the values move one place up 
        // and making space for new seed to take index 0   
        seed_collection[new_index].name = seed_collection[new_index - 1].name;
        seed_collection[new_index].amount = seed_collection[new_index - 1].amount;
        new_index--;
    }
    // Now replaing the values at index 0 for the new seed
    seed_collection[0].name = trade_for_seed;
    seed_collection[0].amount = seed_amount;
    seed_collection[index + 1].amount -= seed_amount;        
}  

// Function to decide wether it will kill the seeds
// or clear the land because a negative number was entered as a minimum condition
void kill_or_clear_the_seed(int min_num_plants_to_die,
                            struct land farm_land[LAND_SIZE][LAND_SIZE],
                            char command2) {
    if (min_num_plants_to_die <= 0) {
        // Function call to clear the land that has seeds/plants
        // Water state is not affected
        clear_the_seeded_land(farm_land);
        
    }
    else {
        disaster_drought_wind_storm(min_num_plants_to_die,
                                    farm_land,                                 
                                    command2);
    }
}  
 
// Function to change the state of the land depending on the disaster   
void disaster_drought_wind_storm(int min_num_plants_for_disaster,
                                 struct land farm_land[LAND_SIZE][LAND_SIZE],                                
                                 char command2) {
    //a copy of the farm grid to keep track of dead plants
    int to_store_the_dead_plants_coord[LAND_SIZE][LAND_SIZE] = {};
    int row = 0;      
    while (row < LAND_SIZE) {
        int col = 0;               
        while (col < LAND_SIZE) {
            //int no_of_plant = 0;             
            int row_start = row - 1;                       
            int row_end = row + 1;                                          
            int no_of_plant = to_calculate_dead_plants(row,
                                                       col,
                                                       row_start,
                                                       row_end,
                                                       farm_land);
            //in case of drought
            if (command2 == 'd' && 
                no_of_plant >= min_num_plants_for_disaster) {
                to_store_the_dead_plants_coord[row][col] = 1;
            }
            //in case of wind storm
            else if (command2 == 'w' && 
                no_of_plant < min_num_plants_for_disaster) {
                to_store_the_dead_plants_coord[row][col] = 1;
            }
            col++;
        }
        row++;
    }
    remove_dead_plants(to_store_the_dead_plants_coord,
                       farm_land);                       
}
           
// Function to calculate the number of plants that will die in the disaster
int to_calculate_dead_plants(int row,
                             int col,
                             int row_start,
                             int row_end,
                             struct land farm_land[LAND_SIZE][LAND_SIZE]) {
    int no_of_plant = 0;
    while (row_start <= row_end) {
        // Intializing boundaries for checking the
        // number of plants affecting a particular plant  
        // Adjacent lands are the lands that are within
        // 1 column/row away from a particular land
        int col_start = col - 1;                                
        int col_end = col + 1;                 
        int *row_start_ptr = &row_start;
        int *row_end_ptr = &row_end;
        int *col_start_ptr = &col_start;
        int *col_end_ptr = &col_end;       
        
        // Function call to clamp the values of row_start, row_end
        // col_start and col_end within land limit                
        edge_boundary_check_disaster(row_start_ptr,
                                     row_end_ptr,
                                     col_start_ptr,
                                     col_end_ptr);
        
        while (col_start <= col_end) {
            if (row_start == row && col_start == col) { 
                NULL;
            }
            else {
                // Function to calculate the total number
                // of plants around a particular plant                                                                               
                no_of_plant = farm_land_not_empty(no_of_plant,
                                                  row_start,
                                                  col_start,
                                                  farm_land);  
            }                
            col_start++;
            
        }
        row_start++;                           
    }
    return no_of_plant;        
}

// Edge boundaries check and 
// clamping it back into land limits. 
void edge_boundary_check_disaster(int *row_start_ptr,
                                  int *row_end_ptr,
                                  int *col_start_ptr,
                                  int *col_end_ptr) {              
    if (*row_start_ptr < 0) {
        *row_start_ptr = 0;   
    } 
    if (*row_end_ptr >= LAND_SIZE) {
        *row_end_ptr = LAND_SIZE - 1;
    }
    if (*col_start_ptr < 0) {
        *col_start_ptr = 1;
    }
    if (*col_end_ptr >= LAND_SIZE) {
        *col_end_ptr = LAND_SIZE - 1;
    }
} 

// Function to check the number of plant around a particular plant
// and increment no_of_plant accordingly
int farm_land_not_empty(int no_of_plant,
                        int row_start,
                        int col_start,
                        struct land farm_land[LAND_SIZE][LAND_SIZE]) {
    if (farm_land[row_start][col_start].seed_name != NO_SEED) {
        no_of_plant++;
    }
    return no_of_plant;
}

// Function to kill and remove the plants that didn't survive      
void remove_dead_plants(int to_store_the_dead_plants_coord[LAND_SIZE][LAND_SIZE],
                        struct land farm_land[LAND_SIZE][LAND_SIZE]) {                                                
    int row = 0;
    while (row < LAND_SIZE) {
        int col = 0;
        while (col < LAND_SIZE) {
            if (to_store_the_dead_plants_coord[row][col] == 1) {
                // Making the land barren if the plant died
                farm_land[row][col].seed_name = NO_SEED;
            }            
            col++;
        }
        row++;
    }
}

// Function to clear the land that has seeds/plants on it
void clear_the_seeded_land(struct land farm_land[LAND_SIZE][LAND_SIZE]) {
    int row = 0;
    while (row < LAND_SIZE) {
        int col = 0;
        while (col <  LAND_SIZE) {
            farm_land[row][col].seed_name = NO_SEED;
            col++;
        }
        row++;
    }
}

// Initializing farmer and the farm land
// Initialises struct farmer to its default state upon starting
// in which the farmer will be on the top left of the farm
// facing to the right (as noted by '>')
struct farmer initialise_farmer(struct farmer cse_farmer) {
    cse_farmer.curr_col = 0;
    cse_farmer.curr_row = 0;
    cse_farmer.curr_dir = '>';
    return cse_farmer;
}

// Initialises a 2d array of struct land to its default state 
// upon starting, which is that all land is unwatered and
// contains no seed
void initialise_land(struct land farm_land[LAND_SIZE][LAND_SIZE]) {
    int i = 0;
    while (i < LAND_SIZE) {
        int j = 0;
        while (j < LAND_SIZE) {
            farm_land[i][j].is_watered = FALSE;
            farm_land[i][j].seed_name = NO_SEED;
            j++;
        }
        i++;
    }
}

// Initialises struct farmer to its default state upon starting,
// which that all names are initialised as NO_SEED and its
// amount is 0
void initialise_seeds(struct seeds seed_collection[MAX_NUM_SEED_TYPES]) {
    int i = 0;
    while (i < MAX_NUM_SEED_TYPES) {
        seed_collection[i].amount = 0;
        seed_collection[i].name = NO_SEED;
        i++;
    }
}

////////////////////////////////
//      Helper Functions      //
////////////////////////////////

// prints the top row of a particular struct land
void print_top_row(struct land farm_land[LAND_SIZE][LAND_SIZE], int row) {
    int j = 0;
    while (j < LAND_SIZE) {
        printf("|");
        printf("%c", farm_land[row][j].seed_name);
        printf(" ");
        if (farm_land[row][j].is_watered == TRUE) {
            printf("W");
        }
        
        else {
            printf(" ");
        }
        j++;
    }
    printf("|");
    printf("\n");
}

// prints the 2 additional row when a farmer is in
// a particular row
void print_farmer_row(struct land farm_land[LAND_SIZE][LAND_SIZE], 
                      struct farmer cse_farmer)  {
    int j = 0;
    while (j < LAND_SIZE) {
        printf("|");
        if (j == cse_farmer.curr_col) {
            if (cse_farmer.curr_dir == '<') {
                printf("<");
            }
            else {
                printf(" ");
            }
            
            if (cse_farmer.curr_dir == '^') {
                printf("^");
            }
            else {
                printf("f");
            }
            
            if (cse_farmer.curr_dir == '>') {
                printf(">");
            }
            else {
                printf(" ");
            }
        }
        
        else {
            printf("   ");
        }
        j++;
    }
    printf("|");
    printf("\n");
    j = 0;
    while (j < LAND_SIZE) {
        printf("|");
        if (j == cse_farmer.curr_col) {
            printf(" ");
            if (cse_farmer.curr_dir == 'v') {
                printf("v");
            }
            
            else if (cse_farmer.curr_dir == '^') {
                printf("f");
            }
            
            else {
                printf(" ");
            }
            printf(" ");
        }
        
        else {
            printf("   ");
        }
        j++;
    }
    printf("|");
    printf("\n");
}
