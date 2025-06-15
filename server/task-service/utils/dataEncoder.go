package utils

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/horatiucrisan/task-service/model"
)

// EncodeData retrieves the data from the controller and encodes it into json format an returns it with the response
//
// Parameters:
//   - w: The response writer of the controlelr method
//   - r: The http request
//   - data: The data to be encoded
func EncodeData(w http.ResponseWriter, r *http.Request, data any) error {
	// Set the header type and the return status
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	encodedData := model.EncodedResponse{
		Success: true,
		Message: fmt.Sprintf("Data encoded successfully"),
		Data:    data,
	}

	// Encode the data into the JSON format and return it
	if err := json.NewEncoder(w).Encode(encodedData); err != nil {
		fmt.Printf("%+v", err)
		return err
	}

	return nil
}
