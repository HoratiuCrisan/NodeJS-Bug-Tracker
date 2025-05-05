package utils

import "time"

// MeasureTime calculates the execution time of a method
//
// Parameters:
//	- methodName: The name of the method
//	- fn: The method
//
// Returns:
//	- T: The type of data returned by the method
//	- time.Duration: The execution time of the method
//	- error: An error that occured during the method execution
func MeasureTime[T any](methodName string, fn func() (T, error)) (T, time.Duration, error) {
	// Get the start timer of the method execution
	start := time.Now()

	// Execute the method
	result, err := fn()

	// Get the duration from the end timer and start timer of the method
	duration := time.Since(start)

	return result, duration, err
}
