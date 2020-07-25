#ifndef HTML_ENTITIES_H
#define HTML_ENTITIES_H

#include <stdlib.h>
#include <stdint.h>

const uint32_t MAX_NUM_ENTITY_VAL;

const size_t MAX_NUM_ENTITY_LEN;

int is_valid_numeric_entity(uint32_t entity_val);

const char* is_allowed_named_entity (register const char *str, register size_t len);

#endif

