package utils

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

// ValidateBody retrieves data from the controller and validates it
//
// Parameters:
//   - r: The method request
//   - data: The data to be validated
//
// Returns:
//   - error: An error that occured during the validation process
func ValidateBody(r *http.Request, data any) error {
	// Encode the request body data into the data variable
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		fmt.Println(err)
		return err
	}
	// Validate the data structure
	return validate.Struct(data)
}

// ValidateParams retrieves the data from the controller and validates it
//
// Params:
//   - data: The method data to be validated
//
// Returns:
//   - error: An error that occured during the validation process
func ValidateParams(data any) error {
	// Validate the data structure
	return validate.Struct(data)
}
