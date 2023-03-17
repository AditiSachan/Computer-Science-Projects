//
// Assignment 2 21T3 COMP1511: CS Pizzeria
// pizzeria.c
//
// This program was written by Aditi Sachan (z5379867)
// on 07-11-2021
//
// Managing a pizzeria which includes keeping track of orders, stock and finances.
//
// Version 1.0.0: Release

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "pizzeria.h"
#include "save_string.h"


struct ingredient {
    char name[MAX_STR_LENGTH];
    int amount;
    double price;
    struct ingredient *next;
};

struct order {
    char customer[MAX_STR_LENGTH];
    char pizza_name[MAX_STR_LENGTH];
    double price;
    int time_allowed;
    struct ingredient *ingredients;
    struct order *next;
};

struct pizzeria {
    struct ingredient *stock;
    struct order *selected;
    struct order *orders;
};

//////////////////////////////////////////////////////////////////////
/////////////////////// FUNCTIONS PROTOTYPE //////////////////////////
//////////////////////////////////////////////////////////////////////

// Prints a single order
void print_order(
    int num,
    char *customer,
    char *pizza_name,
    double price,
    int time_allowed
);

// Function prints an ingredient given the name, amount and price in the required format.
// This will be needed for stage 2.
void print_ingredient(char *name, 
                      int amount, 
                      double price);

// Function will traverse through the ingredieents list
void print_all_ingredients(struct ingredient *ingredient);

// Function will free the memory of ingredients inside the memory
void free_ingredients(struct ingredient *to_delete_ingredients);

// Function to loop through ingredients and find ingredient with same name
// and to see if it has enough amount in stock,
// if not returns INSUFFICIENT_STOCK
int find_ingredient(struct ingredient *current_ingredients, 
                    struct pizzeria *pizzeria);

// Function changes the amount of ingredient and 
// frees the ingredient in stock if the amount is 0
int reduce_amount_ingredient(struct pizzeria *pizzeria, 
                             struct ingredient *current_ingredients, 
                             struct ingredient *current_stock_ingredient);
                             
////////////////////////////////////////////////////////////////////////
//                         Stage 1 Functions                          //
////////////////////////////////////////////////////////////////////////

// Create a new Pizzeria and 
// return a pointer to it.
// See the header file "pizzeria.h" for detailed documentation.
struct pizzeria *create_pizzeria() {

    // Allocates memory to store a `struct pizzeria` and returns a pointer to
    // it. The variable `new` holds this pointer!
    struct pizzeria *new = malloc(sizeof(struct pizzeria));

    new->orders = NULL;
    new->selected = NULL;
    new->stock = NULL;

    return new;
}

// INSERT ORDER INTO PIZZERIA - Command 'o'
//
// Add a new Order to the Pizzeria and return an int indicating the
// resulting status of the new Order.
// See the header file "pizzeria.h" for detailed documentation.
int add_order(
    struct pizzeria *pizzeria,
    char customer[MAX_STR_LENGTH],
    char pizza_name[MAX_STR_LENGTH],
    double price,
    int time_allowed
) {

    struct order *current_order = malloc(sizeof(struct order));       
    strcpy(current_order->customer, customer);   
    strcpy(current_order->pizza_name, pizza_name);
    current_order->ingredients = NULL;
    
    // invalid price case
    if (price < 0 ) {
        return INVALID_PRICE;
    }
    else {
        current_order->price = price;
    }
    // invalid time case
    if (time_allowed <= 0) {
        return INVALID_TIME;
    }
    else {
        current_order->time_allowed = time_allowed;
    }
    // if the order list is empty
    if (pizzeria->orders == NULL) {
        current_order->next = NULL;
        pizzeria->orders = current_order;               
    }
    else {
        struct order *current = pizzeria->orders;       
        while (current->next != NULL) {
            current=current->next;           
        }
        current->next = current_order;        
        current->next->next = NULL;        
    }    
    return SUCCESS;
}

// PRINT ALL ORDERS OF THE PIZZERIA - Command 'p'
//
// Print all orders of the Pizzeria given and return nothing.
// See the header file "pizzeria.h" for detailed documentation.
void print_all_orders(struct pizzeria *pizzeria) {

    struct order *print_current_order = pizzeria->orders;
    int order_no = 1;
    while (print_current_order != NULL) {
        print_order(order_no,
                    print_current_order->customer, 
                    print_current_order->pizza_name, 
                    print_current_order->price, 
                    print_current_order->time_allowed);
        print_current_order = print_current_order->next;
        order_no++;
    } 
    print_selected_order(pizzeria);
    return;
}

// GET THE NEXT DEADLINE - Command '!'
//
// Return the shortest `time_allowed` among the orders.
// See the header file "pizzeria.h" for detailed documentation.
int next_deadline(struct pizzeria *pizzeria) {
    // if no orders
    if (pizzeria->orders == NULL) {
        return INVALID_CALL;
    }
    struct order *current_order = pizzeria->orders;
    int lowest_deadline = current_order->time_allowed;
    while (current_order != NULL) {
        if (current_order->time_allowed < lowest_deadline) {
            lowest_deadline = current_order->time_allowed;
        }
        current_order = current_order->next;
    }
    return lowest_deadline;
}

////////////////////////////////////////////////////////////////////////
//                         Stage 2 Functions                          //
////////////////////////////////////////////////////////////////////////

// SELECT THE NEXT ORDER IN THE PIZZERIA - Command '>'
//
// Given a Pizzeria, sets the selected order to the order after the
// currently selected order.
// See the header file "pizzeria.h" for detailed documentation.
void select_next_order(struct pizzeria *pizzeria) {

    struct order *current_selected = pizzeria->orders;
    
    // empty orders list
    if (pizzeria->orders == NULL) {
        return;
    }
    // nothing is selected yet so by default first order should be selected
    else if (pizzeria->selected == NULL) {
        pizzeria->selected = current_selected;
    }
    else {
        int keep_looping = 1;
        while (current_selected != NULL && keep_looping == 1) {
            if (pizzeria->selected == current_selected) {
                pizzeria->selected = current_selected->next;
                keep_looping = 0;
            }
            current_selected = current_selected->next;  
        }
    }
    return;
}

// SELECT THE PREVIOUS ORDER IN THE PIZZERIA - Command '<'
//
// Given a Pizzeria, sets the selected order to the order before the
// currently selected order.
// See the header file "pizzeria.h" for detailed documentation.
void select_previous_order(struct pizzeria *pizzeria) {

    struct order *current_selected = pizzeria->orders;
    // empty orders list
    if (pizzeria->orders == NULL) {
        return;
    }
    
    // nothing is selected yet so default last order 
    else if (pizzeria->selected == NULL) {
        while (current_selected->next != NULL) {
            current_selected = current_selected->next;
        }
        pizzeria->selected = current_selected;
    }
    
    // if at the last position, selected goes null for no selected orders
    else if (pizzeria->selected == pizzeria->orders) {
        pizzeria->selected = NULL;
    }
   
    else {
        while (current_selected->next != NULL) {
            if (current_selected->next == pizzeria->selected) {
                pizzeria->selected = current_selected;
            }
            current_selected = current_selected->next;
        }
    }               
    return;
}

// PRINT DETAILS OF THE SELECTED ORDER
//
// Given a Pizzeria, prints the selected order's details and its list of
// ingredients. To print the list of ingredients, use the supplied
// `print_ingredient` function.
// See the header file "pizzeria.h" for detailed documentation.
void print_selected_order(struct pizzeria *pizzeria) {

    if (pizzeria->selected == NULL) {
            
        printf("\nNo selected order.\n");
    }
    else {
        printf("\nThe selected order is %s's %s pizza ($%.2lf) due in %d minutes.\n",
                        pizzeria->selected->customer,
                        pizzeria->selected->pizza_name,
                        pizzeria->selected->price,
                        pizzeria->selected->time_allowed);
     
        // print individual ingredient_name        
        print_all_ingredients(pizzeria->selected->ingredients);      
    }
    return;
        
}

// ADD INGREDIENT TO THE SELECTED ORDER - Command 'i'
//
// Given a Pizzeria, adds an ingredient to the currently selected order. This
// ingredient must be inserted in alphabetical order.
// See the header file "pizzeria.h" for detailed documentation.
int add_ingredient(
    struct pizzeria *pizzeria,
    char *ingredient_name,
    int amount,
    double price
) {
    
    
    // taking care of invalid cases
    if (pizzeria->selected == NULL) {
        return INVALID_ORDER;
    }
    else if (price < 0) {
        return INVALID_PRICE;
    }
    else if (amount <= 0) {
        return INVALID_AMOUNT;
    }
    else {
        // space for new ingredient and its values
        struct ingredient *new_ingredient = malloc(sizeof(struct ingredient));
        strcpy(new_ingredient->name, ingredient_name);
        new_ingredient->amount = amount;
        new_ingredient->price = price;
        new_ingredient->next = NULL;
        
        // if already has that ingredient
        int keep_looping = 1;
        struct ingredient *current_ingredient = pizzeria->selected->ingredients;
       
        while (current_ingredient != NULL) {
            if (strcmp(current_ingredient->name, ingredient_name) == 0) {
                 
                current_ingredient->amount = amount + current_ingredient->amount;
                
                keep_looping = 0;
                free(new_ingredient);
            }
            current_ingredient = current_ingredient->next;
        }
              
        // reinitialising current_ingredient
        current_ingredient = pizzeria->selected->ingredients;
        
        // if theres no previous element in the list
        if (current_ingredient == NULL) {           
            pizzeria->selected->ingredients = new_ingredient;
            new_ingredient->next = NULL;
        }
        // if ingredient needs to be inserted at start of the list
        else if (strcmp(ingredient_name, current_ingredient->name) < 0) {
            new_ingredient->next  = current_ingredient;
            pizzeria->selected->ingredients = new_ingredient;
            
        }  
        else { 
            // comparing with every ingredient apart from last ingredient             
            while (keep_looping == 1 &&                   
                current_ingredient->next != NULL &&
                strcmp(ingredient_name, current_ingredient->next->name) > 0) {              
                current_ingredient = current_ingredient->next;                            
            }
               
            
            if (keep_looping == 1 && current_ingredient->next != NULL) {
                new_ingredient->next = current_ingredient->next;              
                current_ingredient->next = new_ingredient;
                
            }
            
            // if the ingredient has to be at last 
            // current_ingredient->next will be null due to previous while loop
            else if (keep_looping == 1 && current_ingredient->next == NULL) {
                current_ingredient->next = new_ingredient;
                new_ingredient->next = NULL;
            }   
        }
    }
    return SUCCESS;
}

// CALCULATE TOTAL PROFIT TO BE MADE FROM SELECTED ORDER - Command 't'
//
// Given a Pizzeria, calculates how much profit is to be made from the currently
// selected order.
// See the header file "pizzeria.h" for detailed documentation.
double calculate_total_profit(struct pizzeria *pizzeria) {

    double profit = 0;
    double sum_ingredient_price = 0;
    struct order *current_order = pizzeria->selected;
    
    // if no selected order
    if (current_order == NULL) {
        return INVALID_ORDER;
    }
    else {
        struct ingredient *current_order_ingredient = pizzeria->selected->ingredients;
       
        while (current_order_ingredient != NULL) {
            sum_ingredient_price += 
            current_order_ingredient->amount * current_order_ingredient->price;
            current_order_ingredient = current_order_ingredient->next;
        }       
    }
    profit = current_order->price - sum_ingredient_price;
    return profit;
}

////////////////////////////////////////////////////////////////////////
//                         Stage 3 Functions                          //
////////////////////////////////////////////////////////////////////////

// CANCEL ORDER IN PIZZERIA - Command 'c'
//
// Cancel the currently selected order in the pizzeria.
// Call free on the selected order, and free all associated memory
// See the header file "pizzeria.h" for detailed documentation.
int cancel_order(struct pizzeria *pizzeria) {

    if (pizzeria->selected== NULL) {
        return INVALID_ORDER;
    }
    else if (pizzeria->selected == pizzeria->orders) {      
        struct order *to_delete = pizzeria->selected;
        pizzeria->orders = pizzeria->orders->next;
        pizzeria->selected = pizzeria->orders;
        // first free the ingredients
        // will free the memory of ingredients inside the selected order
        free_ingredients(to_delete->ingredients);       
        free(to_delete);
    }
    else {
        int keep_looping = 1;
        struct order *previous_to_delete_order = pizzeria->orders;
        while (keep_looping == 1 && 
               previous_to_delete_order->next != NULL ) {

            if (pizzeria->selected == previous_to_delete_order->next) {
                // first free the ingredients
                // will free the memory of ingredients inside the selected order
                free_ingredients(pizzeria->selected->ingredients);
                
                // temp holding variable for to be deleted order
                struct order *to_delete = previous_to_delete_order->next;
                // change the next of lists
                previous_to_delete_order->next =
                previous_to_delete_order->next->next;
                // update the selected order
                pizzeria->selected = previous_to_delete_order->next;                               
                free(to_delete);
                keep_looping = 0;               
            }
            previous_to_delete_order = previous_to_delete_order->next;
        }            
    }                             
    return SUCCESS;
}

// FREE THE GIVEN PIZZERIA
//
// Call free on the given pizzeria, and free all associated memory.
// See the header file "pizzeria.h" for detailed documentation.
void free_pizzeria(struct pizzeria *pizzeria) {
   
    // freeing the orders    
    struct order *free_orders = pizzeria->orders;
    while (free_orders != NULL) {
        struct order *prev_order = free_orders;
        // freeing the individual ingredient_name
        struct ingredient *curr_ingred = free_orders->ingredients;
        while (curr_ingred != NULL) {
            struct ingredient *prev_ingred = curr_ingred;
            curr_ingred = curr_ingred->next;
            free(prev_ingred);
        }
        free_orders = free_orders->next;
        free(prev_order);
    }
  
    // freeing the stock
    struct ingredient *curr_stock = pizzeria->stock;
    while (curr_stock != NULL) {
        struct ingredient *prev_stock = curr_stock;
        curr_stock = curr_stock->next;
        free(prev_stock);     
    }
    free(pizzeria);
    return;
}

// REFILLS THE STOCK IN THE PIZZERIA - Command 'r'
//
// Given an ingredient and its information, refills this in the stock of
// the given Pizzeria
// See the header file "pizzeria.h" for detailed documentation.
int refill_stock(
    struct pizzeria *pizzeria,
    char ingredient_name[MAX_STR_LENGTH],
    int amount,
    double price
) {
             
    // taking care of invalid cases   
    if (price < 0) {
        return INVALID_PRICE;
    }
    else if (amount <= 0) {
        return INVALID_AMOUNT;
    }
    else {
        // space for new ingredient and its values
        struct ingredient *new_ingredient_in_stock = malloc(sizeof(struct ingredient));
        strcpy(new_ingredient_in_stock->name, ingredient_name);
        new_ingredient_in_stock->amount = amount;
        new_ingredient_in_stock->price = price;
        new_ingredient_in_stock->next = NULL;
        // already has that ingredient
        int keep_looping = 1;
        struct ingredient *current_ingredient_in_stock = pizzeria->stock;
       
        while (current_ingredient_in_stock != NULL) {
            if (strcmp(current_ingredient_in_stock->name, ingredient_name) == 0) {
                 
                current_ingredient_in_stock->amount =
                amount + current_ingredient_in_stock->amount;
                
                keep_looping = 0;
                free(new_ingredient_in_stock);
            }
            current_ingredient_in_stock = current_ingredient_in_stock->next;
        }        
    
        // reinitialising current_ingredient
        current_ingredient_in_stock = pizzeria->stock;
        
        // if theres no previous element in the list
        if (current_ingredient_in_stock == NULL) {           
            pizzeria->stock = new_ingredient_in_stock;
            new_ingredient_in_stock->next = NULL;
        }
        // if ingredient needs to be inserted at start of the list
        else if (strcmp(ingredient_name, current_ingredient_in_stock->name) < 0) {
            new_ingredient_in_stock->next  = current_ingredient_in_stock;
            pizzeria->stock = new_ingredient_in_stock;
            
        }  
        else { 
            // for every ingredient apart from last ingredient and last ingredient
            
            while (keep_looping == 1 &&                   
                current_ingredient_in_stock->next != NULL &&
                strcmp(ingredient_name, current_ingredient_in_stock->next->name) > 0) {              
                current_ingredient_in_stock = current_ingredient_in_stock->next;                            
            }               
            
            if (keep_looping == 1 && current_ingredient_in_stock->next != NULL) {
                new_ingredient_in_stock->next = current_ingredient_in_stock->next;              
                current_ingredient_in_stock->next = new_ingredient_in_stock;
                
            }
            
            // if the ingredient has to be at last 
            // current_ingredient->next will be null due to previous while loop
            else if (keep_looping == 1 && current_ingredient_in_stock->next == NULL) {
                current_ingredient_in_stock->next = new_ingredient_in_stock;
                new_ingredient_in_stock->next = NULL;
            }   
        }
    }
    return SUCCESS;
}

// PRINTS THE STOCK OF THE PIZZERIA  - Command 's'
//
// Print all ingredients of the stock in the Pizzeria given and return nothing.
// See the header file "pizzeria.h" for detailed documentation.
void print_stock(struct pizzeria *pizzeria) {

    printf("The stock contains:\n");
    if (pizzeria->stock == NULL) {
        NULL; 
    }
    else {       
        print_all_ingredients(pizzeria->stock);
    }
    return;
}

// DETERMINES IF AN ORDER CAN BE COMPLETED - Command '?'
//
// Given a Pizzeria determines if the currently selected order can be completed,
// determined by how much stock is available.
//
// Orders can only be deemed completable if all the ingredients required for
// said order exist in the Pizzeria stock including their amounts.
// See the header file "pizzeria.h" for detailed documentation.
int can_complete_order(struct pizzeria *pizzeria) {

    if (pizzeria->selected == NULL || pizzeria->selected->ingredients == NULL) {
        return INVALID_ORDER;
    }
    else if (pizzeria->stock == NULL) {
        return INSUFFICIENT_STOCK;
    }
    else {
        
        struct ingredient *current_ingredients = pizzeria->selected->ingredients;    
        while (current_ingredients != NULL) {                       
            // traverse through stock list to find the ingredient with same name
            // Function to loop through ingredients and find ingredient with same name
            // and to see if it has enough amount in stock,
            // if not returns INSUFFICIENT_STOCK
            if (find_ingredient(current_ingredients, pizzeria) == INSUFFICIENT_STOCK) {
                return INSUFFICIENT_STOCK;
            }
            current_ingredients = current_ingredients->next;
        }
    }
    return SUCCESS;
}

////////////////////////////////////////////////////////////////////////
//                         Stage 4 Functions                          //
////////////////////////////////////////////////////////////////////////

// ATTEMPT TO COMPLETE AN ORDER - Command '#'
//
// Given a Pizzeria, completes the selected order if possible.
// See the header file "pizzeria.h" for detailed documentation.
int complete_order(struct pizzeria *pizzeria) {

    int result = can_complete_order(pizzeria);
    if (result == INVALID_ORDER) {
        return INVALID_ORDER;
    }
    else if (result == INSUFFICIENT_STOCK) {
        return INSUFFICIENT_STOCK;
    }
    else {
        struct ingredient *current_ingredients = pizzeria->selected->ingredients;    
        while (current_ingredients != NULL) {
            int keep_looping = 1;
            struct ingredient *current_stock_ingredient = pizzeria->stock;
            // changes the amount of ingredient and 
            // frees the ingredient in stock if the amount is 0
            keep_looping = reduce_amount_ingredient(pizzeria, 
                                                    current_ingredients, 
                                                    current_stock_ingredient);    
             
            while (keep_looping == 1 && current_stock_ingredient->next != NULL) {               
                // changes the amount of ingredient and 
                // frees the ingredient in stock if the amount is 0    
                keep_looping = reduce_amount_ingredient(pizzeria, 
                                                        current_ingredients, 
                                                        current_stock_ingredient->next);                            
                current_stock_ingredient = current_stock_ingredient->next;
            }            
            current_ingredients = current_ingredients->next;
        }
        // free the order once completed
        cancel_order(pizzeria);
    }
    return SUCCESS;
}

// SAVES ALL INGREDIENTS IN THE SELECTED ORDER TO A FILE - Command 'S'
//
// Given a Pizzeria, saves the ingredients of the selected order
// to a file as a string.
// See the header file "pizzeria.h" for detailed documentation.
int save_ingredients(struct pizzeria *pizzeria,
                     char *file_name) {
                     
    if (pizzeria->selected == NULL) {
        return INVALID_ORDER;
    }
    else {
        char to_save_ingredient_info[MAX_SAVE_LENGTH];
        char to_concat_ingredient_info[MAX_SAVE_LENGTH];
        
        // for the fist ingredient
        struct ingredient *current_ingredient = pizzeria->selected->ingredients;
        // merging ingredients info together
        sprintf(to_save_ingredient_info, "%s %d %lf\n", current_ingredient->name,
                                                      current_ingredient->amount ,
                                                      current_ingredient->price);                                                      
        strcpy(to_concat_ingredient_info, to_save_ingredient_info);  
        current_ingredient = current_ingredient->next;                                      
        while (current_ingredient != NULL) {            
            sprintf(to_save_ingredient_info, "%s %d %lf\n", current_ingredient->name,
                                                          current_ingredient->amount ,
                                                          current_ingredient->price);
            // merging all ingredients info together      
            strcat(to_concat_ingredient_info, to_save_ingredient_info);
            current_ingredient = current_ingredient->next;
            
        }
        save_string(file_name, to_concat_ingredient_info);  
    }
    
    return SUCCESS;
}

// LOADS ALL INGREDIENTS FROM A FILE INTO THE SELECTED ORDER - Command 'L'
//
// Given a Pizzeria, loads the ingredients of a saved file `file_name` into the
// selected order. This file will always be one that has been saved from using
// the `save_ingredients` function.
// See the header file "pizzeria.h" for detailed documentation.
int load_ingredients(struct pizzeria *pizzeria, 
                     char *file_name) {
                     
    if (pizzeria->selected == NULL) {
        return INVALID_ORDER;
    }
    else {
        
        int amount; 
        double price;
        char name[MAX_STR_LENGTH];;
        char *ingredient_info = load_string(file_name);
       
        // each ingredient info is seperated by "\n"
        char *individual_ingredient = strtok(ingredient_info, "\n");
        while (individual_ingredient != NULL) {
            
            sscanf(individual_ingredient, "%s %d %lf",
                                           name,
                                           &amount, 
                                           &price);
            // adding the ingredients into the selected order
            add_ingredient(pizzeria, name, amount, price);
            individual_ingredient = strtok(NULL, "\n");                  
        }
        // freeing the info about all the ingredients
        free(ingredient_info);
    }
    return SUCCESS;
}

////////////////////////////////////////////////////////////////////////
//               HELPER FUNCTIONS                                     //
////////////////////////////////////////////////////////////////////////


// Function changes the amount of ingredient and 
// frees the ingredient in stock if the amount is 0
int reduce_amount_ingredient(struct pizzeria *pizzeria,
                             struct ingredient *current_ingredients, 
                             struct ingredient *current_stock_ingredient) {
                             
    if (strcmp(current_stock_ingredient->name, current_ingredients->name) == 0) {
        current_stock_ingredient->amount = 
        current_stock_ingredient->amount - current_ingredients->amount; 
        // if amount is zero   
        struct ingredient *stock_ingred = pizzeria->stock;   
        struct ingredient *prev_stock = NULL; 
        while (stock_ingred != NULL && stock_ingred->amount != 0) {    
            prev_stock = stock_ingred;          
            stock_ingred = stock_ingred->next;
        }
        if (stock_ingred != NULL) {
            prev_stock->next = stock_ingred->next;
            free(stock_ingred);
        }
        return 0;  
    }
    return 1;     
}

// Function to loop through ingredients and find ingredient with same name
// and to see if it has enough amount in stock,
// if not returns INSUFFICIENT_STOCK
int find_ingredient(struct ingredient *current_ingredients, 
                    struct pizzeria *pizzeria) {
                    
    struct ingredient *current_stock_ingredient = pizzeria->stock;
    int keep_looping = 1;
    //traverse through stock list to find the ingredient with same name
    while (current_stock_ingredient != NULL && keep_looping == 1) {
        if (strcmp(current_ingredients->name,
                   current_stock_ingredient->name) == 0 &&
            current_ingredients->amount <= current_stock_ingredient->amount) {
            keep_looping = 0;
        }
        current_stock_ingredient = current_stock_ingredient->next;
        if (current_stock_ingredient == NULL && keep_looping == 1) {
            return INSUFFICIENT_STOCK;
        }
    }
    return SUCCESS;
}

// Function will free the memory of ingredients inside the selected order
void free_ingredients(struct ingredient *to_delete_ingredients) {
  
    while (to_delete_ingredients != NULL) {
        struct ingredient *temp = to_delete_ingredients;
        to_delete_ingredients = to_delete_ingredients->next;
        free(temp);     
    }
    return;
}

// Function print individual ingredient_name
void print_all_ingredients(struct ingredient *ingredient) {
       
    while (ingredient != NULL) {        
        print_ingredient(ingredient->name,
                         ingredient->amount,
                         ingredient->price);
        ingredient = ingredient->next;
    }
    return;   
} 
       
// Prints a single order
//
// `print_order` will be given the parameters:
// - `num` -- the integer that represents which order it is sequentially.
// - `customer` -- the name of the customer for that order.
// - `pizza_name` -- the pizza the customer ordered.
// - `price` -- the price the customer is paying for the pizza.
// - `time_allowed` -- the time the customer will wait for the order.
//
// `print_order` assumes all parameters are valid.
//
// `print_order` returns nothing.
//
// This will be needed for Stage 1.
void print_order(
    int num,
    char *customer,
    char *pizza_name,
    double price,
    int time_allowed
) {

    printf("%02d: %s ordered a %s pizza ($%.2lf) due in %d minutes.\n",
        num, customer, pizza_name, price, time_allowed);

    return;
}

// Prints a single ingredient
//
// `print_ingredient` will be given the parameters:
// - `name` -- the string which contains the ingredient's name.
// - `amount` -- how many of the ingredient we either need or have.
// - `price` -- the price the ingredient costs.
//
// `print_ingredient` assumes all parameters are valid.
//
// `print_ingredient` returns nothing.
//
// This will be needed for Stage 2.
void print_ingredient(char *name, int amount, double price) {
    printf("    %s: %d @ $%.2lf\n", name, amount, price);
}
