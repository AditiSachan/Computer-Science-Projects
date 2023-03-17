////////////////////////////////////////////////////////////////////////
// COMP1521 22T2 --- Assignment 2: `bytelocker', a simple file encryptor
// <https://www.cse.unsw.edu.au/~cs1521/22T2/assignments/ass2/index.html>
//
// Written by Aditi Sachan (z5379867) on 01-08-2022.
//
// 2022-07-22   v1.2    Team COMP1521 <cs1521 at cse.unsw.edu.au>

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <stdint.h>
#include <string.h>
#include <sys/stat.h>
#include <unistd.h>
#include <dirent.h>
#include <string.h>

#include "bytelocker.h"

char *generate_random_string(int seed);
void sort_by_count(struct text_find *files, size_t n);
void sort_by_name(char *filenames[], size_t num_files);
void print_permissions(struct stat name);
int my_strrchr(const char *ptr, const char delimiter);
void xor_the_bytes(FILE *input_stream, FILE *output_stream);
char** read_given_dir_for_substring_search(char dir_path_name[MAX_PATH_LEN], char substring_to_check[MAX_SEARCH_LENGTH], char *filenames[], int *index_ptr);
void print_permissions_new(char filename[MAX_PATH_LEN]);
int check_if_directory(char filename[MAX_PATH_LEN]);
int check_if_file_already_exists(char filename[MAX_PATH_LEN], char* filenames[], int *index_ptr);

const char *const MSG_ERROR_FILE_STAT  = "Could not stat file\n";
const char *const MSG_ERROR_FILE_OPEN  = "Could not open file\n";
const char *const MSG_ERROR_CHANGE_DIR = "Could not change directory\n";
const char *const MSG_ERROR_DIRECTORY  =
    "%s cannot be encrypted: bytelocker does not support encrypting directories.\n";
const char *const MSG_ERROR_READ       =
    "%s cannot be encrypted: group does not have permission to read this file.\n";
const char *const MSG_ERROR_WRITE      =
    "%s cannot be encrypted: group does not have permission to write here.\n";
const char *const MSG_ERROR_SEARCH     = "Please enter a search string.\n";
const char *const MSG_ERROR_RESERVED   =
    "'.' and '..' are reserved filenames, please search for something else.\n";



//////////////////////////////////////////////
//                                          //
//              SUBSET 0                    //
//                                          //
//////////////////////////////////////////////

//
//  Read the file permissions of the current directory and print them to stdout.
//
void show_perms(char filename[MAX_PATH_LEN]) {
    // Create a structure s
    struct stat s;
    if (stat(filename, &s) != 0) {
        printf("%s", MSG_ERROR_FILE_STAT);
        return;
    }
    printf("%s: ", filename);

    // will print the permissions in given format
    print_permissions(s);
    printf("%c", '\n');
}

//
//  Prints current working directory to stdout.
//
void print_current_directory(void) {
    char pathname[MAX_PATH_LEN];
    getcwd(pathname, sizeof pathname);
    printf("Current directory is: %s\n", pathname);
}

//
//  Changes directory to the given path.
//
void change_directory(char dest_directory[MAX_PATH_LEN]) {

    // expand ~ into the user's home directory, 
    // using the HOME environment variable.
    if (*dest_directory == '~') {
        char *home = getenv("HOME");
        if (chdir(home) != 0) {
            printf("%s", MSG_ERROR_CHANGE_DIR);
            return;
        }
        printf("%s %s\n", "Moving to", home);
    } else {
        if (chdir(dest_directory) != 0) {
            printf("%s", MSG_ERROR_CHANGE_DIR);
            return;
        } 
        printf("%s %s\n", "Moving to", dest_directory);
    }
}

//
//  Lists the contents of the current directory to stdout.
//
void list_current_directory(void) {
    char pathname[MAX_PATH_LEN];
    getcwd(pathname, sizeof pathname);
    DIR *curr_dir = opendir(pathname);

    struct dirent *pointer_to_dirent;
    char *file_names[MAX_NUM_FINDS];
    int index = 0;
    // makes an array of strings out of files names in the current working directory
    while ((pointer_to_dirent = readdir(curr_dir)) != NULL) {   
        file_names[index] = pointer_to_dirent->d_name;
        index++;
    }

    // sorting files names lexographically
    sort_by_name(file_names, index);

    // traversing through files in the array of files names 
    for (int file = 0; file < index; file++) 
    {
        // Create a structure s
        struct stat s;
        if (stat(file_names[file], &s) != 0) {
            printf("%s", MSG_ERROR_FILE_STAT);
            return;
        }
        // printing its permissions
        print_permissions(s);
        printf("\t%s\n", file_names[file]);
    }

    closedir(curr_dir);
}


//////////////////////////////////////////////
//                                          //
//              SUBSET 1                    //
//                                          //
//////////////////////////////////////////////
bool test_can_encrypt(char filename[MAX_PATH_LEN]) {

    // first pre-requisite
    // the file must exist 
    int file_exists = true;
    struct stat buffer;
    if (stat(filename, &buffer) != 0) {
        file_exists = false;
        printf("%s", MSG_ERROR_FILE_STAT);
        return file_exists;
    };

    // second pre-requisite
    // target must be a regular file
    int if_regular_file = true;
    if (S_ISDIR(buffer.st_mode)) {
        if_regular_file = false;
        printf(MSG_ERROR_DIRECTORY, filename);
        return if_regular_file;
    }

    // third pre-requisite
    // group must be able to write in the directory ****
    // group must be able to read the file
    int if_grp_can_read = true;
    if (!(buffer.st_mode &S_IRGRP)) {
        if_grp_can_read = false;
        printf(MSG_ERROR_READ, filename);
        return if_grp_can_read;
    }

    // fourth pre-requisite
    // might have to change to see if directory has writing permissions
    // getcwd and stat
    // Hi, one way to do this is calling stat() on the target directory. Recall that everything is a "file" in unix. Hope that helps!
    // group must have permissiosn to write
    int if_grp_can_write_in_dir = true;
     
    // for filenames that are in the current directory
    struct stat buffer_for_curr_dir;
    stat(".", &buffer_for_curr_dir);
    FILE *output_stream = fopen(filename, "r");
    if (output_stream == NULL) {
        if_grp_can_write_in_dir = false;
        printf("%s", MSG_ERROR_FILE_OPEN);
        return if_grp_can_write_in_dir;
    }

    if (!(buffer_for_curr_dir.st_mode &S_IWGRP)) {
        if_grp_can_write_in_dir = false;
        printf(MSG_ERROR_WRITE, filename);
        return if_grp_can_write_in_dir;
    }
    
    // getting the directory name if the filename is given a previous directory
    char not_curr_dir_path_name[MAX_PATH_LEN];
    strcpy(not_curr_dir_path_name, filename);
    char delimiter = '/';
    int len;
    
    if( (len = my_strrchr(not_curr_dir_path_name, delimiter)) > 0){
        while ( not_curr_dir_path_name[len] != '\0'){
            not_curr_dir_path_name[len] = '\0';
        }
    }

    // getting the whole path of the directory 
    char pathname[MAX_PATH_LEN];
    getcwd(pathname, sizeof pathname);
    strcat(pathname, "/");
    strcat(pathname, not_curr_dir_path_name);
    
    struct stat buffer_for_not_curr_dir;
    stat(pathname, &buffer_for_not_curr_dir);
    if (!(buffer_for_not_curr_dir.st_mode &S_IWGRP)) {
        if_grp_can_write_in_dir = false;
        printf(MSG_ERROR_WRITE, filename);
        return if_grp_can_write_in_dir;
    }
    
    return true;    
}

void simple_xor_encryption(char filename[MAX_PATH_LEN]) {
    if (!test_can_encrypt(filename)) return;

    // opens the files to read bytes from
    FILE *input_stream = fopen(filename, "r");
    if (input_stream == NULL) {
        printf("%s", MSG_ERROR_FILE_OPEN);
        return;
    }

    // opening file with .xor extension to write the encrypted bytes in
    FILE *xor_output_stream = fopen(strcat(filename, ".xor"), "w");

    // xor-ing the bytes (encryption) and subsequently writing them into .xor file
    xor_the_bytes(input_stream, xor_output_stream);
    fclose(input_stream);
    fclose(xor_output_stream);
}


void simple_xor_decryption(char filename[MAX_PATH_LEN]) {
    if (!test_can_encrypt(filename)) return;

    // opens the files to read bytes from
    FILE *input_stream = fopen(strcat(filename, ".xor"), "r");
    if (input_stream == NULL) {
        printf("%s", MSG_ERROR_FILE_OPEN);
        return;
    }

    // opening file with .dec extension to write the encrypted bytes in
    FILE *xor_output_decrypt_stream = fopen(strcat(filename, ".dec"), "w");

    // xor-ing the bytes again (decryption) and subsequently writing them into .dec file
    xor_the_bytes(input_stream, xor_output_decrypt_stream);
    fclose(input_stream);
    fclose(xor_output_decrypt_stream);
}


//////////////////////////////////////////////
//                                          //
//              SUBSET 2                    //
//                                          //
//////////////////////////////////////////////
void search_by_filename(char filename[MAX_SEARCH_LENGTH]) {
    // ERROR CASES
    // if user enters an empty string
    if (strcmp(filename, "") == 0) {
        printf("%s", MSG_ERROR_SEARCH);
        return;
    }

    // if user searches '.' or '..', print error
    if (strcmp(filename, ".") == 0 ||
        strcmp(filename, "..") == 0) {
        printf("%s", MSG_ERROR_RESERVED);
        return;
    }
    
    char *filenames[MAX_PATH_LEN];
    int index = 0;
    int *index_ptr = &index;
    read_given_dir_for_substring_search("./", filename, filenames, index_ptr);
    sort_by_name(filenames, *index_ptr);
    for (int i = 0; i < *index_ptr; i++) {
        print_permissions_new(filenames[i]);
        printf("\t%s\n", filenames[i]);
    }
    
}

void search_by_text(char text[MAX_SEARCH_LENGTH]) {
    printf("TODO: COMPLETE ME\n");
    exit(1);
}


//////////////////////////////////////////////
//                                          //
//              SUBSET 3                    //
//                                          //
//////////////////////////////////////////////
void electronic_codebook_encryption(char filename[MAX_PATH_LEN], char password[CIPHER_BLOCK_SIZE + 1]) {
    if (!test_can_encrypt(filename)) return;
    
    printf("TODO: COMPLETE ME\n");
    exit(1);
}

void electronic_codebook_decryption(char filename[MAX_PATH_LEN], char password[CIPHER_BLOCK_SIZE + 1]) {
    if (!test_can_encrypt(filename)) return;

    printf("TODO: COMPLETE ME\n");
    exit(1);
}

char *shift_encrypt(char *plaintext, char *password) {
    printf("TODO: COMPLETE ME\n");
    exit(1);
    return NULL;
}

char *shift_decrypt(char *ciphertext, char *password) {
    printf("TODO: COMPLETE ME\n");
    exit(1);
    return NULL;
}


//////////////////////////////////////////////
//                                          //
//              SUBSET 4                    //
//                                          //
//////////////////////////////////////////////
void cyclic_block_shift_encryption(char filename[MAX_PATH_LEN], char password[CIPHER_BLOCK_SIZE + 1]) {
    if (!test_can_encrypt(filename)) return;
    
    printf("TODO: COMPLETE ME\n");
    exit(1);
}

void cyclic_block_shift_decryption(char filename[MAX_PATH_LEN], char password[CIPHER_BLOCK_SIZE + 1]) {
    if (!test_can_encrypt(filename)) return;
    
    printf("TODO: COMPLETE ME\n");
    exit(1);
}


// PROVIDED FUNCTIONS, DO NOT MODIFY

// Generates a random string of length RAND_STR_LEN.
// Requires a seed for the random number generator.
// The same seed will always generate the same string.
// The string contains only lowercase + uppercase letters,
// and digits 0 through 9.
// The string is returned in heap-allocated memory,
// and must be freed by the caller.
char *generate_random_string(int seed) {
    if (seed != 0) {
        srand(seed);
    }

    char *alpha_num_str =
            "abcdefghijklmnopqrstuvwxyz"
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            "0123456789";

    char *random_str = malloc(RAND_STR_LEN);

    for (int i = 0; i < RAND_STR_LEN; i++) {
        random_str[i] = alpha_num_str[rand() % (strlen(alpha_num_str) - 1)];
    }

    return random_str;
}

// Sorts the given array (in-place) of files with
// associated counts into descending order of counts.
// You must provide the size of the array as argument `n`.
void sort_by_count(struct text_find *files, size_t n) {
    if (n == 0 || n == 1) return;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (files[j].count < files[j + 1].count) {
                struct text_find temp = files[j];
                files[j] = files[j + 1];
                files[j + 1] = temp;
            } else if (files[j].count == files[j + 1].count && strcmp(files[j].path, files[j + 1].path) > 0) {
                struct text_find temp = files[j];
                files[j] = files[j + 1];
                files[j + 1] = temp;
            }
        }
    }
}

// Sorts the given array (in-place) of strings alphabetically.
// You must provide the size of the array as argument `n`.
void sort_by_name(char *filenames[], size_t num_filenames) {
    if (num_filenames == 0 || num_filenames == 1) return;
    for (int i = 0; i < num_filenames - 1; i++) {
        for (int j = 0; j < num_filenames - i - 1; j++) {
            if (strcmp(filenames[j], filenames[j + 1]) > 0) {
                char *temp = filenames[j];
                filenames[j] = filenames[j + 1];
                filenames[j + 1] = temp;
            }
        }
    }
}

// print permissions of the struct stat for a file passed
void print_permissions(struct stat name) {
    // Print file permissions
    printf((S_ISDIR(name.st_mode)) ? "d" : "-");
    printf((name.st_mode &S_IRUSR) ? "r" : "-");
    printf((name.st_mode &S_IWUSR) ? "w" : "-");
    printf((name.st_mode &S_IXUSR) ? "x" : "-");
    printf((name.st_mode &S_IRGRP) ? "r" : "-");
    printf((name.st_mode &S_IWGRP) ? "w" : "-");
    printf((name.st_mode &S_IXGRP) ? "x" : "-");
    printf((name.st_mode &S_IROTH) ? "r" : "-");
    printf((name.st_mode &S_IWOTH) ? "w" : "-");
    printf((name.st_mode &S_IXOTH) ? "x" : "-");
}

// saves a string until the last delimiter is found  
int my_strrchr(const char *ptr, const char delimiter){
    int i = 0;
    int ret = 0;

    while( ptr[i] != '\0' ){
        if ( ptr[i] == delimiter ){
            ret = i;
        }
        i++;
    }
    return ret;
}

// xors the bytes read from the input file
// and writes it in the output file
void xor_the_bytes(FILE *input_stream, FILE *output_stream) {
    int byte; 
    while ((byte = fgetc(input_stream)) != EOF) {
        int decrypted_encrypted_byte = byte ^ 0xFF;
        fputc(decrypted_encrypted_byte, output_stream);
    }
}

// function to read the directory name given and then see if the files in it have 
// the substring given

char** read_given_dir_for_substring_search(char pathname[MAX_PATH_LEN], char substring_to_check[MAX_SEARCH_LENGTH], char *filenames[], int *index_ptr) {
    
    if (strstr(pathname, substring_to_check) &&
        check_if_file_already_exists(pathname, filenames, index_ptr) != 1) {
        filenames[*index_ptr] = pathname;
        *index_ptr = *index_ptr + 1;
    }
    
    DIR *dirp = opendir(pathname);
    if (dirp == NULL) {
        printf("%s", MSG_ERROR_FILE_OPEN);
        return filenames;
    }
    
    struct dirent *de;
    while ((de = readdir(dirp)) != NULL) {
    
        // below in a function
        if (strcmp(de->d_name, ".") == 0 || strcmp(de->d_name, "..") == 0) {
            continue;
        }
        // we stat the file and get details
        char new_file_path[MAX_PATH_LEN];
        struct stat buffer;
        stat(de->d_name, &buffer);
        if (strstr(de->d_name, substring_to_check)) {
            if (strcmp(pathname, "./") == 0) {
                strcpy(new_file_path, pathname);
                strcat(new_file_path, de->d_name);
            }
            else {
                strcpy(new_file_path, pathname);
                strcat(new_file_path, "/");
                strcat(new_file_path, de->d_name);
            }
            if (check_if_file_already_exists(pathname, filenames, index_ptr) != 1) {
                filenames[*index_ptr] = new_file_path;
                *index_ptr = *index_ptr + 1;
            }
        }
        if (check_if_directory(new_file_path) == 1) {
            read_given_dir_for_substring_search(new_file_path, substring_to_check, filenames, index_ptr);
        }
    }
    closedir(dirp);
    return filenames;
}

void print_permissions_new(char filename[MAX_PATH_LEN]) {
    struct stat s;
    stat(filename, &s);
    print_permissions(s);
}

int check_if_directory(char filename[MAX_PATH_LEN]) {
    struct stat s;
    stat(filename, &s);
    if (S_ISDIR(s.st_mode)) {
        return 1;
    }
    return 0;
}

int check_if_file_already_exists(char filename[MAX_PATH_LEN], char* filenames[], int *index_ptr) {
    int isElementPresent = 0; 
    for (int i = 0; i < *index_ptr; i++) {
        
        if (strcmp(filenames[i], filename) == 0) {
            isElementPresent = 1;
            break;
        }
    }
    return isElementPresent;
}