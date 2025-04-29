package utils

import "time"

func MeasureTime[T any](methodName string, fn func() (T, error)) (T, time.Duration, error) {
	start := time.Now()
	result, err := fn()
	duration := time.Since(start)

	return result, duration, err
}
